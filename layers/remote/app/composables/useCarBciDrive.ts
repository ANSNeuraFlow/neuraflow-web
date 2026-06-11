import type { MaybeRefOrGetter } from 'vue';
import { onUnmounted, toValue, watch } from 'vue';

import { useBciController } from '~/composables/useBciController';

import {
  CAR_BCI_PREDICTION_INTERVAL_MS,
  CAR_BCI_STATE_KEYS,
  type CarBciConsensusPhase,
  type CarBciDriveMode,
  type CarBciSteerVote,
} from '../models/car-bci.domain';
import { BCI_MOVEMENT_IDS, type CarDirection, useCarState } from './useCarState';

function steerVoteToDirection(vote: CarBciSteerVote): CarDirection {
  return vote === 'left' ? 'left' : 'right';
}

function commandToVote(command: 'LEFT_HAND' | 'RIGHT_HAND'): CarBciSteerVote {
  return command === 'LEFT_HAND' ? 'left' : 'right';
}

/**
 * Maps live BCI predictions (local bridge or cloud ingress on the same WebSocket)
 * to predefined movement macros on the RC car bridge.
 *
 * In `consensus` mode each prediction window (2.5s) yields one vote; two matching votes
 * trigger a macro. A 1–1 split waits for a third vote to break the tie.
 */
export function useCarBciDrive(
  enabled: MaybeRefOrGetter<boolean> = true,
  driveMode: MaybeRefOrGetter<CarBciDriveMode> = 'instant',
) {
  const car = useCarState();
  const { onCommand } = useBciController();

  const consensusVotes = useState<CarBciSteerVote[]>(CAR_BCI_STATE_KEYS.consensusVotes, () => []);
  const consensusPhase = useState<CarBciConsensusPhase>(CAR_BCI_STATE_KEYS.consensusPhase, () => 'collecting');

  let intervalTimer: ReturnType<typeof setInterval> | null = null;
  let intervalLeftCount = 0;
  let intervalRightCount = 0;

  const clearIntervalTimer = () => {
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }
  };

  const resetConsensus = () => {
    consensusVotes.value = [];
    consensusPhase.value = 'collecting';
    intervalLeftCount = 0;
    intervalRightCount = 0;
  };

  const triggerMacro = (direction: CarDirection) => {
    if (!toValue(enabled)) return;
    const movementId = direction === 'left' ? BCI_MOVEMENT_IDS.left : BCI_MOVEMENT_IDS.right;
    car.runMovement(movementId);
  };

  const applyConsensusVote = (vote: CarBciSteerVote) => {
    const votes = [...consensusVotes.value, vote];
    const [first, second] = votes;

    if (votes.length === 2 && first !== undefined && first === second) {
      triggerMacro(steerVoteToDirection(first));
      resetConsensus();
      return;
    }

    if (votes.length === 2) {
      consensusVotes.value = votes;
      consensusPhase.value = 'tiebreak';
      return;
    }

    if (votes.length >= 3) {
      const leftCount = votes.filter((v) => v === 'left').length;
      const rightCount = votes.filter((v) => v === 'right').length;
      const winner: CarBciSteerVote = leftCount >= rightCount ? 'left' : 'right';
      triggerMacro(steerVoteToDirection(winner));
      resetConsensus();
      return;
    }

    consensusVotes.value = votes;
    consensusPhase.value = 'collecting';
  };

  const flushIntervalSample = () => {
    if (!toValue(enabled) || toValue(driveMode) !== 'consensus') return;

    let vote: CarBciSteerVote | null = null;
    if (intervalLeftCount > intervalRightCount) vote = 'left';
    else if (intervalRightCount > intervalLeftCount) vote = 'right';

    intervalLeftCount = 0;
    intervalRightCount = 0;

    if (vote) applyConsensusVote(vote);
  };

  const handleSteerCommand = (command: 'LEFT_HAND' | 'RIGHT_HAND') => {
    if (!toValue(enabled)) return;

    if (toValue(driveMode) === 'instant') {
      triggerMacro(command === 'LEFT_HAND' ? 'left' : 'right');
      return;
    }

    const vote = commandToVote(command);
    if (vote === 'left') intervalLeftCount++;
    else intervalRightCount++;
  };

  const syncIntervalTimer = () => {
    clearIntervalTimer();
    resetConsensus();

    if (!toValue(enabled) || toValue(driveMode) !== 'consensus') return;

    intervalTimer = setInterval(flushIntervalSample, CAR_BCI_PREDICTION_INTERVAL_MS);
  };

  onCommand('LEFT_HAND', () => handleSteerCommand('LEFT_HAND'));
  onCommand('RIGHT_HAND', () => handleSteerCommand('RIGHT_HAND'));

  watch([() => toValue(enabled), () => toValue(driveMode)], syncIntervalTimer, { immediate: true });

  onUnmounted(() => {
    clearIntervalTimer();
    resetConsensus();
  });

  return {
    consensusVotes,
    consensusPhase,
  };
}

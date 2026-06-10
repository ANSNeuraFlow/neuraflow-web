import type { MaybeRefOrGetter } from 'vue';
import { onUnmounted, toValue, watch } from 'vue';

import { useBciController } from '~/composables/useBciController';

import {
  CAR_BCI_PREDICTION_INTERVAL_MS,
  CAR_BCI_STATE_KEYS,
  CAR_BCI_STEER_HOLD_MS,
  type CarBciConsensusPhase,
  type CarBciDriveMode,
  type CarBciSteerVote,
} from '../models/car-bci.domain';
import { type CarDirection, useCarState } from './useCarState';

const BCI_STEER_COMMANDS: Record<'LEFT_HAND' | 'RIGHT_HAND', CarDirection> = {
  LEFT_HAND: 'left',
  RIGHT_HAND: 'right',
};

function steerVoteToDirection(vote: CarBciSteerVote): CarDirection {
  return vote === 'left' ? 'left' : 'right';
}

function commandToVote(command: 'LEFT_HAND' | 'RIGHT_HAND'): CarBciSteerVote {
  return command === 'LEFT_HAND' ? 'left' : 'right';
}

/**
 * Maps live BCI predictions (local bridge or cloud ingress on the same WebSocket)
 * to RC car bridge commands — same max-steer / max-off throttle semantics as manual d-pad.
 *
 * In `consensus` mode each prediction window (2.5s) yields one vote; two matching votes
 * trigger a steer pulse. A 1–1 split waits for a third vote to break the tie.
 */
export function useCarBciDrive(
  enabled: MaybeRefOrGetter<boolean> = true,
  driveMode: MaybeRefOrGetter<CarBciDriveMode> = 'instant',
) {
  const car = useCarState();
  const { onCommand } = useBciController();

  const consensusVotes = useState<CarBciSteerVote[]>(CAR_BCI_STATE_KEYS.consensusVotes, () => []);
  const consensusPhase = useState<CarBciConsensusPhase>(CAR_BCI_STATE_KEYS.consensusPhase, () => 'collecting');

  let steerResetTimer: ReturnType<typeof setTimeout> | null = null;
  let intervalTimer: ReturnType<typeof setInterval> | null = null;
  let intervalLeftCount = 0;
  let intervalRightCount = 0;

  const clearSteerResetTimer = () => {
    if (steerResetTimer) {
      clearTimeout(steerResetTimer);
      steerResetTimer = null;
    }
  };

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

  const pulseSteer = (direction: CarDirection) => {
    if (!toValue(enabled)) return;
    car.move(direction);
    clearSteerResetTimer();
    steerResetTimer = setTimeout(() => {
      car.releaseSteer();
      steerResetTimer = null;
    }, CAR_BCI_STEER_HOLD_MS);
  };

  const applyConsensusVote = (vote: CarBciSteerVote) => {
    const votes = [...consensusVotes.value, vote];
    const [first, second] = votes;

    if (votes.length === 2 && first !== undefined && first === second) {
      pulseSteer(steerVoteToDirection(first));
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
      pulseSteer(steerVoteToDirection(winner));
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
      pulseSteer(BCI_STEER_COMMANDS[command]);
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
    clearSteerResetTimer();
    clearIntervalTimer();
    resetConsensus();
  });

  return {
    consensusVotes,
    consensusPhase,
  };
}

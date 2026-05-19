import { type Ref, ref } from 'vue';

export type NeuroBalanceState = 'ready' | 'active' | 'recovering' | 'complete';
export type SessionDuration = 5 | 10 | 15;

export interface NeuroBalanceConfig {
  durationMinutes: SessionDuration;
}

export const SESSION_DURATIONS: SessionDuration[] = [5, 10, 15];

const MAX_DELTA_MS = 100;

const INSTABILITY_GAIN = 0.16;

const CENTER_NOISE_ACCEL = 0.00012;

const DAMPING_PER_SECOND = 0.4;

const BCI_IMPULSE = 0.018;

export const RECOVER_THRESHOLD = 0.88;

const FOCUS_THRESHOLD = 0.32;

const RECOVERY_MS = 3000;

function lerpColor(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number) {
  return {
    r: Math.round(r1 + (r2 - r1) * t),
    g: Math.round(g1 + (g2 - g1) * t),
    b: Math.round(b1 + (b2 - b1) * t),
  };
}

let cachedColor = 'rgb(128, 128, 128)';
let colorBase = { r: 128, g: 128, b: 128 };
let frameCount = 0;

function parseRGB(colorStr: string) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match && match[1] && match[2] && match[3]) {
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
  }
  return { r: 128, g: 128, b: 128 };
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  visualX: number,
  absPos: number,
  timestamp: number,
  recoveringFraction: number,
) {
  if (frameCount++ % 60 === 0) {
    cachedColor = getComputedStyle(canvas).color || 'rgb(128, 128, 128)';
    colorBase = parseRGB(cachedColor);
  }

  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H * 0.48;

  const yFunnelTop = 0;
  const yFunnelBase = H;
  const baseHalfW = W * 0.4 * FOCUS_THRESHOLD;

  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.fillStyle = `rgba(${colorBase.r}, ${colorBase.g}, ${colorBase.b}, 0.03)`;
  ctx.beginPath();
  ctx.moveTo(0, yFunnelTop);
  ctx.lineTo(cx - baseHalfW, yFunnelBase);
  ctx.lineTo(0, yFunnelBase);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(W, yFunnelTop);
  ctx.lineTo(W, yFunnelBase);
  ctx.lineTo(cx + baseHalfW, yFunnelBase);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, yFunnelTop);
  ctx.lineTo(W, yFunnelTop);
  ctx.lineTo(cx + baseHalfW, yFunnelBase);
  ctx.lineTo(cx - baseHalfW, yFunnelBase);
  ctx.closePath();
  const funnelFill = ctx.createLinearGradient(0, yFunnelTop, 0, yFunnelBase);
  funnelFill.addColorStop(0, `rgba(${colorBase.r}, ${colorBase.g}, ${colorBase.b}, 0.05)`);
  funnelFill.addColorStop(1, `rgba(${colorBase.r}, ${colorBase.g}, ${colorBase.b}, 0.01)`);
  ctx.fillStyle = funnelFill;
  ctx.fill();
  ctx.restore();

  const t = Math.min(1, absPos / RECOVER_THRESHOLD);
  const { r, g, b } = lerpColor(colorBase.r, colorBase.g, colorBase.b, 249, 115, 22, t * 0.7);
  const color = `rgb(${r},${g},${b})`;

  const sphereX = cx + visualX * W * 0.4;
  const sphereR = Math.min(W, H) * 0.052;

  ctx.save();
  ctx.strokeStyle = `rgba(${colorBase.r}, ${colorBase.g}, ${colorBase.b}, 0.15)`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 10]);
  ctx.beginPath();
  ctx.moveTo(cx, yFunnelTop);
  ctx.lineTo(cx, yFunnelBase);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const anchorY = H * 0.76;
  ctx.save();
  ctx.strokeStyle = `rgba(${r},${g},${b},0.35)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, anchorY);
  ctx.lineTo(sphereX, cy);
  ctx.stroke();
  ctx.restore();

  const pulse = 1 + Math.sin(timestamp / 1400) * 0.06;
  const glowR = sphereR * 4.5 * pulse;
  const glow = ctx.createRadialGradient(sphereX, cy, 0, sphereX, cy, glowR);
  glow.addColorStop(0, `rgba(${r},${g},${b},0.12)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(sphereX - glowR, cy - glowR, glowR * 2, glowR * 2);

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  const sg = ctx.createRadialGradient(
    sphereX - sphereR * 0.32,
    cy - sphereR * 0.32,
    sphereR * 0.1,
    sphereX,
    cy,
    sphereR,
  );

  sg.addColorStop(0, `rgba(${colorBase.r}, ${colorBase.g}, ${colorBase.b}, 0.8)`);
  sg.addColorStop(1, color);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(sphereX, cy, sphereR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (recoveringFraction > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(${colorBase.r}, ${colorBase.g}, ${colorBase.b}, ${0.5 * recoveringFraction})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

export function useNeuroBalance(canvasRef: Ref<HTMLCanvasElement | null>, getConfig: () => NeuroBalanceConfig) {
  const exerciseState = ref<NeuroBalanceState>('ready');
  const focusTime = ref(0);
  const bestStreak = ref(0);
  const sessionTime = ref(0);
  const physicsPosition = ref(0);
  const recoverySecondsRemaining = ref(0);

  let position = 0;
  let velocity = 0;
  let visualX = 0;

  let pendingImpulse = 0;

  let recoveringTimer = 0;
  let sessionStart = 0;
  let focusStart: number | null = null;
  let currentStreak = 0;

  let animId: number | null = null;
  let lastTs = 0;

  function applyRight(confidence: number) {
    if (exerciseState.value !== 'active') return;
    pendingImpulse += BCI_IMPULSE * confidence;
  }

  function applyLeft(confidence: number) {
    if (exerciseState.value !== 'active') return;
    pendingImpulse -= BCI_IMPULSE * confidence;
  }

  function maxSessionMs() {
    return getConfig().durationMinutes * 60 * 1000;
  }

  function seedInstabilityStart() {
    const sign = Math.random() < 0.5 ? -1 : 1;
    position = sign * 0.008;
    velocity = sign * 0.02;
    physicsPosition.value = position;
  }

  function loop(ts: number) {
    const canvas = canvasRef.value;
    if (!canvas) {
      animId = requestAnimationFrame(loop);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animId = requestAnimationFrame(loop);
      return;
    }

    const dt = lastTs > 0 ? Math.min(ts - lastTs, MAX_DELTA_MS) : 16.67;
    const dt_s = dt / 1000;
    lastTs = ts;

    if (exerciseState.value === 'active') {
      const elapsedMs = ts - sessionStart;

      if (elapsedMs >= maxSessionMs()) {
        exerciseState.value = 'complete';
        focusStart = null;
      } else {
        const noise = (Math.random() * 2 - 1) * CENTER_NOISE_ACCEL;
        const accel = position * INSTABILITY_GAIN + noise;
        velocity += accel * dt_s;
        velocity += pendingImpulse;
        pendingImpulse = 0;

        velocity *= Math.pow(DAMPING_PER_SECOND, dt_s);

        position = Math.max(-1, Math.min(1, position + velocity * dt_s));
        physicsPosition.value = position;

        sessionTime.value = Math.floor(elapsedMs / 1000);

        if (Math.abs(position) < FOCUS_THRESHOLD) {
          if (focusStart === null) focusStart = ts;
          currentStreak = Math.floor((ts - focusStart) / 1000);
          focusTime.value = currentStreak;
          if (currentStreak > bestStreak.value) bestStreak.value = currentStreak;
        } else {
          focusStart = null;
          focusTime.value = 0;
        }

        if (Math.abs(position) >= RECOVER_THRESHOLD) {
          exerciseState.value = 'recovering';
          recoveringTimer = 0;
          focusStart = null;
          currentStreak = 0;
          focusTime.value = 0;
        }
      }
    }

    if (exerciseState.value === 'recovering') {
      recoveringTimer += dt;
      recoverySecondsRemaining.value = Math.max(0, Math.ceil((RECOVERY_MS - recoveringTimer) / 1000));
      if (recoveringTimer >= RECOVERY_MS) {
        seedInstabilityStart();
        exerciseState.value = 'active';
        recoverySecondsRemaining.value = 0;
      }
    } else {
      recoverySecondsRemaining.value = 0;
    }

    if (exerciseState.value === 'active' || exerciseState.value === 'recovering') {
      visualX += (position - visualX) * (1 - Math.exp(-8 * dt_s));
    } else if (exerciseState.value === 'ready') {
      visualX += (0 - visualX) * (1 - Math.exp(-8 * dt_s));
    }

    const recoveringFraction = exerciseState.value === 'recovering' ? Math.min(1, recoveringTimer / 400) : 0;

    drawScene(ctx, canvas, visualX, Math.abs(position), ts, recoveringFraction);

    animId = requestAnimationFrame(loop);
  }

  function initialize() {
    stop();
    position = 0;
    velocity = 0;
    visualX = 0;
    physicsPosition.value = 0;
    pendingImpulse = 0;
    exerciseState.value = 'ready';
    focusTime.value = 0;
    bestStreak.value = 0;
    sessionTime.value = 0;
    focusStart = null;
    currentStreak = 0;
    lastTs = 0;
    recoverySecondsRemaining.value = 0;
    animId = requestAnimationFrame(loop);
  }

  function startExercise() {
    sessionStart = performance.now();
    exerciseState.value = 'active';
    seedInstabilityStart();
  }

  function stop() {
    if (animId !== null) {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }

  function handleResize() {
    visualX = position;
  }

  return {
    exerciseState,
    focusTime,
    bestStreak,
    sessionTime,
    physicsPosition,
    recoverySecondsRemaining,
    applyLeft,
    applyRight,
    initialize,
    startExercise,
    stop,
    handleResize,
  };
}

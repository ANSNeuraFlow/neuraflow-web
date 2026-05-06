import { computed, type Ref, ref } from 'vue';

export type ForwardGateState = 'ready' | 'active' | 'complete';
export type SessionDuration = 5 | 10 | 15;

export const SESSION_DURATIONS: SessionDuration[] = [5, 10, 15];

export interface ForwardGateConfig {
  durationMinutes: SessionDuration;
}

/** Half-width of the gap in track units (× track half-width). Fixed — tuned for slow BCI steering. */
const FIXED_GAP_HALF_WIDTH = 0.36;

interface Gate {
  id: number;
  scrollY: number;
  gapCenter: number;
  gapHalfWidth: number;
  passed: boolean;
  passedSuccess: boolean | null;
  passedAt: number;
}

const MAX_DELTA_MS = 100;
const DAMPING_PER_SECOND = 0.4;
const BCI_IMPULSE = 0.018;
const MAX_POSITION = 0.95;

const BALL_Y_FRACTION = 0.82;
const TRACK_HALF_W_FRACTION = 0.4;
const WALL_THICKNESS = 22;
const FORWARD_SPEED_FRACTION = 0.2;
const WALL_SPACING_FRACTION = 0.6;
const SPHERE_FRACTION = 0.046;

const FLASH_DURATION_MS = 700;
const SCAN_LINE_SPACING = 55;

let gateSeq = 0;
let cachedCssColor = 'rgb(128, 128, 128)';
let colorBase = { r: 128, g: 128, b: 128 };
let frameTick = 0;

function parseRgb(s: string) {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (m?.[1] && m?.[2] && m?.[3]) return { r: parseInt(m[1]), g: parseInt(m[2]), b: parseInt(m[3]) };
  return { r: 128, g: 128, b: 128 };
}

function spawnGate(scrollY: number): Gate {
  const range = 0.66 - FIXED_GAP_HALF_WIDTH;
  const gapCenter = (Math.random() * 2 - 1) * Math.max(0.02, range);
  return {
    id: gateSeq++,
    scrollY,
    gapCenter,
    gapHalfWidth: FIXED_GAP_HALF_WIDTH,
    passed: false,
    passedSuccess: null,
    passedAt: 0,
  };
}

function resolveActiveGateId(gates: Gate[]): number | null {
  let best: number | null = null;
  let maxY = -Infinity;
  for (const g of gates) {
    if (g.passed) continue;
    if (g.scrollY > maxY) {
      maxY = g.scrollY;
      best = g.id;
    }
  }
  return best;
}

function pickActiveGate(gates: Gate[]): Gate | undefined {
  let best: Gate | undefined;
  let maxY = -Infinity;
  for (const g of gates) {
    if (g.passed) continue;
    if (g.scrollY > maxY) {
      maxY = g.scrollY;
      best = g;
    }
  }
  return best;
}

interface DrawSceneParams {
  visualX: number;
  gates: Gate[];
  activeGateId: number | null;
  ballYPx: number;
  trackHalfW: number;
  sphereR: number;
  isInGap: boolean;
  timestamp: number;
  flashTimer: number;
  flashSuccess: boolean;
}

function drawScene(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, p: DrawSceneParams) {
  if (frameTick++ % 60 === 0) {
    cachedCssColor = getComputedStyle(canvas).color || 'rgb(128, 128, 128)';
    colorBase = parseRgb(cachedCssColor);
  }

  const cb = colorBase;
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const { trackHalfW, sphereR, ballYPx, visualX } = p;

  ctx.clearRect(0, 0, W, H);

  const speed = H * FORWARD_SPEED_FRACTION;
  const offset = ((p.timestamp * speed) / 1000) % SCAN_LINE_SPACING;
  ctx.save();
  ctx.strokeStyle = `rgba(${cb.r}, ${cb.g}, ${cb.b}, 0.022)`;
  ctx.lineWidth = 1;
  for (let y = offset - SCAN_LINE_SPACING; y < H; y += SCAN_LINE_SPACING) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = `rgba(${cb.r}, ${cb.g}, ${cb.b}, 0.1)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 12]);
  for (const rx of [cx - trackHalfW, cx + trackHalfW]) {
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx, H);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = `rgba(${cb.r}, ${cb.g}, ${cb.b}, 0.09)`;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 10]);
  ctx.beginPath();
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, H);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  for (const gate of p.gates) {
    const gy = gate.scrollY;
    if (gy < -WALL_THICKNESS * 2 || gy > H + WALL_THICKNESS * 2) continue;

    const gapLeft = cx + (gate.gapCenter - gate.gapHalfWidth) * trackHalfW;
    const gapRight = cx + (gate.gapCenter + gate.gapHalfWidth) * trackHalfW;
    const top = gy - WALL_THICKNESS / 2;

    let wallAlpha = 0.55;
    let flashFrac = 0;
    if (gate.passed && gate.passedAt > 0) {
      const age = (p.timestamp - gate.passedAt) / FLASH_DURATION_MS;
      wallAlpha = Math.max(0, 0.55 * (1 - age));
      flashFrac = Math.max(0, 1 - age);
    }

    ctx.save();
    ctx.fillStyle = `rgba(${cb.r}, ${cb.g}, ${cb.b}, ${wallAlpha})`;
    ctx.fillRect(0, top, gapLeft, WALL_THICKNESS);
    ctx.fillRect(gapRight, top, W - gapRight, WALL_THICKNESS);

    // Aiming feedback: only the active gate’s gap (never multiple walls)
    if (gate.id === p.activeGateId && p.isInGap) {
      ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
      ctx.fillRect(gapLeft, top, gapRight - gapLeft, WALL_THICKNESS);
    }

    // Miss only — no green strip on success (avoids stacking with next gate highlight)
    if (gate.passed && flashFrac > 0 && gate.passedSuccess === false) {
      ctx.fillStyle = `rgba(249, 115, 22, ${flashFrac * 0.3})`;
      ctx.fillRect(gapLeft, top, gapRight - gapLeft, WALL_THICKNESS);
    }

    ctx.restore();
  }

  const ballX = cx + visualX * trackHalfW;
  const br = p.isInGap ? 74 : cb.r;
  const bg = p.isInGap ? 222 : cb.g;
  const bb = p.isInGap ? 128 : cb.b;

  const pulse = 1 + Math.sin(p.timestamp / 1200) * 0.055;
  const glowR = sphereR * 4 * pulse;
  const glow = ctx.createRadialGradient(ballX, ballYPx, 0, ballX, ballYPx, glowR);
  glow.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, 0.13)`);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(ballX - glowR, ballYPx - glowR, glowR * 2, glowR * 2);

  ctx.save();
  ctx.shadowColor = `rgb(${br}, ${bg}, ${bb})`;
  ctx.shadowBlur = 22;
  const sg = ctx.createRadialGradient(
    ballX - sphereR * 0.32,
    ballYPx - sphereR * 0.32,
    sphereR * 0.1,
    ballX,
    ballYPx,
    sphereR,
  );
  sg.addColorStop(0, `rgba(${cb.r}, ${cb.g}, ${cb.b}, 0.85)`);
  sg.addColorStop(1, `rgb(${br}, ${bg}, ${bb})`);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(ballX, ballYPx, sphereR, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (p.flashTimer > 0) {
    const opacity = (p.flashTimer / FLASH_DURATION_MS) * (p.flashSuccess ? 0.08 : 0.14);
    ctx.save();
    ctx.fillStyle = p.flashSuccess ? `rgba(74, 222, 128, ${opacity})` : `rgba(249, 115, 22, ${opacity})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

export function useForwardGate(canvasRef: Ref<HTMLCanvasElement | null>, getConfig: () => ForwardGateConfig) {
  const exerciseState = ref<ForwardGateState>('ready');
  const sessionTime = ref(0);
  const successfulPasses = ref(0);
  const failedPasses = ref(0);
  const isInGap = ref(false);
  const directionChanges = ref(0);

  const totalGates = computed(() => successfulPasses.value + failedPasses.value);
  const passRate = computed(() => (totalGates.value > 0 ? successfulPasses.value / totalGates.value : 0));

  let position = 0;
  let velocity = 0;
  let visualX = 0;
  let pendingImpulse = 0;
  let lastImpulseSign = 0;

  const gates: Gate[] = [];
  let sessionStart = 0;
  let animId: number | null = null;
  let lastTs = 0;
  let flashTimer = 0;
  let flashSuccess = false;

  function maxSessionMs() {
    return getConfig().durationMinutes * 60 * 1000;
  }

  function applyRight(confidence: number) {
    if (exerciseState.value !== 'active') return;
    if (lastImpulseSign === -1) directionChanges.value++;
    lastImpulseSign = 1;
    pendingImpulse += BCI_IMPULSE * confidence;
  }

  function applyLeft(confidence: number) {
    if (exerciseState.value !== 'active') return;
    if (lastImpulseSign === 1) directionChanges.value++;
    lastImpulseSign = -1;
    pendingImpulse -= BCI_IMPULSE * confidence;
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

    const W = canvas.width;
    const H = canvas.height;
    const trackHalfW = W * TRACK_HALF_W_FRACTION;
    const sphereR = Math.min(W, H) * SPHERE_FRACTION;
    const ballYPx = H * BALL_Y_FRACTION;
    const forwardSpeedPx = H * FORWARD_SPEED_FRACTION;
    const wallSpacingPx = H * WALL_SPACING_FRACTION;

    if (exerciseState.value === 'active') {
      const elapsedMs = ts - sessionStart;

      if (elapsedMs >= maxSessionMs()) {
        exerciseState.value = 'complete';
      } else {
        velocity += pendingImpulse;
        pendingImpulse = 0;
        velocity *= Math.pow(DAMPING_PER_SECOND, dt_s);
        position = Math.max(-MAX_POSITION, Math.min(MAX_POSITION, position + velocity * dt_s));
        sessionTime.value = Math.floor(elapsedMs / 1000);

        for (const gate of gates) {
          gate.scrollY += forwardSpeedPx * dt_s;
        }

        const lastGate = gates[gates.length - 1];
        if (!lastGate || lastGate.scrollY >= -WALL_THICKNESS + wallSpacingPx) {
          gates.push(spawnGate(-WALL_THICKNESS));
        }

        const activeGate = pickActiveGate(gates);

        if (activeGate) {
          const ballXPx = position * trackHalfW;
          const gapCenterPx = activeGate.gapCenter * trackHalfW;
          const gapHalfPx = activeGate.gapHalfWidth * trackHalfW;
          const inGap = ballXPx - sphereR >= gapCenterPx - gapHalfPx && ballXPx + sphereR <= gapCenterPx + gapHalfPx;

          isInGap.value = inGap;

          if (activeGate.scrollY >= ballYPx) {
            activeGate.passed = true;
            activeGate.passedSuccess = inGap;
            activeGate.passedAt = ts;
            isInGap.value = false;

            if (inGap) successfulPasses.value++;
            else failedPasses.value++;

            flashTimer = FLASH_DURATION_MS;
            flashSuccess = inGap;
          }
        } else {
          isInGap.value = false;
        }

        while (gates.length > 0 && gates[0]!.scrollY > H + WALL_THICKNESS * 3) {
          gates.shift();
        }
      }
    }

    if (flashTimer > 0) flashTimer = Math.max(0, flashTimer - dt);

    if (exerciseState.value === 'active') {
      visualX += (position - visualX) * (1 - Math.exp(-8 * dt_s));
    } else if (exerciseState.value === 'ready') {
      visualX += (0 - visualX) * (1 - Math.exp(-8 * dt_s));
    }

    drawScene(ctx, canvas, {
      visualX,
      gates,
      activeGateId: resolveActiveGateId(gates),
      ballYPx,
      trackHalfW,
      sphereR,
      isInGap: isInGap.value,
      timestamp: ts,
      flashTimer,
      flashSuccess,
    });

    animId = requestAnimationFrame(loop);
  }

  function initialize() {
    stop();
    gateSeq = 0;
    position = 0;
    velocity = 0;
    visualX = 0;
    pendingImpulse = 0;
    lastImpulseSign = 0;
    exerciseState.value = 'ready';
    sessionTime.value = 0;
    successfulPasses.value = 0;
    failedPasses.value = 0;
    isInGap.value = false;
    directionChanges.value = 0;
    gates.length = 0;
    flashTimer = 0;
    lastTs = 0;
    animId = requestAnimationFrame(loop);
  }

  function startExercise() {
    sessionStart = performance.now();
    exerciseState.value = 'active';
    gates.push(spawnGate(-WALL_THICKNESS));
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
    sessionTime,
    successfulPasses,
    failedPasses,
    totalGates,
    passRate,
    isInGap,
    directionChanges,
    applyLeft,
    applyRight,
    initialize,
    startExercise,
    stop,
    handleResize,
  };
}

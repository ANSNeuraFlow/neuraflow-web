import { type Ref, ref } from 'vue';

export type DifficultyPreset = 'easy' | 'medium' | 'hard';
export type GameState = 'ready' | 'playing' | 'gameover';

export interface DodgeGameConfig {
  difficulty: DifficultyPreset;
}

export const LANE_COUNT = 4;
export const DIFFICULTY_PRESETS: DifficultyPreset[] = ['easy', 'medium', 'hard'];

interface Obstacle {
  lane: number;
  y: number;
  colorIdx: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

const DIFFICULTY_SETTINGS = {
  easy: { basePxPerMs: 0.09, spawnIntervalMs: 1900, maxMult: 2.0, growth: 0.00008 },
  medium: { basePxPerMs: 0.14, spawnIntervalMs: 1350, maxMult: 3.0, growth: 0.00016 },
  hard: { basePxPerMs: 0.21, spawnIntervalMs: 920, maxMult: 4.2, growth: 0.0003 },
} as const;

const OBSTACLE_COLORS = [
  { base: '#ff6b9d', shadow: 'rgba(255,107,157,0.8)' },
  { base: '#ff9f43', shadow: 'rgba(255,159,67,0.8)' },
  { base: '#ffd93d', shadow: 'rgba(255,217,61,0.8)' },
  { base: '#6bcb77', shadow: 'rgba(107,203,119,0.8)' },
  { base: '#4d96ff', shadow: 'rgba(77,150,255,0.8)' },
  { base: '#c77dff', shadow: 'rgba(199,125,255,0.8)' },
] as const;

const MAX_DELTA_MS = 100;
const ROCKET_HW_FRAC = 0.14;
const ROCKET_RH_FRAC = 0.34;
const OBST_W_FRAC = 0.9;
const OBST_H_FRAC = 0.1;
const PLAYER_BOTTOM_OFFSET = 28;
const LANE_LERP_K = 24;

const laneW = (c: HTMLCanvasElement) => c.width / LANE_COUNT;
const laneCX = (c: HTMLCanvasElement, lane: number) => lane * laneW(c) + laneW(c) / 2;

const adjustHex = (hex: string, amt: number): string => {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + amt));
  return `rgb(${r},${g},${b})`;
};

const drawBackground = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, stars: Star[]) => {
  const g = ctx.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, '#0b0a2e');
  g.addColorStop(1, '#1c0a3c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, c.width, c.height);

  for (const s of stars) {
    ctx.save();
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const lw = laneW(c);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.setLineDash([6, 14]);
  ctx.lineWidth = 1.5;
  for (let i = 1; i < LANE_COUNT; i++) {
    ctx.beginPath();
    ctx.moveTo(i * lw, 0);
    ctx.lineTo(i * lw, c.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
};

const drawRocket = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, x: number, timestamp: number) => {
  const lw = laneW(c);
  const hw = lw * ROCKET_HW_FRAC;
  const rh = lw * ROCKET_RH_FRAC;
  const baseY = c.height - PLAYER_BOTTOM_OFFSET;
  const topY = baseY - rh;
  const flicker = (timestamp / 90) % (Math.PI * 2);

  ctx.save();

  const flameH = rh * 0.42 + Math.sin(flicker) * rh * 0.12;
  const fg = ctx.createLinearGradient(x, baseY, x, baseY + flameH);
  fg.addColorStop(0, '#ff8c00');
  fg.addColorStop(1, 'rgba(255,60,0,0)');
  ctx.fillStyle = fg;
  ctx.shadowColor = 'rgba(255,130,0,0.9)';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.moveTo(x - hw * 0.75, baseY);
  ctx.quadraticCurveTo(x - hw * 0.25, baseY + flameH * 0.7, x, baseY + flameH);
  ctx.quadraticCurveTo(x + hw * 0.25, baseY + flameH * 0.7, x + hw * 0.75, baseY);
  ctx.closePath();
  ctx.fill();

  const fi = ctx.createLinearGradient(x, baseY, x, baseY + flameH * 0.65);
  fi.addColorStop(0, '#fff200');
  fi.addColorStop(1, 'rgba(255,200,0,0)');
  ctx.fillStyle = fi;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x - hw * 0.32, baseY);
  ctx.quadraticCurveTo(x, baseY + flameH * 0.45, x, baseY + flameH * 0.65);
  ctx.quadraticCurveTo(x, baseY + flameH * 0.45, x + hw * 0.32, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0077b6';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(x - hw, baseY - rh * 0.3);
  ctx.lineTo(x - hw * 1.8, baseY);
  ctx.lineTo(x - hw, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + hw, baseY - rh * 0.3);
  ctx.lineTo(x + hw * 1.8, baseY);
  ctx.lineTo(x + hw, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = 'rgba(0,212,255,0.9)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#00b4d8';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - hw, baseY - rh * 0.85, hw * 2, rh * 0.76, hw * 0.38);
  } else {
    ctx.rect(x - hw, baseY - rh * 0.85, hw * 2, rh * 0.76);
  }
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(200,220,255,0.6)';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x - hw, topY + rh * 0.28);
  ctx.lineTo(x + hw, topY + rh * 0.28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#0d0d3b';
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(x, baseY - rh * 0.5, hw * 0.48, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath();
  ctx.arc(x - hw * 0.16, baseY - rh * 0.56, hw * 0.17, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

const obstacleSize = (c: HTMLCanvasElement) => {
  const lw = laneW(c);
  const w = lw * OBST_W_FRAC;
  const h = Math.max(9, lw * OBST_H_FRAC);
  return { lw, w, h };
};

const drawObstacle = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, obs: Obstacle) => {
  const { lw, w, h } = obstacleSize(c);
  const left = obs.lane * lw + (lw - w) / 2;
  const top = obs.y - h / 2;
  const r = Math.min(h * 0.45, 10);
  const color = OBSTACLE_COLORS[obs.colorIdx % OBSTACLE_COLORS.length];
  if (!color) return;

  ctx.save();
  ctx.shadowColor = color.shadow;
  ctx.shadowBlur = 14;
  const grad = ctx.createLinearGradient(left, top, left, top + h);
  grad.addColorStop(0, adjustHex(color.base, 45));
  grad.addColorStop(0.45, color.base);
  grad.addColorStop(1, adjustHex(color.base, -40));
  ctx.fillStyle = grad;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(left, top, w, h, r);
  } else {
    ctx.rect(left, top, w, h);
  }
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(left + w * 0.06, top + h * 0.12, w * 0.35, h * 0.22, h * 0.1);
  } else {
    ctx.rect(left + w * 0.06, top + h * 0.12, w * 0.35, h * 0.22);
  }
  ctx.fill();
  ctx.restore();
};

export const useDodgeGame = (canvasRef: Ref<HTMLCanvasElement | null>, getConfig: () => DodgeGameConfig) => {
  const gameState = ref<GameState>('ready');
  const isNewRecord = ref(false);
  const score = ref(0);
  const highScore = ref(0);

  let animFrameId: number | null = null;
  let currentLane = Math.floor(LANE_COUNT / 2);
  let lerpX = 0;

  let stars: Star[] = [];

  let obstacles: Obstacle[] = [];
  let colorCounter = 0;

  let startTime = 0;
  let lastTimestamp = 0;
  let lastScoreTick = 0;
  let lastSpawnTime = 0;

  const getCanvas = () => canvasRef.value;
  const settings = () => DIFFICULTY_SETTINGS[getConfig().difficulty];
  const playerY = (c: HTMLCanvasElement) => c.height - PLAYER_BOTTOM_OFFSET;

  const generateStars = (c: HTMLCanvasElement) => {
    stars = Array.from({ length: 60 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: 0.4 + Math.random() * 1.8,
      alpha: 0.15 + Math.random() * 0.65,
    }));
  };

  const moveLeft = () => {
    if (gameState.value !== 'playing') return;
    currentLane = Math.max(0, currentLane - 1);
  };

  const moveRight = () => {
    if (gameState.value !== 'playing') return;
    currentLane = Math.min(LANE_COUNT - 1, currentLane + 1);
  };

  const handleResize = () => {
    const c = getCanvas();
    if (!c) return;
    lerpX = laneCX(c, currentLane);
    generateStars(c);
  };

  const checkCollision = (c: HTMLCanvasElement): boolean => {
    const { h: barH } = obstacleSize(c);
    const barHalfH = barH / 2;
    const lw = laneW(c);
    const rh = lw * ROCKET_RH_FRAC;
    const playerHalfH = rh * 0.5;
    const py = playerY(c);
    for (const obs of obstacles) {
      if (obs.lane !== currentLane) continue;
      if (Math.abs(obs.y - py) < barHalfH + playerHalfH) return true;
    }
    return false;
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, timestamp: number) => {
    drawBackground(ctx, c, stars);
    for (const obs of obstacles) drawObstacle(ctx, c, obs);
    drawRocket(ctx, c, lerpX, timestamp);
  };

  const loop = (timestamp: number) => {
    const c = getCanvas();
    if (!c) {
      animFrameId = null;
      return;
    }
    const ctx = c.getContext('2d');
    if (!ctx) {
      animFrameId = null;
      return;
    }

    const deltaMs = lastTimestamp > 0 ? Math.min(timestamp - lastTimestamp, MAX_DELTA_MS) : 16.67;
    lastTimestamp = timestamp;

    lerpX += (laneCX(c, currentLane) - lerpX) * (1 - Math.exp((-LANE_LERP_K * deltaMs) / 1000));

    if (gameState.value === 'playing') {
      const s = settings();
      const elapsed = timestamp - startTime;

      if (timestamp - lastScoreTick >= 1000) {
        score.value += 1;
        lastScoreTick = timestamp;
      }

      const mult = Math.min(s.maxMult, 1 + elapsed * s.growth);

      if (timestamp - lastSpawnTime >= s.spawnIntervalMs) {
        const { h: barH } = obstacleSize(c);
        const spawnY = -Math.max(48, barH);
        obstacles.push({ lane: Math.floor(Math.random() * LANE_COUNT), y: spawnY, colorIdx: colorCounter });
        colorCounter += 1;
        lastSpawnTime = timestamp;
      }

      for (const obs of obstacles) obs.y += s.basePxPerMs * mult * deltaMs;
      const { h: dropH } = obstacleSize(c);
      obstacles = obstacles.filter((obs) => obs.y < c.height + dropH + 40);

      if (checkCollision(c)) {
        isNewRecord.value = score.value > highScore.value;
        if (isNewRecord.value) highScore.value = score.value;
        gameState.value = 'gameover';
      }
    }

    drawFrame(ctx, c, timestamp);
    animFrameId = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  };

  const initialize = (c: HTMLCanvasElement) => {
    stop();
    currentLane = Math.floor(LANE_COUNT / 2);
    lerpX = laneCX(c, currentLane);
    obstacles = [];
    colorCounter = 0;
    score.value = 0;
    isNewRecord.value = false;
    gameState.value = 'ready';
    lastTimestamp = 0;
    generateStars(c);
    animFrameId = requestAnimationFrame(loop);
  };

  const startPlaying = () => {
    const now = performance.now();
    startTime = now;
    lastScoreTick = now;
    lastSpawnTime = now;
    obstacles = [];
    score.value = 0;
    isNewRecord.value = false;
    gameState.value = 'playing';
  };

  const restart = () => startPlaying();

  return {
    gameState,
    isNewRecord,
    score,
    highScore,
    moveLeft,
    moveRight,
    initialize,
    startPlaying,
    stop,
    restart,
    handleResize,
  };
};

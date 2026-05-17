// ------------- Pomocnicze funkcje protokołów EEG (czas, dźwięk, losowanie) ---

// ------------- Oczekiwanie z anulowaniem (rAF, abort) -------------------------
export function exactWait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const tick = (time: DOMHighResTimeStamp) => {
      if (signal?.aborted) return reject(new Error('Aborted'));
      if (time - start >= ms) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// ------------- Krótki sygnał dźwiękowy (Web Audio) ----------------------------
export function playTone(frequency: number, duration = 0.2): void {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error('Failed to play tone:', e);
  }
}

// ------------- Kolejka prób z klasami (losowa permutacja) ---------------------
export function generateSequence(classes: string[], total: number): string[] {
  const perClass = Math.floor(total / classes.length);
  const seq: string[] = [];
  classes.forEach((cls) => {
    for (let i = 0; i < perClass; i++) seq.push(cls);
  });
  for (let i = seq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = seq[i];
    seq[i] = seq[j] as string;
    seq[j] = tmp as string;
  }
  return seq;
}

// ------------- Cyfry CPT (go/no-go: '3' vs reszta) -----------------------------
export function generateCptDigits(count: number): string[] {
  const noGoCount = Math.max(1, Math.round(count * 0.3));
  const goPool = [0, 1, 2, 4, 5, 6, 7, 8, 9];
  const digits: string[] = [];
  for (let i = 0; i < noGoCount; i++) digits.push('3');
  for (let i = noGoCount; i < count; i++) {
    digits.push(String(goPool[Math.floor(Math.random() * goPool.length)]!));
  }
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = digits[i]!;
    digits[i] = digits[j]!;
    digits[j] = tmp;
  }
  return digits;
}

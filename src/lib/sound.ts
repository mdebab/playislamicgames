// Short synthesized UI sounds (no files needed) plus a single recitation player.
let ctx: AudioContext | null = null;
const ac = () => (ctx ??= new AudioContext());

function tone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.12, delay = 0) {
  try {
    const c = ac();
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch {}
}

export const sfx = {
  correct: () => tone(880, 0.12, "sine", 0.08),
  wrong: () => { tone(180, 0.25, "triangle", 0.15); tone(140, 0.3, "triangle", 0.12, 0.08); },
  verse: () => { tone(660, 0.18, "sine", 0.08); tone(990, 0.25, "sine", 0.08, 0.1); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, "sine", 0.09, i * 0.12)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.35, "triangle", 0.1, i * 0.15)),
};

let player: HTMLAudioElement | null = null;
export function recite(url: string | undefined) {
  if (!url) return;
  stopRecitation();
  player = new Audio(url);
  player.play().catch(() => {});
}
export function stopRecitation() {
  player?.pause();
  player = null;
}

// Word-by-word Quranic vocabulary from UmmahAPI, drawn from random Juz Amma verses.
import { fetchSurahList } from "./surahs";
import { LEVELS, shuffle } from "./quran";

export type Word = { ar: string; en: string };
export const PAIRS_PER_BOARD = 6;
export const VOCAB_BOARDS = 3;
export const VOCAB_TIME = 90;

/** Keep one word per meaning, skipping particles and duplicates. */
export function pickWords(raw: Word[], n: number): Word[] {
  const seenEn = new Set<string>(), seenAr = new Set<string>(), out: Word[] = [];
  for (const w of raw) {
    const en = w.en.trim().toLowerCase();
    if (!en || en.length < 3 || seenEn.has(en) || seenAr.has(w.ar)) continue;
    seenEn.add(en); seenAr.add(w.ar); out.push({ ar: w.ar, en: w.en.trim() });
    if (out.length >= n) break;
  }
  return out;
}

export async function fetchVocab(n = PAIRS_PER_BOARD * VOCAB_BOARDS): Promise<Word[]> {
  const list = await fetchSurahList();
  const juz = list.filter((s) => LEVELS.includes(s.number));
  const pool: Word[] = [];
  for (let tries = 0; tries < 5 && pickWords(pool, n).length < n; tries++) {
    const refs = Array.from({ length: 6 }, () => {
      const s = juz[Math.floor(Math.random() * juz.length)]!;
      return [s.number, 1 + Math.floor(Math.random() * s.verses)] as const;
    });
    const res = await Promise.all(refs.map(([s, a]) => fetch(`https://ummahapi.com/api/quran/words/${s}/${a}`).then((r) => r.json()).catch(() => null)));
    for (const j of res) for (const w of j?.data?.words ?? []) if (w.type === "word") pool.push({ ar: w.arabic, en: w.translation });
  }
  return pickWords(shuffle(pool), n);
}

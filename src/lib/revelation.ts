// Revelation Timeline: order surahs by when they were revealed (UmmahAPI revelation_order).
import type { SurahMeta } from "./surahs";
export const REV_ROUND = 5;
export const REV_ROUNDS = 5;
/** Is this pick the earliest-revealed surah left in the set? */
export const isNextRevealed = (pick: SurahMeta, remaining: SurahMeta[]) =>
  Math.min(...remaining.map((s) => s.order)) === pick.order;

// All-114 surah metadata from UmmahAPI, used by Surahdle.
export type SurahMeta = { number: number; nameArabic: string; nameEnglish: string; place: "makkah" | "madinah"; order: number; verses: number };

export async function fetchSurahList(): Promise<SurahMeta[]> {
  const r = await fetch("https://ummahapi.com/api/quran/surahs");
  const j = await r.json();
  return j.data.surahs.map((s: any) => ({
    number: s.number, nameArabic: s.name_arabic, nameEnglish: s.name_english,
    place: s.revelation_place, order: s.revelation_order, verses: s.verses_count,
  }));
}

export const SURAHDLE_TRIES = 6;
export type Hint = "equal" | "higher" | "lower";
export const compareNum = (guess: number, secret: number): Hint => (guess === secret ? "equal" : secret > guess ? "higher" : "lower");

export function compareSurah(g: SurahMeta, s: SurahMeta) {
  return { number: compareNum(g.number, s.number), verses: compareNum(g.verses, s.verses), order: compareNum(g.order, s.order), place: g.place === s.place };
}

/** Same mystery surah for everyone on a given UTC day. */
export function dailyIndex(date: Date, total = 114) {
  const d = Math.floor(date.getTime() / 86400000);
  return ((d * 2654435761) >>> 0) % total;
}

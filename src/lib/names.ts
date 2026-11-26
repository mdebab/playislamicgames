export type AllahName = { number: number; arabic: string; transliteration: string; english: string };
export const NAMES_TIME_LIMIT = 10 * 60; // seconds

export async function fetchNames(): Promise<AllahName[]> {
  const r = await fetch("https://ummahapi.com/api/asma-ul-husna");
  const d = await r.json();
  return d.data.names.map((n: AllahName) => ({ number: n.number, arabic: n.arabic, transliteration: n.transliteration, english: n.english }));
}

const ARABIC_MARKS = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g;

/** Normalize a typed guess or a name so spelling variations still match. */
export function normalizeName(s: string): string {
  let t = s.trim().replace(ARABIC_MARKS, "");
  if (/[\u0600-\u06FF]/.test(t)) {
    return t.replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/\s+/g, "").replace(/^ال/, "");
  }
  t = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  t = t.replace(/^(al|ar|as|ash|at|az|an|ad|adh|dh)(?=[a-z]{3})/, "");
  t = t.replace(/ee/g, "i").replace(/oo/g, "u").replace(/ou/g, "u").replace(/aa/g, "a").replace(/y/g, "i").replace(/(.)\1/g, "$1");
  return t;
}

/** Return the number of the name the guess matches, or null. */
export function matchName(guess: string, names: AllahName[], found: Set<number>): number | null {
  const g = normalizeName(guess);
  if (g.length < 2) return null;
  for (const n of names) {
    if (found.has(n.number)) continue;
    if (normalizeName(n.transliteration) === g || normalizeName(n.arabic) === g) return n.number;
  }
  return null;
}

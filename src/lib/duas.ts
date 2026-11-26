// Dua Occasions: guess when a dua is said, from UmmahAPI duas.
export type DuaCategory = { id: string; name: string };
export type Dua = { arabic: string; transliteration: string; translation: string; category: string; reference: string };
export const DUA_ROUNDS = 10;

export async function fetchDuaCategories(): Promise<DuaCategory[]> {
  const j = await (await fetch("https://ummahapi.com/api/duas/categories")).json();
  return j.data.categories.map((c: any) => ({ id: c.id, name: c.name }));
}
export async function fetchRandomDua(): Promise<Dua> {
  const d = (await (await fetch("https://ummahapi.com/api/duas/random")).json()).data;
  return { arabic: d.arabic, transliteration: d.transliteration, translation: d.translation, category: d.category, reference: d.reference ?? d.source ?? "" };
}
/** The right category plus 3 random others, shuffled. */
export function duaOptions(answer: string, cats: DuaCategory[], rand = Math.random): string[] {
  const others = cats.map((c) => c.id).filter((id) => id !== answer).sort(() => rand() - 0.5).slice(0, 3);
  return [answer, ...others].sort(() => rand() - 0.5);
}

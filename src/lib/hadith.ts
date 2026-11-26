export type Grade = "Sahih" | "Hasan" | "Daif";
export const GRADES: Grade[] = ["Sahih", "Hasan", "Daif"];
export const GRADE_LABEL: Record<Grade, string> = { Sahih: "Sahih", Hasan: "Hasan", Daif: "Da'if" };
export const HADITH_ROUNDS = 10;
const COLLECTIONS = ["abudawud", "tirmidhi", "ibnmajah", "nasai"];

/** Map a raw grade from the API to one of three answers, or null if unusable. */
export function bucketGrade(raw: string | null | undefined): Grade | null {
  if (!raw) return null;
  const g = raw.toLowerCase();
  if (/daif|da'if|munkar|shadh|mawdu|maudu/.test(g)) return "Daif";
  if (g.startsWith("hasan sahih")) return "Sahih";
  if (g.startsWith("hasan")) return "Hasan";
  if (g.startsWith("sahih")) return "Sahih";
  return null;
}

export type Hadith = { id: string; collection: string; number: number; arabic: string; english: string; rawGrade: string; grade: Grade };

export async function fetchGradedHadith(): Promise<Hadith> {
  for (let i = 0; i < 8; i++) {
    const c = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)]!;
    const r = await fetch(`https://ummahapi.com/api/hadith/random?collection=${c}`);
    if (!r.ok) continue;
    const d = (await r.json()).data;
    const grade = bucketGrade(d?.grade);
    if (!grade || !d.english) continue;
    return { id: d.id, collection: d.collection_name, number: d.hadithnumber, arabic: d.arabic ?? "", english: d.english, rawGrade: d.grade, grade };
  }
  throw new Error("Could not load a hadith");
}

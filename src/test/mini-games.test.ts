import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { bucketGrade } from "@/lib/hadith";
import { matchName, normalizeName, type AllahName } from "@/lib/names";

describe("hadith grades", () => {
  it("groups raw grades into Sahih / Hasan / Da'if", () => {
    expect(bucketGrade("Sahih")).toBe("Sahih");
    expect(bucketGrade("Hasan Sahih")).toBe("Sahih");
    expect(bucketGrade("Hasan")).toBe("Hasan");
    expect(bucketGrade("Very Daif")).toBe("Daif");
    expect(bucketGrade("Mawdu")).toBe("Daif");
    expect(bucketGrade("-")).toBeNull();
    expect(bucketGrade(null)).toBeNull();
  });
});

describe("99 names", () => {
  const names: AllahName[] = JSON.parse(readFileSync("/tmp/x/n.json", "utf8")).data.names;
  it("accepts spelling variations and Arabic", () => {
    const n1 = names.find((n) => n.number === 1)!;
    expect(matchName("ar-rahman", names, new Set())).toBe(1);
    expect(matchName("Rahman", names, new Set())).toBe(1);
    expect(matchName(n1.arabic, names, new Set())).toBe(1);
    expect(matchName("rahman", names, new Set([1]))).toBeNull();
  });
  it("every name is reachable by its own transliteration", () => {
    // Near-identical names (e.g. Al-Majeed / Al-Majid) are found one after the other.
    const found = new Set<number>();
    for (const n of names) { expect(matchName(n.transliteration, names, found)).toBe(n.number); found.add(n.number); }
  });
  it("normalizes case and spaces", () => {
    expect(normalizeName("Al Malik")).toBe(normalizeName("al-malik"));
  });
});

import { compareSurah, type SurahMeta } from "@/lib/surahs";
import { isNextRevealed } from "@/lib/revelation";
import { duaOptions } from "@/lib/duas";
import { pickWords } from "@/lib/vocab";
const sm = (number: number, order: number): SurahMeta => ({ number, nameArabic: "", nameEnglish: "", place: "makkah", order, verses: 1 });
describe("revelation timeline", () => {
  it("accepts only the earliest-revealed surah left", () => {
    const set = [sm(114, 21), sm(96, 1), sm(110, 114)];
    expect(isNextRevealed(sm(96, 1), set)).toBe(true);
    expect(isNextRevealed(sm(114, 21), set)).toBe(false);
  });
});
describe("dua occasions", () => {
  it("gives 4 distinct options including the answer", () => {
    const cats = ["a", "b", "c", "d", "e"].map((id) => ({ id, name: id }));
    const o = duaOptions("c", cats);
    expect(o).toHaveLength(4); expect(o).toContain("c"); expect(new Set(o).size).toBe(4);
  });
});
describe("words match", () => {
  it("drops duplicate meanings and tiny particles", () => {
    const w = pickWords([{ ar: "ا", en: "Lord" }, { ar: "ب", en: "lord" }, { ar: "ج", en: "in" }, { ar: "د", en: "Day" }], 5);
    expect(w.map((x) => x.en)).toEqual(["Lord", "Day"]);
  });
});
describe("surahdle", () => {
  it("points toward the secret surah", () => {
    const a: SurahMeta = { number: 112, nameArabic: "", nameEnglish: "", place: "makkah", order: 22, verses: 4 };
    const b: SurahMeta = { number: 2, nameArabic: "", nameEnglish: "", place: "madinah", order: 87, verses: 286 };
    expect(compareSurah(a, b)).toEqual({ number: "lower", verses: "higher", order: "higher", place: false });
  });
});

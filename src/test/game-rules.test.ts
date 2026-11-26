import { describe, expect, it } from "vitest";
import { LEVELS, MAX_MISTAKES, TUTORIAL, cleanArabic, isFailed, splitWords, starsFor } from "@/lib/quran";

describe("game rules", () => {
  it("loses the level on the third mistake", () => {
    expect(MAX_MISTAKES).toBe(3);
    expect(isFailed(0)).toBe(false);
    expect(isFailed(2)).toBe(false);
    expect(isFailed(3)).toBe(true);
  });

  it("awards stars from mistakes left: 0 -> 3, 1 -> 2, 2 -> 1, 3 -> none", () => {
    expect(starsFor(0)).toBe(3);
    expect(starsFor(1)).toBe(2);
    expect(starsFor(2)).toBe(1);
    expect(starsFor(3)).toBe(0);
  });

  it("runs from An-Nas to An-Naba with Al-Fatihah as the tutorial", () => {
    expect(LEVELS[0]).toBe(114);
    expect(LEVELS.at(-1)).toBe(78);
    expect(TUTORIAL).toBe(1);
  });

  it("drops pause marks such as the permissible stop from surah text", () => {
    expect(cleanArabic("وَمَا هُمْ ۚ بِمُؤْمِنِينَ ۖ")).toBe("وَمَا هُمْ بِمُؤْمِنِينَ");
    expect(cleanArabic("تُحِبُّونَ ۜ")).toBe("تُحِبُّونَ");
    const tiles = splitWords(cleanArabic("بَلْ ۚ تُحِبُّونَ ۞ الْعَاجِلَةَ ۩"));
    expect(tiles).toEqual(["بَلْ", "تُحِبُّونَ", "الْعَاجِلَةَ"]);
    expect(tiles.some((t) => /^[\u06D6-\u06DC\u06DE\u06E9]+$/.test(t))).toBe(false);
  });
});

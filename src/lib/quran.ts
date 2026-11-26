import { queryOptions } from "@tanstack/react-query";

export type Verse = { ayah: number; arabic: string; translation: string; audio?: string | undefined };
export type Surah = { number: number; nameArabic: string; nameEnglish: string; translation: string; verses: Verse[]; fullAudio?: string | undefined };

// Levels: An-Nas (114) is level 1 ... An-Naba (78) is the last level.
export const LEVELS = Array.from({ length: 37 }, (_, i) => 114 - i);
export const TUTORIAL = 1;

export const surahQuery = (n: number) =>
  queryOptions({
    queryKey: ["surah", n],
    staleTime: Infinity,
    queryFn: async (): Promise<Surah> => {
      const res = await fetch(`https://ummahapi.com/api/quran/surah/${n}`);
      if (!res.ok) throw new Error("Failed to load surah");
      const { data } = await res.json();
      const fullAudio = await fetch(`https://ummahapi.com/api/quran/audio/${n}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => j?.data?.reciters?.[0]?.full_surah_audio as string | undefined)
        .catch(() => undefined);
      return {
        number: data.surah.number,
        nameArabic: data.surah.name_arabic,
        nameEnglish: data.surah.name_english,
        translation: data.surah.name_translation,
        fullAudio,
        verses: data.verses.map((v: any) => ({
          ayah: v.ayah,
          arabic: cleanArabic(String(v.arabic)),
          translation: v.translations?.sahih_international ?? "",
          audio: v.audio?.ayah_audio,
        })),
      };
    },
  });

export const splitWords = (s: string) => s.split(/\s+/).filter(Boolean);

// Pause and ornament signs (ۖ ۚ ۜ ۞ ۩ …) are not letters: left in, they become
// junk word tiles. The permissible stop ۚ is the common one.
const WAQF_MARKS = /[\u06D6-\u06DC\u06DE\u06E9]/g;
export const cleanArabic = (s: string) => s.replace(WAQF_MARKS, "").replace(/\s+/g, " ").trim();

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  if (a.length > 1 && a.every((x, i) => x === arr[i])) return shuffle(arr);
  return a;
}

// Three wrong taps end the level: the third mistake loses it.
export const MAX_MISTAKES = 3;
export const isFailed = (mistakes: number) => mistakes >= MAX_MISTAKES;

// 0 mistakes = 3 stars, 1 = 2, 2 = 1; a lost level earns none.
export function starsFor(mistakes: number) {
  if (isFailed(mistakes)) return 0;
  return MAX_MISTAKES - mistakes;
}

const KEY = "juz-amma-progress";
export type Progress = Record<number, number>; // surah -> stars
export const loadProgress = (): Progress => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
};
export const saveStars = (n: number, stars: number) => {
  const p = loadProgress();
  p[n] = Math.max(p[n] ?? 0, stars);
  localStorage.setItem(KEY, JSON.stringify(p));
};
export const isUnlocked = (p: Progress, levelIndex: number) =>
  levelIndex === 0 ? true : (p[LEVELS[levelIndex - 1]!] ?? 0) > 0;

// Surah names for the level menu (78–114).
export const SURAH_NAMES: Record<number, [string, string]> = {
  78:["An-Naba","النبأ"],79:["An-Nazi'at","النازعات"],80:["Abasa","عبس"],81:["At-Takwir","التكوير"],82:["Al-Infitar","الانفطار"],
  83:["Al-Mutaffifin","المطففين"],84:["Al-Inshiqaq","الانشقاق"],85:["Al-Buruj","البروج"],86:["At-Tariq","الطارق"],87:["Al-A'la","الأعلى"],
  88:["Al-Ghashiyah","الغاشية"],89:["Al-Fajr","الفجر"],90:["Al-Balad","البلد"],91:["Ash-Shams","الشمس"],92:["Al-Layl","الليل"],
  93:["Ad-Duha","الضحى"],94:["Ash-Sharh","الشرح"],95:["At-Tin","التين"],96:["Al-Alaq","العلق"],97:["Al-Qadr","القدر"],
  98:["Al-Bayyinah","البينة"],99:["Az-Zalzalah","الزلزلة"],100:["Al-Adiyat","العاديات"],101:["Al-Qari'ah","القارعة"],102:["At-Takathur","التكاثر"],
  103:["Al-Asr","العصر"],104:["Al-Humazah","الهمزة"],105:["Al-Fil","الفيل"],106:["Quraysh","قريش"],107:["Al-Ma'un","الماعون"],
  108:["Al-Kawthar","الكوثر"],109:["Al-Kafirun","الكافرون"],110:["An-Nasr","النصر"],111:["Al-Masad","المسد"],112:["Al-Ikhlas","الإخلاص"],
  113:["Al-Falaq","الفلق"],114:["An-Nas","الناس"],
};

const UNLOCK_KEY = "juz-amma-unlock-all";
export const loadUnlockAll = () => { try { return localStorage.getItem(UNLOCK_KEY) === "1"; } catch { return false; } };
export const setUnlockAll = () => localStorage.setItem(UNLOCK_KEY, "1");
export const resetProgress = () => { localStorage.removeItem(KEY); localStorage.removeItem(UNLOCK_KEY); };

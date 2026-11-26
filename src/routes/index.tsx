import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BookOpen, Scale, Sparkles, CircleHelp, Languages, History, HandHeart, Search } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Play islamic games!" },
      { name: "description", content: "Eight Islamic learning games: Quran puzzles, hadith grading, the 99 Names, duas, revelation order and more." },
      { property: "og:title", content: "Play islamic games!" },
      { property: "og:description", content: "Rebuild surahs, grade hadiths, and name all 99 Names of Allah." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Hub,
});

const GAMES = [
  { to: "/juz-amma", icon: BookOpen, ar: "جزء عمّ", title: "Juz Amma Puzzle", desc: "Rebuild each surah from its shuffled words.", tint: "game-emerald" },
  { to: "/hadith", icon: Scale, ar: "درجة الحديث", title: "Hadith Grader", desc: "Read a random hadith and guess its grade.", tint: "game-amber" },
  { to: "/names", icon: Sparkles, ar: "الأسماء الحسنى", title: "99 Names", desc: "Type all 99 Names of Allah before time runs out.", tint: "game-blue" },
  { to: "/ayah-guesser", icon: CircleHelp, ar: "أي سورة؟", title: "Ayah Guesser", desc: "Read or hear a verse and name its surah.", tint: "game-violet" },
  { to: "/words-match", icon: Languages, ar: "كلمات القرآن", title: "Words Match", desc: "Match Quranic words to their meanings against the clock.", tint: "game-ruby" },
  { to: "/revelation", icon: History, ar: "ترتيب النزول", title: "Revelation Timeline", desc: "Order surahs by when they were revealed.", tint: "game-bronze" },
  { to: "/duas", icon: HandHeart, ar: "مناسبات الأدعية", title: "Dua Occasions", desc: "Guess when each dua is said.", tint: "game-teal" },
  { to: "/surahdle", icon: Search, ar: "السورة الغامضة", title: "Mystery Surah", desc: "Guess the daily mystery surah in six tries.", tint: "game-indigo" },
] as const;

function Hub() {
  return (
    <main className="pattern-bg menu-texture light light-gold min-h-screen px-5 py-14">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-muted-foreground">Play · Learn · Reflect</p>
          <p className="mt-5 font-arabic text-5xl leading-snug text-gold">ألعاب إسلامية</p>
          <h1 className="mt-2 font-display text-5xl font-medium tracking-tight">Islamic Games</h1>
          <div className="mx-auto mt-5 flex w-32 items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-gold/40" />
            <span className="h-2 w-2 rotate-45 border border-gold" />
            <span className="h-px flex-1 bg-gold/40" />
          </div>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">Choose a game and strengthen your knowledge.</p>
        </header>
        <div className="mt-10 grid gap-4">
          {GAMES.map((g) => (
            <Link key={g.to} to={g.to} className={`game-card ${g.tint} group flex items-center gap-4 p-5 sm:p-6`}>
              <span className="game-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                <g.icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="game-title font-display text-2xl font-semibold leading-tight">{g.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.desc}</p>
              </div>
              <span className="hidden font-arabic text-2xl text-[var(--game)] md:block">{g.ar}</span>
              <ArrowUpRight className="game-arrow h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, LockOpen, RotateCcw } from "lucide-react";
import { LEVELS, TUTORIAL, SURAH_NAMES, isUnlocked, loadProgress, loadUnlockAll, setUnlockAll, resetProgress, type Progress } from "@/lib/quran";

export const Route = createFileRoute("/juz-amma")({
  head: () => ({
    meta: [
      { title: "Juz Amma Puzzle — Rebuild the Surahs" },
      { name: "description", content: "A Quranic word game: reassemble the surahs of Juz Amma from shuffled words, from An-Nas to An-Naba." },
      { property: "og:title", content: "Juz Amma Puzzle — Rebuild the Surahs" },
      { property: "og:description", content: "Reassemble the surahs of Juz Amma word by word, from An-Nas to An-Naba." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JuzAmma,
});

function JuzAmma() {
  const [p, setP] = useState<Progress>({});
  const [all, setAll] = useState(false);
  useEffect(() => { setP(loadProgress()); setAll(loadUnlockAll()); }, []);

  const completed = LEVELS.filter((n) => (p[n] ?? 0) > 0).length;

  return (
    <main className="pattern-bg game-dark theme-emerald min-h-screen px-5 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="game-toolbar">
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-gold">← Games</Link>
          <span className="text-[0.65rem] uppercase tracking-[0.2em] text-gold">Juz 30 · 37 surahs</span>
        </div>
        <header className="mt-9 text-center">
          <p className="font-arabic text-5xl leading-snug text-gold">جزء عمّ</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Juz Amma Puzzle</h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Rebuild each surah from its shuffled words. Three mistakes and the level is lost.
          </p>
        </header>

        <Link
          to="/play/$surah"
          params={{ surah: String(TUTORIAL) }}
          className="panel tutorial-card mt-10 flex items-center justify-between gap-4 p-6"
        >
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.22em] text-gold">Tutorial</p>
            <p className="mt-1 font-display text-xl">Al-Fatihah</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Learn the rules — the next word glows</p>
          </div>
          <span className="font-arabic text-3xl text-gold">الفاتحة</span>
        </Link>

        <div className="mt-10 flex items-baseline justify-between">
          <h2 className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Levels</h2>
          <p className="text-xs tabular-nums text-muted-foreground">{completed} / {LEVELS.length} complete</p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {LEVELS.map((n, i) => {
            const open = all || isUnlocked(p, i);
            const stars = p[n] ?? 0;
            return open ? (
              <Link
                key={n}
                to="/play/$surah"
                params={{ surah: String(n) }}
                className="panel level-card flex min-h-28 flex-col text-center items-center justify-center gap-1.5 p-4"
              >
                                <span className="font-arabic text-xl leading-tight text-gold">{SURAH_NAMES[n]?.[1]}</span>
                <span className="text-sm leading-none">{SURAH_NAMES[n]?.[0]}</span>
                <span className="mt-3 flex gap-1.5">
                  {[0, 1, 2].map((s) => (
                    <span key={s} className={`h-1 w-1 rounded-full ${s < stars ? "bg-gold" : "bg-muted"}`} />
                  ))}
                </span>
              </Link>
            ) : (
              <div key={n} className="panel level-card panel-locked flex min-h-28 flex-col text-center items-center justify-center gap-1.5 p-4">
                                <span className="font-arabic text-xl leading-tight text-gold">{SURAH_NAMES[n]?.[1]}</span>
                <span className="text-sm leading-none">{SURAH_NAMES[n]?.[0]}</span>
                <Lock className="mt-3 h-3 w-3 text-muted-foreground" />
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <button
            className="btn-ghost p-2.5"
            aria-label="Unlock all surahs"
            title="Unlock all surahs"
            onClick={() => { setUnlockAll(); setAll(true); }}
            disabled={all}
          >
            <LockOpen className="h-4 w-4" />
          </button>
          <button
            className="btn-ghost p-2.5"
            aria-label="Reset progress"
            title="Reset progress"
            onClick={() => { if (confirm("Reset all progress?")) { resetProgress(); setP({}); setAll(false); } }}
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

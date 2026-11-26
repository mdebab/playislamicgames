import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { sfx, recite, stopRecitation } from "@/lib/sound";
import { LEVELS, MAX_MISTAKES, TUTORIAL, isFailed, saveStars, shuffle, splitWords, starsFor, surahQuery } from "@/lib/quran";

export const Route = createFileRoute("/play/$surah")({
  head: ({ params }) => ({
    meta: [
      { title: `Surah ${params.surah} — Juz Amma Puzzle` },
      { name: "description", content: "Reassemble this surah from its shuffled words." },
      { property: "og:title", content: `Surah ${params.surah} — Juz Amma Puzzle` },
      { property: "og:description", content: "Reassemble this surah from its shuffled words." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Play,
});

type Tile = { id: number; word: string };

function Play() {
  const n = Number(Route.useParams().surah);
  const tutorial = n === TUTORIAL;
  const { data, isLoading, error } = useQuery(surahQuery(n));
  const [count, setCount] = useState(0);
  const [pool, setPool] = useState<Tile[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const navigate = useNavigate();

  // Whole surah as one flat sequence of words, each tagged with its verse.
  const seq = useMemo(
    () =>
      data?.verses.flatMap((v) =>
        splitWords(v.arabic).map((word, i, a) => ({ word, ayah: v.ayah, audio: v.audio, last: i === a.length - 1, translation: v.translation })),
      ) ?? [],
    [data],
  );

  const reset = useCallback(() => {
    stopRecitation();
    setCount(0);
    setMistakes(0);
    setDone(false);
    setFailed(false);
    setWrong(null);
    setPool(shuffle(seq.map((x, id) => ({ id, word: x.word }))));
  }, [seq]);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => () => stopRecitation(), []);

  if (isLoading) return <Shell><p className="text-center text-muted-foreground">Loading surah…</p></Shell>;
  if (error || !data) return <Shell><p className="text-center text-destructive">Couldn't load this surah. Please try again.</p></Shell>;

  const totalWords = seq.length;
  const next = seq[count]?.word;
  const lives = MAX_MISTAKES - mistakes;
  const stars = starsFor(mistakes);
  const currentAyah = seq[Math.min(count, totalWords - 1)];

  const tap = (t: Tile) => {
    if (done || failed) return;
    if (t.word !== next) {
      const m = mistakes + 1;
      setWrong(t.id);
      setMistakes(m);
      setTimeout(() => setWrong(null), 400);
      if (isFailed(m)) { sfx.lose(); stopRecitation(); setTimeout(() => setFailed(true), 450); }
      else sfx.wrong();
      return;
    }
    const c = count + 1;
    setCount(c);
    setPool((p) => p.filter((x) => x.id !== t.id));
    const w = seq[count]!;
    if (c === totalWords) { sfx.win(); recite(w.audio); }
    else if (w.last) { sfx.verse(); recite(w.audio); }
    else sfx.correct();
    if (c === totalWords) setTimeout(() => { if (!tutorial) saveStars(n, starsFor(mistakes)); setDone(true); }, 700);
  };

  const idx = LEVELS.indexOf(n);
  const nextLevel = tutorial ? LEVELS[0] : LEVELS[idx + 1];

  return (
    <Shell>
      <div className="game-toolbar">
        <Link to="/juz-amma" className="text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-gold">
          Levels
        </Link>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">
          {tutorial ? "Tutorial" : `Level ${idx + 1} of ${LEVELS.length}`}
        </p>
        <div className="flex items-center gap-1" aria-label={`${lives} of ${MAX_MISTAKES} lives left`}>
          {Array.from({ length: MAX_MISTAKES }, (_, i) => (
            <Heart
              key={i}
              strokeWidth={1.5}
              className={i < lives ? "h-4 w-4 fill-gold text-gold" : "h-4 w-4 text-muted-foreground/40"}
            />
          ))}
        </div>
      </div>

      <div className="surah-heading py-2 text-center">
        <p className="font-arabic text-5xl leading-snug text-gold">{data.nameArabic}</p>
        <h1 className="mt-1 font-display text-3xl font-medium">{data.nameEnglish}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.translation}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${(count / Math.max(totalWords, 1)) * 100}%` }} />
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">{count} / {totalWords}</span>
      </div>

      {tutorial && !done && !failed && (
        <p className="panel p-4 text-center text-sm leading-relaxed text-muted-foreground">
          Tap the words in order to rebuild the whole surah, reading right to left. The glowing word is next —
          real levels give no hints. Three mistakes and the level is lost.
        </p>
      )}

      {failed ? (
        <div className="panel result-panel p-8 text-center">
          <p className="font-display text-3xl">Out of lives</p>
          <p className="mt-2 text-sm text-muted-foreground">Three mistakes — this surah isn't saved yet.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-gold" onClick={reset}>Try again</button>
            <Link to="/juz-amma" className="btn-ghost">Levels</Link>
          </div>
        </div>
      ) : done ? (
        <div className="panel result-panel p-8 text-center">
          <p className="font-display text-3xl">{tutorial ? "Tutorial complete" : "Surah complete"}</p>
          {!tutorial && (
            <p className="mt-3 flex justify-center gap-1.5" aria-label={`${stars} of 3 stars`}>
              {[0, 1, 2].map((s) => (
                <span key={s} className={`h-2 w-2 rounded-full ${s < stars ? "bg-gold" : "bg-muted"}`} />
              ))}
            </p>
          )}
          <div dir="rtl" className="verse-board mt-6 max-h-80 overflow-y-auto p-5 text-center font-arabic text-2xl leading-[2.1]">
            {data.verses.map((v) => (
              <span key={v.ayah}>{v.arabic} <span className="text-gold">۝{v.ayah}</span>{" "}</span>
            ))}
          </div>
          {!tutorial && nextLevel === undefined && (
            <p className="mt-3 text-sm text-muted-foreground">You've completed all of Juz Amma. Masha'Allah!</p>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/juz-amma" className="btn-ghost">Levels</Link>
            {nextLevel !== undefined && (
              <button
                className="btn-gold"
                onClick={() => navigate({ to: "/play/$surah", params: { surah: String(nextLevel) } })}
              >
                {tutorial ? "Start level 1" : "Next level"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div dir="rtl" className="verse-board min-h-32 p-6 text-center font-arabic text-3xl leading-[2.1]">
            {seq.slice(0, count).map((x, i) => (
              <span key={i} className="animate-in fade-in zoom-in-95">
                {x.word}{" "}{x.last && <span className="text-gold">۝{x.ayah} </span>}
              </span>
            ))}
          </div>
          {tutorial && currentAyah && (
            <p className="text-center text-sm text-muted-foreground">
              Verse {currentAyah.ayah}: {currentAyah.translation}
            </p>
          )}
          <div dir="rtl" className="flex flex-wrap justify-center gap-2.5">
            {pool.map((t) => (
              <button
                key={t.id}
                onClick={() => tap(t)}
                className={`word-tile ${wrong === t.id ? "word-wrong" : ""} ${tutorial && t.word === next ? "word-hint" : ""}`}
              >
                {t.word}
              </button>
            ))}
          </div>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="pattern-bg game-dark theme-emerald min-h-screen px-5 py-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">{children}</div>
    </main>
  );
}

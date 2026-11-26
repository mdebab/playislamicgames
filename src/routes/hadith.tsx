import { createFileRoute, Link } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GRADES, GRADE_LABEL, HADITH_ROUNDS, fetchGradedHadith, type Grade, type Hadith } from "@/lib/hadith";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/hadith")({
  head: () => ({
    meta: [
      { title: "Hadith Grader — Guess the Grade" },
      { name: "description", content: "Read a random hadith from the Sunan collections and classify it as Sahih, Hasan or Da'if." },
      { property: "og:title", content: "Hadith Grader — Guess the Grade" },
      { property: "og:description", content: "Classify random hadiths as Sahih, Hasan or Da'if." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HadithGame,
});

function HadithGame() {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [h, setH] = useState<Hadith | null>(null);
  const [error, setError] = useState(false);
  const [pick, setPick] = useState<Grade | null>(null);
  const [showAr, setShowAr] = useState(false);
  const done = round > HADITH_ROUNDS;

  const load = useCallback(() => {
    setH(null); setPick(null); setError(false); setShowAr(false);
    fetchGradedHadith().then(setH).catch(() => setError(true));
  }, []);
  useEffect(() => { load(); }, [load]);

  const answer = (g: Grade) => {
    if (!h || pick) return;
    setPick(g);
    if (g === h.grade) { setScore((s) => s + 1); sfx.correct(); } else sfx.wrong();
  };
  const next = () => {
    if (round >= HADITH_ROUNDS) { setRound(round + 1); sfx.win(); return; }
    setRound(round + 1); load();
  };
  const restart = () => { setRound(1); setScore(0); load(); };

  return (
    <main className="pattern-bg game-dark theme-amber min-h-screen px-5 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="game-toolbar">
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-gold">← Games</Link>
          {!done && <p className="text-xs tabular-nums text-muted-foreground">Hadith {round} / {HADITH_ROUNDS} · Score {score}</p>}
        </div>
        <header className="mt-8 text-center">
          <p className="font-arabic text-4xl leading-snug text-gold">درجة الحديث</p>
          <h1 className="mt-2 font-display text-4xl font-medium">Hadith Grader</h1>
          <p className="mt-2 text-sm text-muted-foreground">Read carefully, then classify the narration.</p>
          {!done && (
            <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
              <div className="progress-track"><div className="progress-fill" style={{ width: `${((round - 1) / HADITH_ROUNDS) * 100}%` }} /></div>
              <span className="text-xs tabular-nums text-muted-foreground">{round}/{HADITH_ROUNDS}</span>
            </div>
          )}
        </header>

        {done ? (
          <div className="panel result-panel mt-8 p-8 text-center">
            <p className="font-display text-5xl text-gold">{score} / {HADITH_ROUNDS}</p>
            <p className="mt-2 text-sm text-muted-foreground">correct grades</p>
            <div className="mt-6 flex justify-center gap-3">
              <button className="btn-gold" onClick={restart}>Play again</button>
              <Link to="/" className="btn-ghost">Games</Link>
            </div>
          </div>
        ) : error ? (
          <div className="panel result-panel mt-8 p-8 text-center">
            <p className="text-sm text-muted-foreground">Couldn't load a hadith.</p>
            <button className="btn-gold mt-4" onClick={load}>Retry</button>
          </div>
        ) : !h ? (
          <div className="panel mt-8 p-8 text-center text-sm text-muted-foreground">Loading a hadith…</div>
        ) : (
          <>
            <article className="panel hadith-card mt-8 p-6 sm:p-7">
              <div className="relative z-10 flex items-center justify-between gap-4">
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-gold">{h.collection} · #{h.number}</p>
                <Quote className="h-5 w-5 text-gold/50" aria-hidden="true" />
              </div>
              <p className="relative z-10 mt-4 max-h-80 overflow-y-auto whitespace-pre-line text-[0.95rem] leading-7">{h.english}</p>
              {h.arabic && (
                <button className="mt-4 text-xs text-muted-foreground hover:text-gold" onClick={() => setShowAr(!showAr)}>
                  {showAr ? "Hide Arabic" : "Show Arabic"}
                </button>
              )}
              {showAr && <p dir="rtl" className="mt-3 max-h-80 overflow-y-auto font-arabic text-xl leading-loose">{h.arabic}</p>}
            </article>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {GRADES.map((g) => {
                const state = !pick ? "" : g === h.grade ? "border-gold text-gold" : g === pick ? "border-destructive text-destructive" : "opacity-40";
                return (
                  <button key={g} className={`btn-ghost grade-btn py-3 ${state}`} onClick={() => answer(g)} disabled={!!pick}>{GRADE_LABEL[g]}</button>
                );
              })}
            </div>
            {pick && (
              <div className="answer-feedback mt-5 text-center">
                <p className="text-sm">
                  {pick === h.grade ? "Correct!" : `It's ${GRADE_LABEL[h.grade]}.`}
                  <span className="text-muted-foreground"> Graded: {h.rawGrade}</span>
                </p>
                <button className="btn-gold mt-4" onClick={next}>{round >= HADITH_ROUNDS ? "See score" : "Next hadith"}</button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

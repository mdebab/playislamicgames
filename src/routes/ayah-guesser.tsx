import { createFileRoute } from "@tanstack/react-router";
import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { GameShell, ResultPanel, meta } from "@/components/GameShell";
import { LEVELS, SURAH_NAMES, shuffle, splitWords, surahQuery, type Verse } from "@/lib/quran";
import { useQueryClient } from "@tanstack/react-query";
import { recite, sfx, stopRecitation } from "@/lib/sound";

export const Route = createFileRoute("/ayah-guesser")({
  head: () => meta("Ayah Guesser — Which Surah?", "Hear or read a verse from Juz Amma and pick the surah it comes from."),
  component: AyahGuesser,
});

const ROUNDS = 10;
type Q = { verse: Verse; answer: number; options: number[] };

function AyahGuesser() {
  const qc = useQueryClient();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState<Q | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const done = round > ROUNDS;

  const load = useCallback(async () => {
    setQ(null); setPick(null); setError(false);
    try {
      const answer = LEVELS[Math.floor(Math.random() * LEVELS.length)]!;
      const s = await qc.fetchQuery(surahQuery(answer));
      const pool = s.verses.filter((v) => splitWords(v.arabic).length >= 3);
      const verse = (pool.length ? pool : s.verses)[Math.floor(Math.random() * (pool.length || s.verses.length))]!;
      const options = shuffle([answer, ...shuffle(LEVELS.filter((n) => n !== answer)).slice(0, 3)]);
      setQ({ verse, answer, options });
    } catch { setError(true); }
  }, [qc]);
  useEffect(() => { load(); return stopRecitation; }, [load]);

  const choose = (n: number) => {
    if (!q || pick) return;
    setPick(n);
    if (n === q.answer) { setScore((s) => s + 1); sfx.correct(); } else sfx.wrong();
  };
  const next = () => { stopRecitation(); if (round >= ROUNDS) sfx.win(); else load(); setRound(round + 1); };
  const restart = () => { setRound(1); setScore(0); load(); };

  return (
    <GameShell theme="theme-violet" ar="أي سورة؟" title="Ayah Guesser" subtitle="Which surah of Juz Amma is this verse from?"
      status={!done && `Verse ${round} / ${ROUNDS} · Score ${score}`} progress={done ? undefined : (round - 1) / ROUNDS}>
      {done ? <ResultPanel big={`${score} / ${ROUNDS}`} label="surahs recognised" onAgain={restart} />
        : error ? <div className="panel mt-8 p-8 text-center"><button className="btn-gold" onClick={load}>Retry</button></div>
        : !q ? <div className="panel mt-8 p-8 text-center text-sm text-muted-foreground">Loading a verse…</div>
        : (
          <>
            <article className="panel mt-8 p-6 text-center">
              <p dir="rtl" className="font-arabic text-3xl leading-[2.2]">{q.verse.arabic}</p>
              {pick && <p className="mt-4 text-sm text-muted-foreground">{q.verse.translation}</p>}
              <button className="btn-ghost mt-5 inline-flex items-center gap-2" onClick={() => recite(q.verse.audio)}>
                <Volume2 className="h-4 w-4" /> Listen
              </button>
            </article>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {q.options.map((n) => {
                const st = !pick ? "" : n === q.answer ? "choice-correct" : n === pick ? "choice-wrong" : "opacity-40";
                return (
                  <button key={n} disabled={!!pick} onClick={() => choose(n)} className={`btn-ghost choice-btn flex flex-col py-3 ${st}`}>
                    <span className="font-arabic text-xl">{SURAH_NAMES[n]?.[1]}</span>
                    <span className="text-xs text-muted-foreground">{SURAH_NAMES[n]?.[0]}</span>
                  </button>
                );
              })}
            </div>
            {pick && <div className="mt-5 text-center"><button className="btn-gold" onClick={next}>{round >= ROUNDS ? "See score" : "Next verse"}</button></div>}
          </>
        )}
    </GameShell>
  );
}

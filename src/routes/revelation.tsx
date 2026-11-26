import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GameShell, ResultPanel, meta } from "@/components/GameShell";
import { shuffle } from "@/lib/quran";
import { fetchSurahList, type SurahMeta } from "@/lib/surahs";
import { REV_ROUND, REV_ROUNDS, isNextRevealed } from "@/lib/revelation";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/revelation")({
  head: () => meta("Revelation Timeline — Order of Revelation", "Put surahs in the order they were revealed, using revelation data from UmmahAPI."),
  component: RevelationGame,
});

function RevelationGame() {
  const [all, setAll] = useState<SurahMeta[]>([]);
  const [error, setError] = useState(false);
  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<SurahMeta[]>([]);
  const [placed, setPlaced] = useState<SurahMeta[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = round > REV_ROUNDS;
  const roundDone = cards.length > 0 && placed.length === cards.length;

  const load = useCallback(() => { setError(false); fetchSurahList().then(setAll).catch(() => setError(true)); }, []);
  useEffect(() => { load(); }, [load]);
  const newRound = useCallback(() => { setCards(shuffle(all).slice(0, REV_ROUND)); setPlaced([]); }, [all]);
  useEffect(() => { if (all.length) newRound(); }, [all, newRound]);

  const tap = (s: SurahMeta) => {
    const remaining = cards.filter((c) => !placed.includes(c));
    if (isNextRevealed(s, remaining)) {
      const np = [...placed, s]; setPlaced(np);
      if (np.length === cards.length) sfx.verse(); else sfx.correct();
    } else { setMistakes((m) => m + 1); setWrong(s.number); sfx.wrong(); setTimeout(() => setWrong(null), 450); }
  };
  const next = () => { if (round >= REV_ROUNDS) sfx.win(); else newRound(); setRound(round + 1); };
  const restart = () => { setRound(1); setMistakes(0); newRound(); };

  return (
    <GameShell theme="theme-bronze" ar="ترتيب النزول" title="Revelation Timeline" subtitle="Tap the surahs in the order they were revealed."
      status={!done && `Round ${round} / ${REV_ROUNDS} · Mistakes ${mistakes}`} progress={done ? undefined : (round - 1) / REV_ROUNDS}>
      {error ? <div className="panel mt-8 p-8 text-center"><p>Couldn't load surahs.</p><button className="btn-gold mt-4" onClick={load}>Retry</button></div>
      : !all.length ? <p className="mt-10 text-center text-muted-foreground">Loading surahs…</p>
      : done ? <ResultPanel big={`${mistakes}`} label={mistakes === 1 ? "mistake" : "mistakes"} onAgain={restart} /> : (
        <>
          <div className="verse-board mt-8 min-h-24 p-4">
            <ol className="flex flex-wrap items-center gap-2">
              {placed.map((s, i) => (
                <li key={s.number} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gold/50">→</span>}
                  <span className="rounded-full border border-gold/50 px-3 py-1 text-sm text-gold">{s.nameEnglish} <span className="opacity-70">#{s.order}</span></span>
                </li>
              ))}
              {!placed.length && <li className="text-sm text-muted-foreground">Earliest revealed first.</li>}
            </ol>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cards.filter((c) => !placed.includes(c)).map((s) => (
              <button key={s.number} onClick={() => tap(s)} className={`btn-ghost choice-btn flex flex-col py-3 ${wrong === s.number ? "choice-wrong" : ""}`}>
                <span className="font-arabic text-xl">{s.nameArabic}</span>
                <span className="text-xs text-muted-foreground">{s.nameEnglish} · {s.place === "makkah" ? "Makki" : "Madani"}</span>
              </button>
            ))}
          </div>
          {roundDone && <div className="mt-5 text-center"><button className="btn-gold" onClick={next}>{round >= REV_ROUNDS ? "See result" : "Next round"}</button></div>}
        </>
      )}
    </GameShell>
  );
}

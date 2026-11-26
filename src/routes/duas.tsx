import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GameShell, ResultPanel, meta } from "@/components/GameShell";
import { DUA_ROUNDS, duaOptions, fetchDuaCategories, fetchRandomDua, type Dua, type DuaCategory } from "@/lib/duas";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/duas")({
  head: () => meta("Dua Occasions — When Is It Said?", "Read an authentic dua and guess the occasion it is said for."),
  component: DuaGame,
});

function DuaGame() {
  const [cats, setCats] = useState<DuaCategory[]>([]);
  const [q, setQ] = useState<{ dua: Dua; options: string[] } | null>(null);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const done = i >= DUA_ROUNDS;
  const nameOf = (id: string) => cats.find((c) => c.id === id)?.name ?? id;

  const loadQ = useCallback(async (c: DuaCategory[]) => {
    setQ(null); setError(false);
    try { const dua = await fetchRandomDua(); setQ({ dua, options: duaOptions(dua.category, c) }); } catch { setError(true); }
  }, []);
  useEffect(() => { fetchDuaCategories().then((c) => { setCats(c); void loadQ(c); }).catch(() => setError(true)); }, [loadQ]);

  const choose = (id: string) => {
    if (!q || pick) return;
    setPick(id);
    if (id === q.dua.category) { setScore((s) => s + 1); sfx.correct(); } else sfx.wrong();
  };
  const next = () => { setPick(null); if (i + 1 >= DUA_ROUNDS) sfx.win(); else void loadQ(cats); setI(i + 1); };
  const restart = () => { setI(0); setScore(0); setPick(null); void loadQ(cats); };

  return (
    <GameShell theme="theme-teal" ar="مناسبات الأدعية" title="Dua Occasions" subtitle="When is this dua said?"
      status={!done && `Question ${i + 1} / ${DUA_ROUNDS} · Score ${score}`} progress={done ? undefined : i / DUA_ROUNDS}>
      {done ? <ResultPanel big={`${score} / ${DUA_ROUNDS}`} label="occasions guessed" onAgain={restart} />
      : error ? <div className="panel mt-8 p-8 text-center"><p>Couldn't load a dua.</p><button className="btn-gold mt-4" onClick={() => void loadQ(cats)}>Retry</button></div>
      : !q ? <p className="mt-10 text-center text-muted-foreground">Loading dua…</p> : (
        <>
          <article className="panel mt-8 p-8 text-center">
            <p dir="rtl" className="font-arabic text-3xl leading-[2.1]">{q.dua.arabic}</p>
            <p className="mt-3 text-sm italic text-muted-foreground">{q.dua.transliteration}</p>
            <p className="mt-2 text-sm">{q.dua.translation}</p>
          </article>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {q.options.map((id) => {
              const st = !pick ? "" : id === q.dua.category ? "choice-correct" : id === pick ? "choice-wrong" : "opacity-40";
              return <button key={id} disabled={!!pick} onClick={() => choose(id)} className={`btn-ghost choice-btn text-sm ${st}`}>{nameOf(id)}</button>;
            })}
          </div>
          {pick && (
            <div className="answer-feedback mt-5 text-center">
              <p className="text-sm">{pick === q.dua.category ? "Correct!" : `It's ${nameOf(q.dua.category)}.`} {q.dua.reference && <span className="text-muted-foreground">{q.dua.reference}</span>}</p>
              <button className="btn-gold mt-4" onClick={next}>{i + 1 >= DUA_ROUNDS ? "See score" : "Next"}</button>
            </div>
          )}
        </>
      )}
    </GameShell>
  );
}

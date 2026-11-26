import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { GameShell, meta } from "@/components/GameShell";
import { SURAHDLE_TRIES, compareSurah, dailyIndex, fetchSurahList, type Hint, type SurahMeta } from "@/lib/surahs";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/surahdle")({
  head: () => meta("Mystery Surah — Guess the Daily Surah", "Guess the mystery surah of the day in six tries using clues about its position, length and revelation."),
  component: Surahdle,
});

function HintCell({ label, value, hint }: { label: string; value: string; hint: Hint | boolean }) {
  const ok = hint === true || hint === "equal";
  return (
    <div className={`rounded-xl border p-2 text-center ${ok ? "border-gold bg-gold/15 text-gold" : "border-border"}`}>
      <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="flex items-center justify-center gap-1 text-sm tabular-nums">
        {value}
        {hint === "higher" && <ArrowUp className="h-3.5 w-3.5" />}
        {hint === "lower" && <ArrowDown className="h-3.5 w-3.5" />}
        {ok && <Check className="h-3.5 w-3.5" />}
      </p>
    </div>
  );
}

function Surahdle() {
  const [list, setList] = useState<SurahMeta[]>([]);
  const [error, setError] = useState(false);
  const [practice, setPractice] = useState<number | null>(null);
  const [guesses, setGuesses] = useState<SurahMeta[]>([]);
  const [text, setText] = useState("");
  useEffect(() => { fetchSurahList().then(setList).catch(() => setError(true)); }, []);

  const secret = list.length ? list[practice ?? dailyIndex(new Date(), list.length)] : undefined;
  const won = !!secret && guesses.some((g) => g.number === secret.number);
  const lost = !won && guesses.length >= SURAHDLE_TRIES;
  const options = useMemo(() => list.filter((s) => !guesses.includes(s)), [list, guesses]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret || won || lost) return;
    const t = text.trim().toLowerCase();
    const s = options.find((o) => o.nameEnglish.toLowerCase() === t || o.nameArabic === text.trim() || String(o.number) === t);
    if (!s) return;
    const g = [...guesses, s]; setGuesses(g); setText("");
    if (s.number === secret.number) sfx.win(); else if (g.length >= SURAHDLE_TRIES) sfx.lose(); else sfx.wrong();
  };
  const newPractice = () => { setPractice(Math.floor(Math.random() * list.length)); setGuesses([]); };

  return (
    <GameShell theme="theme-indigo" ar="السورة الغامضة" title="Mystery Surah" subtitle={practice === null ? "Guess today's mystery surah in six tries." : "Practice round — guess the surah."}
      status={`${guesses.length} / ${SURAHDLE_TRIES} guesses`}>
      {error ? <div className="panel mt-8 p-8 text-center text-sm">Couldn't load the surahs.</div>
        : !secret ? <div className="panel mt-8 p-8 text-center text-sm text-muted-foreground">Loading…</div> : (
        <>
          {!won && !lost && (
            <form onSubmit={submit} className="mt-8 flex gap-2">
              <input list="surah-list" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a surah name or number…"
                className="name-input flex-1 rounded-xl border border-input px-4 py-3 text-sm outline-none" />
              <datalist id="surah-list">{options.map((s) => <option key={s.number} value={s.nameEnglish}>{s.number} · {s.nameArabic}</option>)}</datalist>
              <button className="btn-gold">Guess</button>
            </form>
          )}
          <div className="mt-6 grid gap-3">
            {guesses.map((g) => {
              const c = compareSurah(g, secret);
              return (
                <div key={g.number} className="panel p-3">
                  <p className="mb-2 flex justify-between text-sm"><span>{g.nameEnglish}</span><span className="font-arabic">{g.nameArabic}</span></p>
                  <div className="grid grid-cols-4 gap-2">
                    <HintCell label="Number" value={String(g.number)} hint={c.number} />
                    <HintCell label="Verses" value={String(g.verses)} hint={c.verses} />
                    <HintCell label="Revealed #" value={String(g.order)} hint={c.order} />
                    <HintCell label="Place" value={g.place === "makkah" ? "Makki" : "Madani"} hint={c.place} />
                  </div>
                </div>
              );
            })}
          </div>
          {(won || lost) && (
            <div className="panel result-panel mt-6 p-6 text-center">
              <p className="text-sm text-muted-foreground">{won ? `Solved in ${guesses.length}!` : "The surah was"}</p>
              <p className="mt-2 font-arabic text-4xl text-gold">{secret.nameArabic}</p>
              <p className="font-display text-2xl">{secret.number}. {secret.nameEnglish}</p>
              <button className="btn-gold mt-5" onClick={newPractice}>Practice another</button>
            </div>
          )}
          <p className="mt-6 text-center text-xs text-muted-foreground">Arrows show whether the mystery surah's value is higher or lower.</p>
        </>
      )}
    </GameShell>
  );
}

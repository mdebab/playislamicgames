import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { NAMES_TIME_LIMIT, fetchNames, matchName, type AllahName } from "@/lib/names";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/names")({
  head: () => ({
    meta: [
      { title: "99 Names of Allah — Timed Recall" },
      { name: "description", content: "Type all 99 Names of Allah (Asma ul-Husna) in Arabic or transliteration before the timer runs out." },
      { property: "og:title", content: "99 Names of Allah — Timed Recall" },
      { property: "og:description", content: "How many of the 99 Names can you recall before time runs out?" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NamesGame,
});

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function NamesGame() {
  const [names, setNames] = useState<AllahName[] | null>(null);
  const [error, setError] = useState(false);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [left, setLeft] = useState(NAMES_TIME_LIMIT);
  const [status, setStatus] = useState<"idle" | "playing" | "over">("idle");
  const [input, setInput] = useState("");
  const [flash, setFlash] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchNames().then(setNames).catch(() => setError(true)); }, []);

  useEffect(() => {
    if (status !== "playing") return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [status]);
  useEffect(() => { if (status === "playing" && left <= 0) { setStatus("over"); sfx.lose(); } }, [left, status]);

  const start = () => { setFound(new Set()); setLeft(NAMES_TIME_LIMIT); setInput(""); setStatus("playing"); setTimeout(() => inputRef.current?.focus(), 0); };

  const onType = (v: string) => {
    setInput(v);
    if (!names || status !== "playing") return;
    const n = matchName(v, names, found);
    if (n === null) return;
    const next = new Set(found).add(n);
    setFound(next); setInput(""); setFlash(n); sfx.correct();
    if (next.size === names.length) { setStatus("over"); sfx.win(); }
  };

  const total = names?.length ?? 99;
  return (
    <main className="pattern-bg game-dark theme-blue min-h-screen px-5 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <div className="game-toolbar">
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-gold">← Games</Link>
          <p className="text-xs tabular-nums text-muted-foreground">{found.size} / {total} found</p>
        </div>
        <header className="mt-8 text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">Asma ul-Husna</p>
          <p className="mt-3 font-arabic text-5xl leading-snug text-gold">الأسماء الحسنى</p>
          <h1 className="mt-2 font-display text-4xl font-medium">The 99 Names</h1>
          <p className="mt-2 text-sm text-muted-foreground">Recall as many as you can before time runs out.</p>
          <p className={`timer-display font-display text-3xl tabular-nums ${left <= 30 && status === "playing" ? "text-destructive" : ""}`}>{fmt(Math.max(left, 0))}</p>
        </header>

        {error ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">Couldn't load the names. Refresh to try again.</p>
        ) : !names ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <div className="name-controls mx-auto mt-7 flex max-w-md flex-col items-center gap-3">
              {status === "playing" ? (
                <>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => onType(e.target.value)}
                    placeholder="Type a name, e.g. Ar-Rahman or الرحمن"
                    className="name-input w-full rounded-xl border border-border bg-card px-4 py-3 text-center outline-none focus:border-gold"
                    autoComplete="off" spellCheck={false}
                  />
                  <button className="text-xs text-muted-foreground hover:text-gold" onClick={() => { setStatus("over"); sfx.lose(); }}>Give up</button>
                </>
              ) : (
                <>
                  {status === "over" && (
                    <p className="text-center">
                      {found.size === total ? "MashaAllah — all 99 names!" : `You found ${found.size} of ${total}.`}
                      <span className="block text-xs text-muted-foreground">Missed names are shown faded below.</span>
                    </p>
                  )}
                  <button className="btn-gold" onClick={start}>{status === "idle" ? `Start (${fmt(NAMES_TIME_LIMIT)})` : "Play again"}</button>
                </>
              )}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-9">
              {names.map((n) => {
                const got = found.has(n.number);
                const reveal = got || status === "over";
                return (
                  <div
                    key={n.number}
                    title={reveal ? `${n.transliteration} — ${n.english}` : undefined}
                    className={`panel name-cell flex flex-col items-center justify-center p-2 text-center transition ${got ? "name-cell-found" : ""} ${!got && reveal ? "opacity-40" : ""} ${flash === n.number ? "scale-105" : ""}`}
                  >
                    {reveal ? (
                      <>
                        <span className="font-arabic text-base leading-tight text-gold">{n.arabic}</span>
                        <span className="mt-0.5 text-[0.65rem] leading-tight">{n.transliteration}</span>
                      </>
                    ) : (
                      <span className="text-xs tabular-nums text-muted-foreground">{n.number}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

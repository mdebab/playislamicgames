import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { GameShell, ResultPanel, meta } from "@/components/GameShell";
import { shuffle } from "@/lib/quran";
import { PAIRS_PER_BOARD, VOCAB_BOARDS, VOCAB_TIME, fetchVocab, type Word } from "@/lib/vocab";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/words-match")({
  head: () => meta("Quranic Words Match — Vocabulary Sprint", "Match Arabic words from Juz Amma verses to their meanings before the clock runs out."),
  component: WordsMatch,
});

function WordsMatch() {
  const [boards, setBoards] = useState<Word[][]>([]);
  const [board, setBoard] = useState(0);
  const [en, setEn] = useState<Word[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<Word | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [left, setLeft] = useState(VOCAB_TIME);
  const [over, setOver] = useState<null | "won" | "time">(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const start = useCallback(async () => {
    setLoading(true); setError(false); setOver(null);
    let words: Word[];
    try { words = await fetchVocab(); } catch { setError(true); setLoading(false); return; }
    if (words.length < PAIRS_PER_BOARD * VOCAB_BOARDS) { setError(true); setLoading(false); return; }
    setLoading(false);
    const b = Array.from({ length: VOCAB_BOARDS }, (_, i) => words.slice(i * PAIRS_PER_BOARD, (i + 1) * PAIRS_PER_BOARD));
    setBoards(b); setBoard(0); setEn(shuffle(b[0]!)); setMatched(new Set()); setSel(null);
    setMistakes(0); setLeft(VOCAB_TIME); setOver(null);
  }, []);
  useEffect(() => { void start(); }, [start]);
  useEffect(() => {
    if (over || loading || error) return;
    if (left <= 0) { setOver("time"); sfx.lose(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, over, loading, error]);

  const tapEn = (w: Word) => {
    if (!sel || matched.has(w.ar) || over) return;
    if (w.ar === sel.ar) {
      const m = new Set(matched); m.add(w.ar); setMatched(m); setSel(null); sfx.correct();
      if (m.size === PAIRS_PER_BOARD) {
        if (board + 1 >= boards.length) { setOver("won"); sfx.win(); }
        else { sfx.verse(); setTimeout(() => { setBoard(board + 1); setEn(shuffle(boards[board + 1]!)); setMatched(new Set()); }, 400); }
      }
    } else { setMistakes((x) => x + 1); setWrong(w.ar); sfx.wrong(); setTimeout(() => setWrong(null), 400); }
  };

  const cur = boards[board] ?? [];
  return (
    <GameShell theme="theme-ruby" ar="كلمات القرآن" title="Words Match" subtitle="Words from Juz Amma: tap an Arabic word, then its meaning."
      status={!over && `Board ${board + 1} / ${VOCAB_BOARDS} · ${left}s`} progress={over ? undefined : (board * PAIRS_PER_BOARD + matched.size) / (VOCAB_BOARDS * PAIRS_PER_BOARD)}>
      {error ? (
        <div className="panel mt-8 p-8 text-center"><p>Couldn't load words.</p><button className="btn-gold mt-4" onClick={() => void start()}>Retry</button></div>
      ) : loading ? (
        <p className="mt-10 text-center text-muted-foreground">Loading words from the Quran…</p>
      ) : over ? (
        <ResultPanel big={over === "won" ? `${VOCAB_TIME - left}s` : "Time's up"} label={over === "won" ? `all ${VOCAB_BOARDS * PAIRS_PER_BOARD} words matched · ${mistakes} mistakes` : `you reached board ${board + 1}`} onAgain={() => void start()} />
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            {cur.map((w) => (
              <button key={w.ar} disabled={matched.has(w.ar)} onClick={() => setSel(w)}
                className={`btn-ghost choice-btn font-arabic text-2xl ${matched.has(w.ar) ? "opacity-25" : sel?.ar === w.ar ? "choice-correct" : ""}`}>{w.ar}</button>
            ))}
          </div>
          <div className="grid gap-3">
            {en.map((w) => (
              <button key={w.ar} disabled={matched.has(w.ar)} onClick={() => tapEn(w)}
                className={`btn-ghost choice-btn text-sm ${matched.has(w.ar) ? "opacity-25" : wrong === w.ar ? "choice-wrong" : ""}`}>{w.en}</button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}

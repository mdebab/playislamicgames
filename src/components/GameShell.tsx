import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function GameShell({ theme, ar, title, subtitle, status, progress, children }: {
  theme: string; ar: string; title: string; subtitle: string; status?: ReactNode; progress?: number | undefined; children: ReactNode;
}) {
  return (
    <main className={`pattern-bg game-dark ${theme} min-h-screen px-5 py-10`}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="game-toolbar">
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-gold">← Games</Link>
          {status && <p className="text-xs tabular-nums text-muted-foreground">{status}</p>}
        </div>
        <header className="mt-8 text-center">
          <p className="font-arabic text-4xl leading-snug text-gold">{ar}</p>
          <h1 className="mt-2 font-display text-4xl font-medium">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          {progress !== undefined && (
            <div className="mx-auto mt-5 max-w-xs"><div className="progress-track"><div className="progress-fill" style={{ width: `${progress * 100}%` }} /></div></div>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}

export function ResultPanel({ big, label, onAgain }: { big: string; label: string; onAgain: () => void }) {
  return (
    <div className="panel result-panel mt-8 p-8 text-center">
      <p className="font-display text-5xl text-gold">{big}</p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button className="btn-gold" onClick={onAgain}>Play again</button>
        <Link to="/" className="btn-ghost">Games</Link>
      </div>
    </div>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ],
});

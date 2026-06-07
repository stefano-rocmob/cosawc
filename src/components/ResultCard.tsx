"use client";

import type { TournamentResult } from "@/game/types";

type Props = {
  result: TournamentResult;
  overall: number;
  seed: string;
  shareUrl?: string;
  onPlayAgain?: () => void;
};

export function ResultCard({
  result,
  overall,
  seed,
  shareUrl,
  onPlayAgain,
}: Props) {
  return (
    <div className="panel result-card">
      <p className="eyebrow">Final result</p>
      <h2>{result.champion ? "World Cup Champions!" : "Eliminated"}</h2>
      <p>
        Record {result.record} · {result.gf} GF / {result.ga} GA · Overall {overall}
      </p>
      <p className="eyebrow">Seed {seed}</p>
      {result.badge && <div className="badge">{result.badge}</div>}
      {shareUrl && (
        <p style={{ marginTop: "1rem", wordBreak: "break-all" }}>
          Share: {shareUrl}
        </p>
      )}
      {onPlayAgain && (
        <div className="btn-row" style={{ justifyContent: "center" }}>
          <button type="button" className="primary" onClick={onPlayAgain}>
            Play again
          </button>
        </div>
      )}
    </div>
  );
}

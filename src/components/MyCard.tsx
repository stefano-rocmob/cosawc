"use client";

import { countryDisplay, formatAllPlayerPositions } from "@/game/positionLabels";
import { APP_VERSION } from "@/version";
import { tournamentTitle } from "@/game/matchDisplay";
import type { Player, TournamentResult } from "@/game/types";

type Props = {
  result: TournamentResult;
  overall: number;
  seed: string;
  lineup: Player[];
  shareUrl?: string;
  onBack?: () => void;
  onPlayAgain: () => void;
};

export function MyCard({
  result,
  overall,
  seed,
  lineup,
  shareUrl,
  onBack,
  onPlayAgain,
}: Props) {
  const title = tournamentTitle(result);

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      // ignore
    }
  };

  return (
    <div className="my-card-page">
      <div className="my-card">
        <div className="my-card-top">
          <div className="my-card-brand">
            <span className="brand-name">COSA WC — v{APP_VERSION}</span>
          </div>
          <span className="eyebrow my-card-seed">seed #{seed}</span>
        </div>

        <h2 className="my-card-status">{title}</h2>
        <p className="my-card-record">{result.record}</p>

        <div className="my-card-stats">
          <div className="my-card-stat">
            <strong>{result.gf}</strong>
            <span className="eyebrow">Goals for</span>
          </div>
          <div className="my-card-stat">
            <strong>{result.ga}</strong>
            <span className="eyebrow">Against</span>
          </div>
          <div className="my-card-stat">
            <strong>{overall}</strong>
            <span className="eyebrow">Overall</span>
          </div>
          <div className="my-card-stat is-highlight">
            <strong>{result.wins}</strong>
            <span className="eyebrow">Wins</span>
          </div>
        </div>

        <ul className="my-card-lineup">
          {lineup.map((player) => {
            const country = countryDisplay(player.sel);
            return (
              <li key={player.playerId} className="my-card-player">
                <span className="my-card-num">{player.number}</span>
                <span className="my-card-player-name">
                  {player.name}
                  {player.legend && <span className="legend-star"> ★</span>}
                </span>
                <span className="my-card-player-meta">
                  {country.flag} {player.sel} {player.copa}
                </span>
                <span className="my-card-player-pos">
                  {formatAllPlayerPositions(player.positions)}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="my-card-footer">cosa wc · build yours</p>

        <div className="my-card-actions">
          <button type="button" className="roll-cta" onClick={onPlayAgain}>
            Play again
          </button>
          {shareUrl && (
            <button type="button" className="secondary" onClick={copyLink}>
              Share link
            </button>
          )}
          {onBack && (
            <button type="button" className="ghost" onClick={onBack}>
              ← Back to run
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

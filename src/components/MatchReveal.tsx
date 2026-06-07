"use client";

import { USER_TEAM_NAME } from "@/game/matchDisplay";
import type { MatchResult, TournamentResult } from "@/game/types";

type Props = {
  result: TournamentResult;
  revealedCount: number;
  onRevealNext?: () => void;
  revealMode: "manual" | "auto";
};

export function MatchReveal({
  result,
  revealedCount,
  onRevealNext,
  revealMode,
}: Props) {
  const visible = result.campaign.slice(0, revealedCount);

  return (
    <div>
      <div className="btn-row">
        {revealMode === "manual" && onRevealNext && revealedCount < result.campaign.length && (
          <button type="button" className="primary" onClick={onRevealNext}>
            Reveal next match
          </button>
        )}
        <span className="progress">
          {revealedCount}/{result.campaign.length} matches revealed
        </span>
      </div>

      {visible.map((match, index) => (
        <FixtureCard key={`${match.phase}-${index}`} match={match} />
      ))}
    </div>
  );
}

function FixtureCard({ match }: { match: MatchResult }) {
  const isFinal = match.phase === "FINAL";
  const isGroup = match.phase === "GRUPOS";
  const won = isGroup ? match.outcome === "V" : match.advanced;

  return (
    <div
      className={[
        "fixture",
        isFinal && won ? "is-final is-win" : "",
        !won && !isGroup ? "is-loss" : "",
      ].join(" ")}
    >
      <div className="fixture-header">
        <div>
          <div className="eyebrow">{match.phase}</div>
          <div>{match.opp}</div>
          <div className="eyebrow">
            {match.oppSel} {match.oppCopa} · OVR {match.oppOverall}
          </div>
        </div>
        <div className="fixture-score">
          {match.gf} – {match.ga}
          {match.penalties && match.pens ? ` (${match.pens.score} pens)` : ""}
        </div>
      </div>

      <div className="fixture-details">
        {match.scorers.length > 0 && (
          <div>Scorers: {match.scorers.join(", ")}</div>
        )}
        {match.conceded.length > 0 && (
          <div>Conceded: {match.conceded.join(", ")}</div>
        )}
        {match.goals.length > 0 && (
          <div>
            Timeline:{" "}
            {match.goals
              .map((g) => `${g.min}' ${g.scorer}${g.opp ? " (opp)" : ""}`)
              .join(" · ")}
          </div>
        )}
        {match.groupTable && (
          <table className="group-table">
            <thead>
              <tr>
                <th>Team</th>
                <th>Pts</th>
                <th>GD</th>
                <th>GF</th>
              </tr>
            </thead>
            <tbody>
              {match.groupTable.map((row, i) => (
                <tr key={i} className={row.me ? "me" : ""}>
                  <td>{row.me ? USER_TEAM_NAME : `${row.sel} ${row.copa}`}</td>
                  <td>{row.pts}</td>
                  <td>{row.gd}</td>
                  <td>{row.gf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isGroup && (
          <div>{won ? "Advanced" : "Eliminated"}</div>
        )}
      </div>
    </div>
  );
}

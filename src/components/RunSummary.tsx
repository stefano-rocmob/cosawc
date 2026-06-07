"use client";

import {
  matchOutcomeKind,
  matchScoreLabel,
  opponentLabel,
  phaseLabel,
} from "@/game/matchDisplay";
import type { MatchResult, TournamentResult } from "@/game/types";
import { GroupStandings } from "./GroupStandings";
import { PenaltyReveal } from "./PenaltyReveal";

const GROUP_COUNT = 3;

type Props = {
  result: TournamentResult;
  overall: number;
  onReplay: () => void;
  onSeeCard: () => void;
};

function SummaryRow({ match }: { match: MatchResult }) {
  const outcome = matchOutcomeKind(match);
  const showPens = match.penalties && match.pens;

  return (
    <div className={`run-summary-row is-${outcome}`}>
      <div className="run-summary-main">
        <div className="run-summary-left">
          <span className="eyebrow">{phaseLabel(match.phase)}</span>
          <div className="run-match-opp">
            <span className="run-vs">vs</span>
            <span className="run-opp-name">
              {opponentLabel(match.oppTeam, match.oppYear)}
            </span>
          </div>
          {match.scorers.length > 0 && (
            <p className="run-goals-summary">
              <span className="eyebrow">Goals</span> {match.scorers.join(", ")}
            </p>
          )}
          {match.conceded.length > 0 && (
            <p className="run-conceded-summary">
              <span className="eyebrow">Conceded</span>{" "}
              {match.conceded.join(", ")}
            </p>
          )}
        </div>
        <div className={`run-match-score is-${outcome}`}>
          {matchScoreLabel(match)}
          {outcome !== "loss" && <span className="run-outcome-icon">✓</span>}
          {outcome === "loss" && <span className="run-outcome-icon">✕</span>}
          <span className="run-chevron" aria-hidden>
            ›
          </span>
        </div>
      </div>
      {showPens && match.pens && (
        <PenaltyReveal
          pens={match.pens}
          visibleKicks={
            match.pens.me.length +
            match.pens.them.length +
            (match.pens.sd
              ? match.pens.sd.me.length + match.pens.sd.them.length
              : 0)
          }
          advanced={match.advanced}
          phase={match.phase}
        />
      )}
    </div>
  );
}

export function RunSummary({ result, overall, onReplay, onSeeCard }: Props) {
  const groupMatch = result.campaign.find((m) => m.groupTable);
  const groupMatches = result.campaign.slice(0, GROUP_COUNT);
  const knockoutMatches = result.campaign.slice(GROUP_COUNT);

  return (
    <div className="run-summary">
      <div className="run-summary-list">
        {groupMatches.map((match, i) => (
          <SummaryRow key={`group-${match.oppTeam}-${i}`} match={match} />
        ))}

        {groupMatch?.groupTable && (
          <GroupStandings
            table={groupMatch.groupTable}
            advanced={groupMatch.advanced}
          />
        )}

        {knockoutMatches.map((match, i) => (
          <SummaryRow key={`ko-${match.oppTeam}-${i}`} match={match} />
        ))}
      </div>

      <div className="run-stats-bar">
        <div className="run-record-block">
          <div className="run-record">{result.record}</div>
          <span className="run-record-label">Wins · Losses</span>
        </div>
        <div className="run-stats-grid">
          <div className="run-stat">
            <strong>{result.gf}</strong>
            <span className="run-stat-label">Goals for</span>
          </div>
          <div className="run-stat">
            <strong>{result.ga}</strong>
            <span className="run-stat-label">Goals against</span>
          </div>
          <div className="run-stat">
            <strong>{overall}</strong>
            <span className="run-stat-label">Overall rating</span>
          </div>
          <div className="run-stat is-highlight">
            <strong>{result.wins}</strong>
            <span className="run-stat-label">Wins</span>
          </div>
        </div>
      </div>

      <div className="run-summary-actions">
        <button type="button" className="secondary run-replay-btn" onClick={onReplay}>
          ↺ Replay
        </button>
        <button type="button" className="roll-cta run-card-btn" onClick={onSeeCard}>
          See my card →
        </button>
      </div>
    </div>
  );
}

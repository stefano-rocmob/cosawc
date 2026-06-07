"use client";

import {
  matchOutcomeKind,
  matchScoreLabel,
  opponentLabel,
  phaseLabel,
  runningScore,
  sortedGoals,
} from "@/game/matchDisplay";
import type { MatchResult } from "@/game/types";
import { GoalTimeline } from "./GoalTimeline";
import { PenaltyReveal, totalPenaltySteps } from "./PenaltyReveal";

type Props = {
  match: MatchResult;
  visibleGoals: number;
  visiblePenKicks: number;
  showFinalScore?: boolean;
};

export function MatchRevealCard({
  match,
  visibleGoals,
  visiblePenKicks,
  showFinalScore = false,
}: Props) {
  const goals = sortedGoals(match);
  const outcome = matchOutcomeKind(match);
  const live = runningScore(goals, visibleGoals);
  const pensTotal = match.pens ? totalPenaltySteps(match.pens) : 0;
  const goalsDone = visibleGoals >= goals.length;
  const pensDone = !match.penalties || !match.pens || visiblePenKicks >= pensTotal;
  const animationComplete = showFinalScore && goalsDone && pensDone;

  let scoreText: string;
  if (animationComplete) {
    scoreText = matchScoreLabel(match);
  } else if (goalsDone && match.penalties) {
    scoreText = `${match.gf}-${match.ga}`;
  } else {
    scoreText = `${live.gf}-${live.ga}`;
  }

  return (
    <article className={`run-match is-${outcome}${animationComplete ? " is-settled" : " is-live"}`}>
      <div className="run-match-head">
        <div className="run-match-meta">
          <span className="eyebrow">{phaseLabel(match.phase)}</span>
          <div className="run-match-opp">
            <span className="run-vs">vs</span>
            <span className="run-opp-name">
              {opponentLabel(match.oppTeam, match.oppYear)}
            </span>
          </div>
        </div>
        <div
          className={`run-match-score${animationComplete ? ` is-${outcome}` : " is-live"}`}
        >
          {scoreText}
          {animationComplete && outcome !== "loss" && (
            <span className="run-outcome-icon">✓</span>
          )}
          {animationComplete && outcome === "loss" && (
            <span className="run-outcome-icon">✕</span>
          )}
        </div>
      </div>

      <GoalTimeline goals={goals} visibleCount={visibleGoals} />

      {match.penalties && match.pens && goalsDone && (
        <PenaltyReveal
          pens={match.pens}
          visibleKicks={visiblePenKicks}
          advanced={match.advanced}
          phase={match.phase}
        />
      )}

      {animationComplete && !match.penalties && match.scorers.length > 0 && (
        <p className="run-goals-summary">
          <span className="eyebrow">Goals</span> {match.scorers.join(", ")}
        </p>
      )}

      {animationComplete && match.conceded.length > 0 && (
        <p className="run-conceded-summary">
          <span className="eyebrow">Conceded</span>{" "}
          {match.conceded.join(", ")}
        </p>
      )}
    </article>
  );
}

export function completedMatchProps(match: MatchResult) {
  const goals = sortedGoals(match);
  const pens = match.pens ? totalPenaltySteps(match.pens) : 0;
  return {
    match,
    visibleGoals: goals.length,
    visiblePenKicks: pens,
    showFinalScore: true,
  };
}

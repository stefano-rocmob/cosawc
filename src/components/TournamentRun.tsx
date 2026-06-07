"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { sortedGoals } from "@/game/matchDisplay";
import type { Player, TournamentResult } from "@/game/types";
import { GroupStandings } from "./GroupStandings";
import {
  completedMatchProps,
  MatchRevealCard,
} from "./MatchRevealCard";
import { MyCard } from "./MyCard";
import { RunSummary } from "./RunSummary";
import { totalPenaltySteps } from "./PenaltyReveal";

type View = "reveal" | "summary" | "card";

type Props = {
  result: TournamentResult;
  seed: string;
  overall: number;
  lineup: Player[];
  revealMode: "manual" | "auto";
  shareUrl?: string;
  onPlayAgain: () => void;
};

const GOAL_DELAY_MS = 700;
const PEN_DELAY_MS = 550;
const MATCH_ADVANCE_MS = 1200;

const GROUP_COUNT = 3;
const LAST_GROUP_INDEX = GROUP_COUNT - 1;

export function TournamentRun({
  result,
  seed,
  overall,
  lineup,
  revealMode,
  shareUrl,
  onPlayAgain,
}: Props) {
  const [view, setView] = useState<View>("reveal");
  const [matchIndex, setMatchIndex] = useState(0);
  const [started, setStarted] = useState(revealMode === "auto");
  const [visibleGoals, setVisibleGoals] = useState(0);
  const [visiblePenKicks, setVisiblePenKicks] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  const match = result.campaign[matchIndex];
  const goals = match ? sortedGoals(match) : [];
  const totalPens = match?.pens ? totalPenaltySteps(match.pens) : 0;
  const isLastMatch = matchIndex >= result.campaign.length - 1;

  const groupStandingsMatch = useMemo(
    () => result.campaign.find((m) => m.groupTable),
    [result.campaign],
  );

  const groupStageComplete =
    matchIndex >= LAST_GROUP_INDEX &&
    (matchIndex > LAST_GROUP_INDEX || animDone);

  const settledGroupMatches = result.campaign.slice(
    0,
    Math.min(matchIndex, GROUP_COUNT),
  );
  const inGroupPhase = matchIndex < GROUP_COUNT;
  const settledKnockoutMatches =
    matchIndex > GROUP_COUNT
      ? result.campaign.slice(GROUP_COUNT, matchIndex)
      : [];

  const resetReveal = useCallback(() => {
    setView("reveal");
    setMatchIndex(0);
    setStarted(revealMode === "auto");
    setVisibleGoals(0);
    setVisiblePenKicks(0);
    setAnimDone(false);
  }, [revealMode]);

  const advanceMatch = useCallback(() => {
    if (isLastMatch) {
      setView("summary");
      return;
    }
    setMatchIndex((i) => i + 1);
    setVisibleGoals(0);
    setVisiblePenKicks(0);
    setAnimDone(false);
  }, [isLastMatch]);

  useEffect(() => {
    if (view !== "reveal" || !started || !match || animDone) return;

    if (visibleGoals < goals.length) {
      const t = setTimeout(() => setVisibleGoals((g) => g + 1), GOAL_DELAY_MS);
      return () => clearTimeout(t);
    }

    if (match.penalties && match.pens && visiblePenKicks < totalPens) {
      const t = setTimeout(
        () => setVisiblePenKicks((k) => k + 1),
        PEN_DELAY_MS,
      );
      return () => clearTimeout(t);
    }

    setAnimDone(true);
  }, [
    view,
    started,
    match,
    animDone,
    visibleGoals,
    goals.length,
    visiblePenKicks,
    totalPens,
    match?.penalties,
    match?.pens,
  ]);

  useEffect(() => {
    if (view !== "reveal" || revealMode !== "auto" || !animDone) return;
    const t = setTimeout(advanceMatch, MATCH_ADVANCE_MS);
    return () => clearTimeout(t);
  }, [view, revealMode, animDone, advanceMatch]);

  useEffect(() => {
    if (revealMode === "auto" && view === "reveal" && !started) {
      setStarted(true);
    }
  }, [revealMode, view, started]);

  if (view === "card") {
    return (
      <div className="run-page">
        <MyCard
          result={result}
          overall={overall}
          seed={seed}
          lineup={lineup}
          shareUrl={shareUrl}
          onBack={() => setView("summary")}
          onPlayAgain={onPlayAgain}
        />
      </div>
    );
  }

  return (
    <div className="run-page">
      <div className="run-page-head">
        <p className="eyebrow">The run</p>
        <h2 className="run-subtitle">The run</h2>
      </div>

      {view === "reveal" && (
        <div className="run-reveal">
          {!started && (
            <button
              type="button"
              className="roll-cta run-start-btn"
              onClick={() => setStarted(true)}
            >
              Reveal 1st match →
            </button>
          )}

          {started &&
            settledGroupMatches.map((m, i) => (
              <MatchRevealCard
                key={`group-done-${m.oppTeam}-${m.oppYear}-${i}`}
                {...completedMatchProps(m)}
              />
            ))}

          {started && inGroupPhase && match && (
            <MatchRevealCard
              match={match}
              visibleGoals={visibleGoals}
              visiblePenKicks={visiblePenKicks}
              showFinalScore={animDone}
            />
          )}

          {groupStageComplete && groupStandingsMatch?.groupTable && (
            <GroupStandings
              table={groupStandingsMatch.groupTable}
              advanced={groupStandingsMatch.advanced}
            />
          )}

          {started &&
            settledKnockoutMatches.map((m, i) => (
              <MatchRevealCard
                key={`ko-done-${m.oppTeam}-${m.oppYear}-${i}`}
                {...completedMatchProps(m)}
              />
            ))}

          {started && !inGroupPhase && match && (
            <MatchRevealCard
              match={match}
              visibleGoals={visibleGoals}
              visiblePenKicks={visiblePenKicks}
              showFinalScore={animDone}
            />
          )}

          {started && animDone && (
            <button
              type="button"
              className="roll-cta run-next-btn"
              onClick={advanceMatch}
            >
              {isLastMatch ? "See full run →" : "Next match →"}
            </button>
          )}
        </div>
      )}

      {view === "summary" && (
        <RunSummary
          result={result}
          overall={overall}
          onReplay={resetReveal}
          onSeeCard={() => setView("card")}
        />
      )}
    </div>
  );
}

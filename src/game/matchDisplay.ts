import { countryDisplay } from "./positionLabels";
import type { GoalEvent, MatchResult } from "./types";

export const USER_TEAM_NAME = "COSA NYC";

export const PHASE_DISPLAY: Record<string, string> = {
  GROUP: "GROUPS",
  R16: "ROUND OF 16",
  QF: "QUARTERS",
  SF: "SEMI",
  FINAL: "FINAL",
};

export function phaseLabel(phase: string): string {
  return PHASE_DISPLAY[phase] ?? phase;
}

export function opponentLabel(team: string, year: number): string {
  const { name, flag } = countryDisplay(team);
  return `${flag} ${name} ${year}`;
}

export function matchOutcomeKind(
  match: MatchResult,
): "win" | "draw" | "loss" {
  if (match.phase === "GROUP") {
    if (match.outcome === "W") return "win";
    if (match.outcome === "D") return "draw";
    return "loss";
  }
  if (match.penalties) return match.advanced ? "draw" : "loss";
  if (match.outcome === "W") return "win";
  return "loss";
}

export function matchScoreLabel(match: MatchResult): string {
  if (match.penalties) return `${match.gf}-${match.ga} pens`;
  return `${match.gf}-${match.ga}`;
}

export function penaltyResultLabel(
  phase: string,
  advanced: boolean,
): string {
  if (!advanced) return "out";
  if (phase === "FINAL") return "World Cup Winner";
  return "advanced";
}

export function runningScore(
  goals: GoalEvent[],
  visibleCount: number,
): { gf: number; ga: number } {
  let gf = 0;
  let ga = 0;
  for (let i = 0; i < visibleCount; i++) {
    const g = goals[i];
    if (!g) continue;
    if (g.opp) ga++;
    else gf++;
  }
  return { gf, ga };
}

export function sortedGoals(match: MatchResult): GoalEvent[] {
  return [...match.goals].sort((a, b) => a.min - b.min);
}

export function penaltyKickCount(pens: NonNullable<MatchResult["pens"]>): number {
  const regular = pens.me.length + pens.them.length;
  const sd = pens.sd ? pens.sd.me.length + pens.sd.them.length : 0;
  return regular + sd;
}

export function tournamentTitle(result: { champion: boolean }): string {
  return result.champion ? "CHAMPIONS" : "ELIMINATED";
}

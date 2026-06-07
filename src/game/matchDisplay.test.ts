import { describe, expect, it } from "vitest";
import {
  matchOutcomeKind,
  matchScoreLabel,
  penaltyResultLabel,
  phaseLabel,
  runningScore,
} from "./matchDisplay";
import type { MatchResult } from "./types";

const baseMatch: MatchResult = {
  phase: "GROUP",
  opp: "Test",
  oppOverall: 70,
  gf: 2,
  ga: 1,
  outcome: "W",
  advanced: true,
  oppTeam: "BRA",
  oppYear: 1970,
  scorers: ["Pelé", "Garrincha"],
  conceded: ["Müller"],
  goals: [
    { min: 15, scorer: "Pelé", opp: false },
    { min: 40, scorer: "Müller", opp: true },
    { min: 70, scorer: "Garrincha", opp: false },
  ],
};

describe("matchDisplay", () => {
  it("maps phase labels to EN", () => {
    expect(phaseLabel("GROUP")).toBe("GROUPS");
    expect(phaseLabel("R16")).toBe("ROUND OF 16");
  });

  it("computes running score from goals", () => {
    expect(runningScore(baseMatch.goals, 2)).toEqual({ gf: 1, ga: 1 });
    expect(runningScore(baseMatch.goals, 3)).toEqual({ gf: 2, ga: 1 });
  });

  it("formats regular score", () => {
    expect(matchScoreLabel(baseMatch)).toBe("2-1");
  });

  it("formats penalty score with full-time result", () => {
    expect(
      matchScoreLabel({ ...baseMatch, penalties: true, gf: 2, ga: 2 }),
    ).toBe("2-2 pens");
  });

  it("shows World Cup Winner for final penalty win", () => {
    expect(penaltyResultLabel("FINAL", true)).toBe("World Cup Winner");
    expect(penaltyResultLabel("R16", true)).toBe("advanced");
    expect(penaltyResultLabel("FINAL", false)).toBe("out");
  });

  it("classifies group win", () => {
    expect(matchOutcomeKind(baseMatch)).toBe("win");
  });
});

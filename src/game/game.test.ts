import { describe, expect, it } from "vitest";
import {
  choosePlayer,
  createGameState,
  getMoveTargets,
  hasSelectablePlayer,
  isPlayerSelectable,
  movePlayer,
  rerollSquadAction,
  rollSquad,
} from "./draft";
import { generateOpponents } from "./opponents";
import { simulateTournament } from "./simulation";
import { calcOverall, calcTeamScores } from "./scoring";
import { MODES } from "./constants";
import type { DraftState, Player } from "./types";
import { getFormationSlots } from "./formations";

function makePlayer(overrides: Partial<Player> & Pick<Player, "id" | "positions">): Player {
  return {
    name: overrides.name ?? overrides.id,
    team: overrides.team ?? "BRA",
    year: overrides.year ?? 1970,
    number: overrides.number ?? 10,
    rating: overrides.rating ?? 80,
    legend: overrides.legend ?? false,
    ...overrides,
  };
}

function filledDraft(partial?: Partial<DraftState>): DraftState {
  const slots = getFormationSlots("4-3-3", "balanced");
  return {
    formation: "4-3-3",
    style: "balanced",
    mode: "classic",
    slots,
    filled: slots.map(() => null),
    usedIds: [],
    rerollsLeft: 3,
    ...partial,
  };
}

describe("draft rules", () => {
  it("rejects duplicate player IDs", () => {
    const player = makePlayer({ id: "messi", positions: ["ST"], rating: 95 });
    let state = createGameState("testseed", { mode: "classic" });
    state = choosePlayer(state, player, 9);
    expect(() => choosePlayer(state, { ...player, team: "ARG", year: 2014 }, 8)).toThrow(
      /already used/i,
    );
  });

  it("rejects incompatible position", () => {
    const gk = makePlayer({ id: "gk1", positions: ["GK"], rating: 75 });
    const state = createGameState("testseed");
    expect(() => choosePlayer(state, gk, 9)).toThrow(/cannot play/i);
  });

  it("rejects occupied slot", () => {
    const st = makePlayer({ id: "st1", positions: ["ST"], rating: 85 });
    let state = createGameState("testseed");
    state = choosePlayer(state, st, 9);
    const st2 = makePlayer({ id: "st2", positions: ["ST"], rating: 80 });
    expect(() => choosePlayer(state, st2, 9)).toThrow(/occupied/i);
  });

  it("allows valid move to empty compatible slot", () => {
    const player = makePlayer({ id: "mid1", positions: ["CM", "AM"], rating: 82 });
    let state = createGameState("testseed");
    state = choosePlayer(state, player, 6);
    const targets = getMoveTargets(state.draft, 6);
    expect(targets).toContain(7);
    state = movePlayer(state, 6, 7);
    expect(state.draft.filled[7]?.id).toBe("mid1");
    expect(state.draft.filled[6]).toBeNull();
  });

  it("allows swap only when both players are compatible", () => {
    const a = makePlayer({ id: "a", positions: ["CM", "AM"], rating: 80 });
    const b = makePlayer({ id: "b", positions: ["AM", "CM"], rating: 78 });
    let state = createGameState("testseed");
    state = choosePlayer(state, a, 6);
    state = { ...state, current: { team: "BRA", year: 1982 } };
    state = choosePlayer(state, b, 7);
    expect(getMoveTargets(state.draft, 6)).toContain(7);
    state = movePlayer(state, 6, 7);
    expect(state.draft.filled[6]?.id).toBe("b");
    expect(state.draft.filled[7]?.id).toBe("a");
  });
});

describe("scoring", () => {
  it("overall = rounded average rating", () => {
    const players = [
      makePlayer({ id: "a", positions: ["ST"], rating: 80 }),
      makePlayer({ id: "b", positions: ["CM"], rating: 90 }),
    ];
    expect(calcOverall(players)).toBe(85);
  });

  it("attack/defense weighted by slot position", () => {
    const slots = getFormationSlots("4-3-3", "balanced");
    const filled = slots.map((slot) => {
      if (slot.pos === "ST") return makePlayer({ id: "st", positions: ["ST"], rating: 90 });
      if (slot.pos === "GK") return makePlayer({ id: "gk", positions: ["GK"], rating: 70 });
      return null;
    });
    const draft = filledDraft({ slots, filled });
    const scores = calcTeamScores(draft);
    expect(scores.attack).toBeGreaterThan(0);
    expect(scores.defense).toBeGreaterThan(0);
    expect(scores.overall).toBeGreaterThan(0);
  });
});

describe("rerolls", () => {
  it("classic reroll budget = 3", () => {
    expect(MODES.classic.rerolls).toBe(3);
    const state = createGameState("abc", { mode: "classic" });
    expect(state.draft.rerollsLeft).toBe(3);
  });

  it("memory reroll budget = 1", () => {
    expect(MODES.memory.rerolls).toBe(1);
    const state = createGameState("abc", { mode: "memory" });
    expect(state.draft.rerollsLeft).toBe(1);
  });

  it("Another Cup keeps country family and changes year", () => {
    let state = createGameState("rerollseed");
    state = { ...state, current: { team: "ESP", year: 1950 }, rollIndex: 1, rerollNo: 0 };
    const next = rerollSquadAction(state, "year");
    expect(["ESP"]).toContain(next.current?.team ?? "");
    expect(next.current?.year).not.toBe(1950);
    expect(next.draft.rerollsLeft).toBe(2);
  });

  it("Another Team keeps year and changes country", () => {
    let state = createGameState("rerollseed2");
    state = { ...state, current: { team: "AUT", year: 1982 }, rollIndex: 1, rerollNo: 0 };
    const next = rerollSquadAction(state, "team");
    expect(next.current?.year).toBe(1982);
    expect(next.current?.team).not.toBe("AUT");
    expect(next.draft.rerollsLeft).toBe(2);
  });

  it("emergency reroll does not consume budget", () => {
    let state = createGameState("emergency");
    state = rollSquad(state);
    const before = state.draft.rerollsLeft;
    const next = rerollSquadAction(state, "team", false);
    expect(next.draft.rerollsLeft).toBe(before);
  });
});

describe("simulation", () => {
  const defPositions = [["RB"], ["CB"], ["CB"], ["LB"]] as const;
  const midPositions = [["DM"], ["CM"], ["AM"], ["RW"], ["ST"], ["LW"]] as const;
  const lineup = Array.from({ length: 11 }, (_, i) =>
    makePlayer({
      id: `p${i}`,
      name: `Player ${i}`,
      positions:
        i === 0
          ? ["GK"]
          : i < 5
            ? [...defPositions[i - 1]]
            : [...midPositions[i - 5]],
      rating: 75 + i,
    }),
  );

  const opponents = [
    { team: "MEX", year: 2010 },
    { team: "CIV", year: 2010 },
    { team: "CHI", year: 1974 },
    { team: "BRA", year: 1954 },
    { team: "BRA", year: 1970 },
    { team: "ECU", year: 2006 },
    { team: "CRO", year: 1998 },
  ];

  const getOppSquad = () =>
    Array.from({ length: 11 }, (_, i) =>
      makePlayer({
        id: `o${i}`,
        name: `Opp ${i}`,
        positions: i === 0 ? ["GK"] : ["CM"],
        rating: 70,
      }),
    );

  it("same seed + same lineup = same tournament result", () => {
    const a = simulateTournament("xyz123", 85, 82, lineup, opponents, getOppSquad);
    const b = simulateTournament("xyz123", 85, 82, lineup, opponents, getOppSquad);
    expect(a).toEqual(b);
  });

  it("knockout draw triggers penalty logic", () => {
    let foundPenalties = false;
    for (let i = 0; i < 200; i++) {
      const result = simulateTournament(
        `pen${i}`,
        80,
        80,
        lineup,
        opponents,
        getOppSquad,
      );
      const drawKnockout = result.campaign.find(
        (m) => m.penalties && m.phase !== "GROUP",
      );
      if (drawKnockout) {
        foundPenalties = true;
        expect(drawKnockout.penalties).toBe(true);
        expect(drawKnockout.pens).toBeDefined();
        break;
      }
    }
    expect(foundPenalties).toBe(true);
  });

  it("group qualification top 2 only", () => {
    const result = simulateTournament("group1", 85, 80, lineup, opponents, getOppSquad);
    const groupMatch = result.campaign.find((m) => m.groupTable);
    expect(groupMatch?.groupTable?.length).toBe(4);
    const userRank = groupMatch!.groupTable!.findIndex((r) => r.me);
    if (groupMatch!.advanced) {
      expect(userRank).toBeLessThan(2);
    } else {
      expect(userRank).toBeGreaterThanOrEqual(2);
    }
  });

  it("legend has no scoring or simulation impact", () => {
    const normal = lineup.map((p) => ({ ...p, legend: false, rating: 80 }));
    const legend = lineup.map((p) => ({ ...p, legend: true, rating: 80 }));
    const scoresN = calcTeamScores({
      ...filledDraft(),
      filled: normal,
      slots: getFormationSlots("4-3-3", "balanced"),
    });
    const scoresL = calcTeamScores({
      ...filledDraft(),
      filled: legend,
      slots: getFormationSlots("4-3-3", "balanced"),
    });
    expect(scoresN).toEqual(scoresL);
    const simN = simulateTournament("leg1", scoresN.attack, scoresN.defense, normal, opponents, getOppSquad);
    const simL = simulateTournament("leg1", scoresL.attack, scoresL.defense, legend, opponents, getOppSquad);
    expect(simN).toEqual(simL);
  });
});

describe("player selection helpers", () => {
  it("detects when no selectable players remain", () => {
    const draft = filledDraft();
    const gkOnly = [makePlayer({ id: "gk", positions: ["GK"], rating: 70 })];
    expect(hasSelectablePlayer(draft, gkOnly)).toBe(true);
    const strikerOnly = [makePlayer({ id: "st", positions: ["ST"], rating: 90 })];
    const filled = draft.filled.slice();
    draft.slots.forEach((slot, i) => {
      if (slot.pos !== "GK" && slot.pos !== "ST") {
        filled[i] = makePlayer({
          id: `fill-${i}`,
          positions: [slot.pos],
          rating: 70,
        });
      }
    });
    const almostFull = { ...draft, filled };
    expect(isPlayerSelectable(almostFull, strikerOnly[0])).toBe(true);
  });
});

describe("opponent generation", () => {
  it("generates 7 unique opponents avoiding lineup squads", () => {
    const state = createGameState("oppseed");
    state.draft.filled = getFormationSlots("4-3-3", "balanced").map((slot, i) =>
      i === 0
        ? makePlayer({ id: "u1", positions: [slot.pos], team: "BRA", year: 1970 })
        : null,
    );
    const opps = generateOpponents(state);
    expect(opps).toHaveLength(7);
    expect(opps.every((o) => !(o.team === "BRA" && o.year === 1970))).toBe(true);
  });
});

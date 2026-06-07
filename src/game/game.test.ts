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

function makePlayer(overrides: Partial<Player> & Pick<Player, "playerId" | "positions">): Player {
  return {
    name: overrides.name ?? overrides.playerId,
    sel: overrides.sel ?? "BRA",
    copa: overrides.copa ?? 1970,
    number: overrides.number ?? 10,
    force: overrides.force ?? 80,
    legend: overrides.legend ?? false,
    ...overrides,
  };
}

function filledDraft(partial?: Partial<DraftState>): DraftState {
  const slots = getFormationSlots("4-3-3", "equilibrado");
  return {
    formation: "4-3-3",
    style: "equilibrado",
    mode: "classico",
    slots,
    filled: slots.map(() => null),
    usedPlayerIds: [],
    rerollsLeft: 3,
    ...partial,
  };
}

describe("draft rules", () => {
  it("rejects duplicate player IDs", () => {
    const player = makePlayer({ playerId: "messi", positions: ["CA"], force: 95 });
    let state = createGameState("testseed", { mode: "classico" });
    state = choosePlayer(state, player, 9);
    expect(() => choosePlayer(state, { ...player, sel: "ARG", copa: 2014 }, 8)).toThrow(
      /already used/i,
    );
  });

  it("rejects incompatible position", () => {
    const gk = makePlayer({ playerId: "gk1", positions: ["GOL"], force: 75 });
    const state = createGameState("testseed");
    expect(() => choosePlayer(state, gk, 9)).toThrow(/cannot play/i);
  });

  it("rejects occupied slot", () => {
    const ca = makePlayer({ playerId: "st1", positions: ["CA"], force: 85 });
    let state = createGameState("testseed");
    state = choosePlayer(state, ca, 9);
    const ca2 = makePlayer({ playerId: "st2", positions: ["CA"], force: 80 });
    expect(() => choosePlayer(state, ca2, 9)).toThrow(/occupied/i);
  });

  it("allows valid move to empty compatible slot", () => {
    const player = makePlayer({ playerId: "mid1", positions: ["MC", "MEI"], force: 82 });
    let state = createGameState("testseed");
    state = choosePlayer(state, player, 6);
    const targets = getMoveTargets(state.draft, 6);
    expect(targets).toContain(7);
    state = movePlayer(state, 6, 7);
    expect(state.draft.filled[7]?.playerId).toBe("mid1");
    expect(state.draft.filled[6]).toBeNull();
  });

  it("allows swap only when both players are compatible", () => {
    const a = makePlayer({ playerId: "a", positions: ["MC", "MEI"], force: 80 });
    const b = makePlayer({ playerId: "b", positions: ["MEI", "MC"], force: 78 });
    let state = createGameState("testseed");
    state = choosePlayer(state, a, 6);
    state = { ...state, current: { sel: "BRA", copa: 1982 } };
    state = choosePlayer(state, b, 7);
    expect(getMoveTargets(state.draft, 6)).toContain(7);
    state = movePlayer(state, 6, 7);
    expect(state.draft.filled[6]?.playerId).toBe("b");
    expect(state.draft.filled[7]?.playerId).toBe("a");
  });
});

describe("scoring", () => {
  it("overall = rounded average force", () => {
    const players = [
      makePlayer({ playerId: "a", positions: ["CA"], force: 80 }),
      makePlayer({ playerId: "b", positions: ["MC"], force: 90 }),
    ];
    expect(calcOverall(players)).toBe(85);
  });

  it("attack/defense weighted by slot position", () => {
    const slots = getFormationSlots("4-3-3", "equilibrado");
    const filled = slots.map((slot) => {
      if (slot.pos === "CA") return makePlayer({ playerId: "st", positions: ["CA"], force: 90 });
      if (slot.pos === "GOL") return makePlayer({ playerId: "gk", positions: ["GOL"], force: 70 });
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
  it("classico reroll budget = 3", () => {
    expect(MODES.classico.rerolls).toBe(3);
    const state = createGameState("abc", { mode: "classico" });
    expect(state.draft.rerollsLeft).toBe(3);
  });

  it("almanaque reroll budget = 1", () => {
    expect(MODES.almanaque.rerolls).toBe(1);
    const state = createGameState("abc", { mode: "almanaque" });
    expect(state.draft.rerollsLeft).toBe(1);
  });

  it("Another Cup keeps country family and changes year", () => {
    let state = createGameState("rerollseed");
    state = { ...state, current: { sel: "ESP", copa: 1950 }, rollIndex: 1, rerollNo: 0 };
    const next = rerollSquadAction(state, "copa");
    expect(["ESP"]).toContain(next.current?.sel ?? "");
    expect(next.current?.copa).not.toBe(1950);
    expect(next.draft.rerollsLeft).toBe(2);
  });

  it("Another Team keeps year and changes country", () => {
    let state = createGameState("rerollseed2");
    state = { ...state, current: { sel: "AUT", copa: 1982 }, rollIndex: 1, rerollNo: 0 };
    const next = rerollSquadAction(state, "sel");
    expect(next.current?.copa).toBe(1982);
    expect(next.current?.sel).not.toBe("AUT");
    expect(next.draft.rerollsLeft).toBe(2);
  });

  it("emergency reroll does not consume budget", () => {
    let state = createGameState("emergency");
    state = rollSquad(state);
    const before = state.draft.rerollsLeft;
    const next = rerollSquadAction(state, "sel", false);
    expect(next.draft.rerollsLeft).toBe(before);
  });
});

describe("simulation", () => {
  const defPositions = [["LD"], ["ZAG"], ["ZAG"], ["LE"]] as const;
  const midPositions = [["VOL"], ["MC"], ["MEI"], ["PD"], ["CA"], ["PE"]] as const;
  const lineup = Array.from({ length: 11 }, (_, i) =>
    makePlayer({
      playerId: `p${i}`,
      name: `Player ${i}`,
      positions:
        i === 0
          ? ["GOL"]
          : i < 5
            ? [...defPositions[i - 1]]
            : [...midPositions[i - 5]],
      force: 75 + i,
    }),
  );

  const opponents = [
    { sel: "MEX", copa: 2010 },
    { sel: "CIV", copa: 2010 },
    { sel: "CHI", copa: 1974 },
    { sel: "BRA", copa: 1954 },
    { sel: "BRA", copa: 1970 },
    { sel: "ECU", copa: 2006 },
    { sel: "CRO", copa: 1998 },
  ];

  const getOppSquad = () =>
    Array.from({ length: 11 }, (_, i) =>
      makePlayer({
        playerId: `o${i}`,
        name: `Opp ${i}`,
        positions: i === 0 ? ["GOL"] : ["MC"],
        force: 70,
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
        (m) => m.penalties && m.phase !== "GRUPOS",
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
    const normal = lineup.map((p) => ({ ...p, legend: false, force: 80 }));
    const legend = lineup.map((p) => ({ ...p, legend: true, force: 80 }));
    const scoresN = calcTeamScores({
      ...filledDraft(),
      filled: normal,
      slots: getFormationSlots("4-3-3", "equilibrado"),
    });
    const scoresL = calcTeamScores({
      ...filledDraft(),
      filled: legend,
      slots: getFormationSlots("4-3-3", "equilibrado"),
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
    const gkOnly = [makePlayer({ playerId: "gk", positions: ["GOL"], force: 70 })];
    expect(hasSelectablePlayer(draft, gkOnly)).toBe(true);
    const strikerOnly = [makePlayer({ playerId: "st", positions: ["CA"], force: 90 })];
    const filled = draft.filled.slice();
    draft.slots.forEach((slot, i) => {
      if (slot.pos !== "GOL" && slot.pos !== "CA") {
        filled[i] = makePlayer({
          playerId: `fill-${i}`,
          positions: [slot.pos],
          force: 70,
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
    state.draft.filled = getFormationSlots("4-3-3", "equilibrado").map((slot, i) =>
      i === 0
        ? makePlayer({ playerId: "u1", positions: [slot.pos], sel: "BRA", copa: 1970 })
        : null,
    );
    const opps = generateOpponents(state);
    expect(opps).toHaveLength(7);
    expect(opps.every((o) => !(o.sel === "BRA" && o.copa === 1970))).toBe(true);
  });
});

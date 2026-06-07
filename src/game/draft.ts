import {
  COUNTRY_ALIASES,
  DEFAULT_FORMATION,
  DEFAULT_MODE,
  DEFAULT_STYLE,
  MODES,
  squadKey,
} from "./constants";
import { getFormationSlots } from "./formations";
import { createRng, pick } from "./rng";
import { allSquadRefs, SQUAD_CATALOG } from "./squadCatalog";
import type {
  DraftState,
  FormationKey,
  GameState,
  ModeKey,
  Player,
  RerollAxis,
  SquadRef,
  StyleKey,
} from "./types";

export type GameOptions = {
  formation?: FormationKey;
  style?: StyleKey;
  mode?: ModeKey;
};

function createDraftState(opts: GameOptions): DraftState {
  const formation = opts.formation ?? DEFAULT_FORMATION;
  const style = opts.style ?? DEFAULT_STYLE;
  const mode = opts.mode ?? DEFAULT_MODE;
  const slots = getFormationSlots(formation, style);
  return {
    formation,
    style,
    mode,
    slots,
    filled: slots.map(() => null),
    usedIds: [],
    rerollsLeft: MODES[mode].rerolls,
  };
}

export function createGameState(seed: string, opts: GameOptions = {}): GameState {
  return {
    seed,
    rollIndex: 0,
    rerollNo: 0,
    draft: createDraftState(opts),
    current: null,
    recent: [],
  };
}

function emptySlotCounts(draft: DraftState): Partial<Record<string, number>> {
  const counts: Partial<Record<string, number>> = {};
  draft.slots.forEach((slot) => {
    counts[slot.pos] = (counts[slot.pos] ?? 0);
  });
  draft.slots.forEach((slot, i) => {
    if (draft.filled[i] === null) {
      counts[slot.pos] = (counts[slot.pos] ?? 0) + 1;
    }
  });
  return counts;
}

export function compatiblePositions(
  draft: DraftState,
  positions: Player["positions"],
): Player["positions"] {
  const counts = emptySlotCounts(draft);
  return positions.filter((pos) => (counts[pos] ?? 0) > 0);
}

export function isPlayerSelectable(draft: DraftState, player: Player): boolean {
  if (draft.usedIds.includes(player.id)) return false;
  return compatiblePositions(draft, player.positions).length > 0;
}

export function hasSelectablePlayer(
  draft: DraftState,
  squad: Player[],
): boolean {
  return squad.some((p) => isPlayerSelectable(draft, p));
}

export function getMoveTargets(draft: DraftState, from: number): number[] {
  const player = draft.filled[from];
  const fromSlot = draft.slots[from];
  if (!player || !fromSlot) return [];

  const targets: number[] = [];
  draft.slots.forEach((slot, i) => {
    if (i === from) return;
    const other = draft.filled[i];
    if (other) {
      if (
        player.positions.includes(slot.pos) &&
        other.positions.includes(fromSlot.pos)
      ) {
        targets.push(i);
      }
    } else if (player.positions.includes(slot.pos)) {
      targets.push(i);
    }
  });
  return targets;
}

function appendRecent(recent: SquadRef[], item: SquadRef): SquadRef[] {
  return [...recent, item].slice(-6);
}

function pickSquad(
  rngSeed: string,
  catalog: SquadRef[],
  avoid: Set<string>,
): SquadRef {
  const pool = catalog.filter((s) => !avoid.has(squadKey(s)));
  return pick(createRng(rngSeed), pool.length ? pool : catalog);
}

function squadsByYear(year: number): string[] {
  return SQUAD_CATALOG.filter((s) => s.year === year).map((s) => s.team);
}

function squadsByCountry(
  team: string,
  aliases: Record<string, string[]> = COUNTRY_ALIASES,
): SquadRef[] {
  const codes = aliases[team] ?? [team];
  return SQUAD_CATALOG.filter((s) => codes.includes(s.team)).map(({ team, year }) => ({
    team,
    year,
  }));
}

function rerollSquad(
  rngSeed: string,
  current: SquadRef,
  axis: RerollAxis,
  avoid: Set<string>,
): SquadRef {
  if (axis === "year") {
    const candidates = squadsByCountry(current.team).filter(
      (s) => !(s.team === current.team && s.year === current.year),
    );
    if (candidates.length === 0) return current;
    const pool = candidates.filter((s) => !avoid.has(squadKey(s)));
    return pick(createRng(rngSeed), pool.length ? pool : candidates);
  }

  const teams = squadsByYear(current.year).filter((t) => t !== current.team);
  if (teams.length === 0) return current;
  const pool = teams.filter(
    (t) => !avoid.has(`${t}:${current.year}`),
  );
  const team = pick(createRng(rngSeed), pool.length ? pool : teams);
  return { team, year: current.year };
}

function rerollSeed(
  seed: string,
  rollIndex: number,
  rerollNo: number,
  axis: RerollAxis,
): string {
  return `${seed}:roll:${rollIndex}:rr:${rerollNo}:${axis}`;
}

export function rollSquad(state: GameState): GameState {
  const avoid = new Set(state.recent.map(squadKey));
  const rngSeed = `${state.seed}:roll:${state.rollIndex}`;
  const picked = pickSquad(rngSeed, allSquadRefs(), avoid);
  return {
    ...state,
    current: picked,
    rollIndex: state.rollIndex + 1,
    rerollNo: 0,
    recent: appendRecent(state.recent, picked),
  };
}

export function rerollSquadAction(
  state: GameState,
  axis: RerollAxis,
  consumeBudget = true,
): GameState {
  if (!state.current) {
    throw new Error("Nothing to reroll: roll first");
  }
  if (consumeBudget && state.draft.rerollsLeft <= 0) {
    throw new Error("No rerolls remaining");
  }

  const avoid = new Set(state.recent.map(squadKey));
  const rngSeed = rerollSeed(state.seed, state.rollIndex, state.rerollNo, axis);
  const picked = rerollSquad(rngSeed, state.current, axis, avoid);

  return {
    ...state,
    current: picked,
    rerollNo: state.rerollNo + 1,
    draft: consumeBudget
      ? { ...state.draft, rerollsLeft: state.draft.rerollsLeft - 1 }
      : state.draft,
    recent: appendRecent(state.recent, picked),
  };
}

export function choosePlayer(
  state: GameState,
  player: Player,
  slotIndex: number,
): GameState {
  const draft = state.draft;
  if (draft.usedIds.includes(player.id)) {
    throw new Error(`Player already used: ${player.name}`);
  }
  const slot = draft.slots[slotIndex];
  if (!slot || draft.filled[slotIndex] !== null) {
    throw new Error(`Invalid or occupied slot (${slotIndex})`);
  }
  if (!player.positions.includes(slot.pos)) {
    throw new Error(`${player.name} cannot play ${slot.pos}`);
  }

  const filled = draft.filled.slice();
  filled[slotIndex] = player;

  return {
    ...state,
    current: null,
    draft: {
      ...draft,
      filled,
      usedIds: [...draft.usedIds, player.id],
    },
  };
}

export function movePlayer(
  state: GameState,
  from: number,
  to: number,
): GameState {
  const draft = state.draft;
  const player = draft.filled[from];
  if (!player) {
    throw new Error(`No player in slot ${from}`);
  }
  if (!getMoveTargets(draft, from).includes(to)) {
    throw new Error(`Invalid move (${from}→${to})`);
  }

  const filled = draft.filled.slice();
  const displaced = filled[to];
  filled[to] = player;
  filled[from] = displaced ?? null;

  return {
    ...state,
    draft: { ...draft, filled },
  };
}

export function lineupComplete(draft: DraftState): boolean {
  return draft.filled.every((p) => p !== null);
}

export function filledCount(draft: DraftState): number {
  return draft.filled.filter((p) => p !== null).length;
}

export function updateDraftOptions(
  state: GameState,
  opts: GameOptions,
): GameState {
  if (state.current || filledCount(state.draft) > 0) {
    return state;
  }
  return {
    ...state,
    draft: createDraftState({
      formation: opts.formation ?? state.draft.formation,
      style: opts.style ?? state.draft.style,
      mode: opts.mode ?? state.draft.mode,
    }),
  };
}

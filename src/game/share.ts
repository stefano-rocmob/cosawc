import type { DraftState, GameState } from "./types";

/** Encode a minimal replay payload for sharing (simplified v2 format). */
export function encodeSharePayload(state: GameState): string {
  const payload = {
    seed: state.seed,
    formation: state.draft.formation,
    style: state.draft.style,
    mode: state.draft.mode,
    players: state.draft.filled
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map((p) => p.id),
    rerollsLeft: state.draft.rerollsLeft,
    rollIndex: state.rollIndex,
  };
  return btoa(JSON.stringify(payload));
}

export function decodeSharePayload(code: string): Partial<GameState> | null {
  try {
    return JSON.parse(atob(code)) as Partial<GameState>;
  } catch {
    return null;
  }
}

export function buildShareUrl(state: GameState, baseUrl = ""): string {
  const code = encodeSharePayload(state);
  return `${baseUrl}/play?share=${encodeURIComponent(code)}`;
}

export function isLineupShareable(draft: DraftState): boolean {
  return draft.filled.every((p) => p !== null);
}

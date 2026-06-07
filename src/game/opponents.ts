import { squadKey } from "./constants";
import { createRng, pick } from "./rng";
import { SQUAD_INDEX } from "./squadCatalog";
import type { GameState, SquadRef } from "./types";

const INDEX_LEN = SQUAD_INDEX.length;
const BAND_WIDTH = INDEX_LEN / 7;
const BAND_PADDING = 0.6 * BAND_WIDTH;

export function generateOpponents(state: GameState): SquadRef[] {
  const used = new Set(
    state.draft.filled
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .map((p) => squadKey({ team: p.team, year: p.year })),
  );

  const rng = createRng(`${state.seed.toUpperCase()}:opp`);
  const chosen = new Set<string>();
  const result: SquadRef[] = [];

  for (let i = 0; i < 7; i++) {
    const center = (i + 0.5) * BAND_WIDTH;
    const start = Math.max(0, Math.floor(center - BAND_WIDTH / 2 - BAND_PADDING));
    const end = Math.min(INDEX_LEN, Math.ceil(center + BAND_WIDTH / 2 + BAND_PADDING));
    const band = SQUAD_INDEX.slice(start, end);

    let pool = band.filter(
      (s) => !chosen.has(squadKey(s)) && !used.has(squadKey(s)),
    );
    if (pool.length === 0) {
      pool = band.filter((s) => !chosen.has(squadKey(s)));
    }
    if (pool.length === 0) {
      pool = band;
    }

    const picked = pick(rng, pool);
    chosen.add(squadKey(picked));
    result.push({ team: picked.team, year: picked.year });
  }

  return result;
}

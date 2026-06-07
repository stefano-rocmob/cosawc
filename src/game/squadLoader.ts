import type { Player, SquadFile } from "./types";
import { catalogKey, slugForSquad } from "./squadCatalog";

export type SquadLoader = {
  ensure: (team: string, year: number) => Promise<Player[]>;
  ensureMany: (refs: { team: string; year: number }[]) => Promise<void>;
  get: (team: string, year: number) => Player[];
  has: (team: string, year: number) => boolean;
};

export function createSquadLoader(
  basePath = "/squads",
  fetchFn: typeof fetch = fetch,
): SquadLoader {
  const cache = new Map<string, Player[]>();
  const inflight = new Map<string, Promise<Player[]>>();

  async function loadSlug(slug: string): Promise<Player[]> {
    const cached = cache.get(slug);
    if (cached) return cached;

    const pending = inflight.get(slug);
    if (pending) return pending;

    const promise = fetchFn(`${basePath}/${slug}.json`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load squad ${slug}: HTTP ${res.status}`);
        }
        const data = (await res.json()) as SquadFile;
        cache.set(slug, data.squad);
        inflight.delete(slug);
        return data.squad;
      })
      .catch((err) => {
        inflight.delete(slug);
        throw err;
      });

    inflight.set(slug, promise);
    return promise;
  }

  function resolveSlug(team: string, year: number): string {
    const slug = slugForSquad(team, year);
    if (!slug) {
      throw new Error(`Squad ${catalogKey(team, year)} not in catalog`);
    }
    return slug;
  }

  return {
    async ensure(team, year) {
      return loadSlug(resolveSlug(team, year));
    },
    async ensureMany(refs) {
      const seen = new Set<string>();
      const tasks: Promise<Player[]>[] = [];
      for (const { team, year } of refs) {
        const key = catalogKey(team, year);
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(loadSlug(resolveSlug(team, year)));
      }
      await Promise.all(tasks);
    },
    get(team, year) {
      const squad = cache.get(resolveSlug(team, year));
      if (!squad) {
        throw new Error(`Squad ${catalogKey(team, year)} not loaded`);
      }
      return squad;
    },
    has(team, year) {
      const slug = slugForSquad(team, year);
      return slug !== undefined && cache.has(slug);
    },
  };
}

import type { Player, SquadFile } from "./types";
import { catalogKey, slugForSquad } from "./squadCatalog";

export type SquadLoader = {
  ensure: (sel: string, copa: number) => Promise<Player[]>;
  ensureMany: (refs: { sel: string; copa: number }[]) => Promise<void>;
  get: (sel: string, copa: number) => Player[];
  has: (sel: string, copa: number) => boolean;
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

  function resolveSlug(sel: string, copa: number): string {
    const slug = slugForSquad(sel, copa);
    if (!slug) {
      throw new Error(`Squad ${catalogKey(sel, copa)} not in catalog`);
    }
    return slug;
  }

  return {
    async ensure(sel, copa) {
      return loadSlug(resolveSlug(sel, copa));
    },
    async ensureMany(refs) {
      const seen = new Set<string>();
      const tasks: Promise<Player[]>[] = [];
      for (const { sel, copa } of refs) {
        const key = catalogKey(sel, copa);
        if (seen.has(key)) continue;
        seen.add(key);
        tasks.push(loadSlug(resolveSlug(sel, copa)));
      }
      await Promise.all(tasks);
    },
    get(sel, copa) {
      const squad = cache.get(resolveSlug(sel, copa));
      if (!squad) {
        throw new Error(`Squad ${catalogKey(sel, copa)} not loaded`);
      }
      return squad;
    },
    has(sel, copa) {
      const slug = slugForSquad(sel, copa);
      return slug !== undefined && cache.has(slug);
    },
  };
}

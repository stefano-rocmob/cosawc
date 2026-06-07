import catalogData from "@/data/squad_catalog.json";
import indexData from "@/data/squad_index.json";
import type { SquadCatalogItem, SquadIndexItem, SquadRef } from "./types";

export const SQUAD_CATALOG: SquadCatalogItem[] = catalogData as SquadCatalogItem[];
export const SQUAD_INDEX: SquadIndexItem[] = (
  indexData as SquadIndexItem[]
).slice().sort((a, b) => a.band - b.band);

export function catalogKey(team: string, year: number): string {
  return `${team}:${year}`;
}

export function slugForSquad(team: string, year: number): string | undefined {
  return SQUAD_CATALOG.find((s) => s.team === team && s.year === year)?.slug;
}

export function allSquadRefs(): SquadRef[] {
  return SQUAD_CATALOG.map(({ team, year }) => ({ team, year }));
}

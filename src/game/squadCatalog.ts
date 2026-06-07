import catalogData from "@/data/squad_catalog.json";
import indexData from "@/data/squad_index.json";
import type { SquadCatalogItem, SquadIndexItem, SquadRef } from "./types";

export const SQUAD_CATALOG: SquadCatalogItem[] = catalogData as SquadCatalogItem[];
export const SQUAD_INDEX: SquadIndexItem[] = (
  indexData as SquadIndexItem[]
).slice().sort((a, b) => a.band - b.band);

export function catalogKey(sel: string, copa: number): string {
  return `${sel}:${copa}`;
}

export function slugForSquad(sel: string, copa: number): string | undefined {
  return SQUAD_CATALOG.find((s) => s.sel === sel && s.copa === copa)?.slug;
}

export function allSquadRefs(): SquadRef[] {
  return SQUAD_CATALOG.map(({ sel, copa }) => ({ sel, copa }));
}

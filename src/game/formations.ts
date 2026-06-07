import formationsData from "@/data/formations.json";
import type { FormationKey, FormationSlot, StyleKey } from "./types";

type FormationsData = Record<
  FormationKey,
  Record<StyleKey, FormationSlot[]>
>;

const FORMATIONS = formationsData as FormationsData;

export function getFormationSlots(
  formation: FormationKey,
  style: StyleKey = "equilibrado",
): FormationSlot[] {
  return FORMATIONS[formation][style].map((slot) => ({ ...slot }));
}

export { FORMATIONS };

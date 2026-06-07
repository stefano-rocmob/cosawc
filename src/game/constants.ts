import type { ModeKey, PositionCode } from "./types";

export const DEFAULT_FORMATION = "4-3-3" as const;
export const DEFAULT_STYLE = "equilibrado" as const;
export const DEFAULT_MODE = "classico" as const;

export const MODES: Record<
  ModeKey,
  { rerolls: number; statsVisible: boolean }
> = {
  classico: { rerolls: 3, statsVisible: true },
  almanaque: { rerolls: 1, statsVisible: false },
};

export const FORMATION_KEYS = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "4-2-4",
  "3-5-2",
  "5-3-2",
  "4-5-1",
  "3-4-3",
] as const;

export const STYLE_KEYS = ["defensivo", "equilibrado", "ofensivo"] as const;

export const COUNTRY_ALIASES: Record<string, string[]> = {
  URS: ["URS", "RUS"],
  RUS: ["URS", "RUS"],
  YUG: ["YUG", "SRB"],
  SRB: ["YUG", "SRB"],
  TCH: ["TCH", "CZE"],
  CZE: ["TCH", "CZE"],
};

export const ATTACK_WEIGHTS: Record<PositionCode, number> = {
  GOL: 0,
  LD: 0,
  ZAG: 0,
  LE: 0,
  MD: 0.5,
  ME: 0.5,
  VOL: 0.2,
  MC: 0.5,
  MEI: 0.8,
  PD: 1,
  CA: 1,
  PE: 1,
};

export const DEFENSE_WEIGHTS: Record<PositionCode, number> = {
  GOL: 1,
  LD: 1,
  ZAG: 1,
  LE: 1,
  MD: 0.5,
  ME: 0.5,
  VOL: 0.8,
  MC: 0.5,
  MEI: 0.2,
  PD: 0,
  CA: 0,
  PE: 0,
};

export const SCORER_CATEGORY_WEIGHTS = {
  GK: 0.01,
  DEF: 0.12,
  VOL: 0.22,
  MID: 0.45,
  MEI: 0.7,
  ATT: 1,
} as const;

export const POSITION_TO_CATEGORY: Record<PositionCode, keyof typeof SCORER_CATEGORY_WEIGHTS> = {
  GOL: "GK",
  LD: "DEF",
  ZAG: "DEF",
  LE: "DEF",
  MD: "MID",
  ME: "MID",
  VOL: "VOL",
  MC: "MID",
  MEI: "MEI",
  PD: "ATT",
  CA: "ATT",
  PE: "ATT",
};

export const LEGENDARY_GK_IDS = new Set([
  "rogerio-ceni",
  "jose-luis-chilavert",
  "rene-higuita",
]);

export const TOURNAMENT_PHASES = [
  {
    key: "GRUPOS",
    type: "group" as const,
    opponents: [
      { label: "Grupo · 1º jogo", overall: 68 },
      { label: "Grupo · 2º jogo", overall: 72 },
      { label: "Grupo · 3º jogo", overall: 76 },
    ],
  },
  { key: "OITAVAS", type: "knockout" as const, opponent: { label: "Oitavas", overall: 79 } },
  { key: "QUARTAS", type: "knockout" as const, opponent: { label: "Quartas", overall: 83 } },
  { key: "SEMI", type: "knockout" as const, opponent: { label: "Semifinal", overall: 87 } },
  { key: "FINAL", type: "knockout" as const, opponent: { label: "Final", overall: 91 } },
];

export const MATCH_MODEL = {
  baseLambda: 1.4,
  slope: 0.08,
  minLambda: 0.15,
  maxLambda: 5,
};

export const PENALTY_MODEL = {
  base: 0.5,
  slope: 0.012,
  min: 0.1,
  max: 0.9,
};

export const BADGE_THRESHOLDS = { esmagadorGD: 18 };

export function squadKey(ref: { sel: string; copa: number }): string {
  return `${ref.sel}:${ref.copa}`;
}

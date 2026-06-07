import type { ModeKey, PositionCode } from "./types";

export const DEFAULT_FORMATION = "4-3-3" as const;
export const DEFAULT_STYLE = "balanced" as const;
export const DEFAULT_MODE = "classic" as const;

export const MODES: Record<
  ModeKey,
  { rerolls: number; statsVisible: boolean }
> = {
  classic: { rerolls: 3, statsVisible: true },
  memory: { rerolls: 1, statsVisible: false },
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

export const STYLE_KEYS = ["defensive", "balanced", "offensive"] as const;

export const COUNTRY_ALIASES: Record<string, string[]> = {
  URS: ["URS", "RUS"],
  RUS: ["URS", "RUS"],
  YUG: ["YUG", "SRB"],
  SRB: ["YUG", "SRB"],
  TCH: ["TCH", "CZE"],
  CZE: ["TCH", "CZE"],
};

export const ATTACK_WEIGHTS: Record<PositionCode, number> = {
  GK: 0,
  RB: 0,
  CB: 0,
  LB: 0,
  RM: 0.5,
  LM: 0.5,
  DM: 0.2,
  CM: 0.5,
  AM: 0.8,
  RW: 1,
  ST: 1,
  LW: 1,
};

export const DEFENSE_WEIGHTS: Record<PositionCode, number> = {
  GK: 1,
  RB: 1,
  CB: 1,
  LB: 1,
  RM: 0.5,
  LM: 0.5,
  DM: 0.8,
  CM: 0.5,
  AM: 0.2,
  RW: 0,
  ST: 0,
  LW: 0,
};

export const SCORER_CATEGORY_WEIGHTS = {
  GK: 0.01,
  DEF: 0.12,
  DM: 0.22,
  MID: 0.45,
  AM: 0.7,
  ATT: 1,
} as const;

export const POSITION_TO_CATEGORY: Record<PositionCode, keyof typeof SCORER_CATEGORY_WEIGHTS> = {
  GK: "GK",
  RB: "DEF",
  CB: "DEF",
  LB: "DEF",
  RM: "MID",
  LM: "MID",
  DM: "DM",
  CM: "MID",
  AM: "AM",
  RW: "ATT",
  ST: "ATT",
  LW: "ATT",
};

export const LEGENDARY_GK_IDS = new Set([
  "rogerio-ceni",
  "jose-luis-chilavert",
  "rene-higuita",
]);

export const TOURNAMENT_PHASES = [
  {
    key: "GROUP",
    type: "group" as const,
    opponents: [
      { label: "Group · Match 1", overall: 68 },
      { label: "Group · Match 2", overall: 72 },
      { label: "Group · Match 3", overall: 76 },
    ],
  },
  { key: "R16", type: "knockout" as const, opponent: { label: "Round of 16", overall: 79 } },
  { key: "QF", type: "knockout" as const, opponent: { label: "Quarter-finals", overall: 83 } },
  { key: "SF", type: "knockout" as const, opponent: { label: "Semi-final", overall: 87 } },
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

export const BADGE_THRESHOLDS = { recordBreakerGD: 18 };

export function squadKey(ref: { team: string; year: number }): string {
  return `${ref.team}:${ref.year}`;
}

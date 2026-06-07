export type PositionCode =
  | "GOL"
  | "LD"
  | "ZAG"
  | "LE"
  | "MD"
  | "ME"
  | "VOL"
  | "MC"
  | "MEI"
  | "PD"
  | "CA"
  | "PE";

export type Player = {
  playerId: string;
  name: string;
  sel: string;
  copa: number;
  positions: PositionCode[];
  number: number;
  force: number;
  legend: boolean;
};

export type SquadFile = {
  sel: string;
  copa: number;
  squad: Player[];
};

export type SquadIndexItem = {
  sel: string;
  copa: number;
  overall: number;
  band: number;
};

export type SquadCatalogItem = {
  sel: string;
  copa: number;
  slug: string;
};

export type FormationKey =
  | "4-3-3"
  | "4-4-2"
  | "4-2-3-1"
  | "4-2-4"
  | "3-5-2"
  | "5-3-2"
  | "4-5-1"
  | "3-4-3";

export type StyleKey = "defensivo" | "equilibrado" | "ofensivo";
export type ModeKey = "classico" | "almanaque";
export type RerollAxis = "copa" | "sel";

export type FormationSlot = {
  pos: PositionCode;
  x: number;
  y: number;
};

export type DraftState = {
  formation: FormationKey;
  style: StyleKey;
  mode: ModeKey;
  slots: FormationSlot[];
  filled: (Player | null)[];
  usedPlayerIds: string[];
  rerollsLeft: number;
};

export type SquadRef = { sel: string; copa: number };

export type GameState = {
  seed: string;
  rollIndex: number;
  rerollNo: number;
  draft: DraftState;
  current: SquadRef | null;
  recent: SquadRef[];
};

export type MatchOutcome = "V" | "E" | "D";

export type GoalEvent = {
  min: number;
  scorer: string;
  opp: boolean;
};

export type GroupStandingRow = {
  me?: boolean;
  pts: number;
  gd: number;
  gf: number;
  sel?: string;
  copa?: number;
};

export type PenaltyDisplay = {
  me: number[];
  them: number[];
  sd?: { me: number[]; them: number[] };
  score: string;
};

export type MatchResult = {
  phase: string;
  opp: string;
  oppOverall: number;
  gf: number;
  ga: number;
  outcome: MatchOutcome;
  advanced: boolean;
  penalties?: boolean;
  oppSel: string;
  oppCopa: number;
  scorers: string[];
  conceded: string[];
  goals: GoalEvent[];
  pens?: PenaltyDisplay;
  groupTable?: GroupStandingRow[];
};

export type TournamentResult = {
  record: string;
  champion: boolean;
  perfect: boolean;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  campaign: MatchResult[];
  badge: string | null;
};

export type TeamScores = {
  attack: number;
  defense: number;
  overall: number;
};

export type Rng = () => number;

export type PositionCode =
  | "GK"
  | "RB"
  | "LB"
  | "CB"
  | "RM"
  | "LM"
  | "DM"
  | "CM"
  | "AM"
  | "RW"
  | "ST"
  | "LW";

export type Player = {
  id: string;
  name: string;
  team: string;
  year: number;
  positions: PositionCode[];
  number: number;
  rating: number;
  legend: boolean;
};

export type SquadFile = {
  team: string;
  year: number;
  squad: Player[];
};

export type SquadIndexItem = {
  team: string;
  year: number;
  overall: number;
  band: number;
};

export type SquadCatalogItem = {
  team: string;
  year: number;
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

export type StyleKey = "defensive" | "balanced" | "offensive";
export type ModeKey = "classic" | "memory";
export type RerollAxis = "year" | "team";

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
  usedIds: string[];
  rerollsLeft: number;
};

export type SquadRef = { team: string; year: number };

export type GameState = {
  seed: string;
  rollIndex: number;
  rerollNo: number;
  draft: DraftState;
  current: SquadRef | null;
  recent: SquadRef[];
};

export type MatchOutcome = "W" | "D" | "L";

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
  team?: string;
  year?: number;
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
  oppTeam: string;
  oppYear: number;
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

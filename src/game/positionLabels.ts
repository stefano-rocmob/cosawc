import type { PositionCode, StyleKey } from "./types";

export const POSITION_LABELS: Record<PositionCode, string> = {
  GK: "GK",
  RB: "RB",
  LB: "LB",
  CB: "CB",
  RM: "RM",
  LM: "LM",
  DM: "DM",
  CM: "CM",
  AM: "AM",
  RW: "RW",
  LW: "LW",
  ST: "ST",
};

const POSITION_SORT_ORDER: Record<PositionCode, number> = {
  GK: 0,
  RB: 1,
  LB: 2,
  CB: 3,
  RM: 4,
  LM: 5,
  DM: 6,
  CM: 7,
  AM: 8,
  RW: 9,
  LW: 10,
  ST: 11,
};

export function positionLabel(pos: PositionCode): string {
  return POSITION_LABELS[pos];
}

export function formatJerseyNumber(number: number, statsVisible: boolean): string {
  if (!statsVisible) return "?";
  return `#${number}`;
}

export function formatPlayerPositions(positions: PositionCode[]): string {
  const labels = positions.slice(0, 2).map((p) => POSITION_LABELS[p]);
  const base = labels.join("/");
  if (positions.length <= 2) return base;
  return `${base}+${positions.length - 2}`;
}

export function formatAllPlayerPositions(positions: PositionCode[]): string {
  return positions.map((p) => POSITION_LABELS[p]).join(", ");
}

export function formatBoxScorePlayer(player: {
  name: string;
  positions: PositionCode[];
}): string {
  const pos = formatAllPlayerPositions(player.positions);
  return `${player.name} (${pos})`;
}

export function formatPlayerTooltip(
  player: { name: string; positions: PositionCode[]; rating: number; number: number },
  statsVisible: boolean,
): string {
  const jersey = formatJerseyNumber(player.number, statsVisible);
  const pos = statsVisible ? formatAllPlayerPositions(player.positions) : "?";
  const rating = statsVisible ? String(player.rating) : "?";
  return `${jersey} ${player.name} · ${pos} · ${rating}`;
}

export function primaryPositionOrder(positions: PositionCode[]): number {
  const first = positions[0];
  return first !== undefined ? (POSITION_SORT_ORDER[first] ?? 99) : 99;
}

export const STYLE_DISPLAY: Record<StyleKey, string> = {
  defensive: "DEFENSIVE",
  balanced: "BALANCED",
  offensive: "OFFENSIVE",
};

export const STYLE_BUTTON_LABELS: Record<StyleKey, string> = {
  defensive: "Defensive",
  balanced: "Balanced",
  offensive: "Attacking",
};

export const MODE_DISPLAY: Record<string, string> = {
  classic: "CLASSIC",
  memory: "FROM MEMORY",
};

export const MODE_BUTTON_LABELS: Record<string, string> = {
  classic: "Classic",
  memory: "From memory",
};

export const COUNTRY_NAMES: Record<string, { en: string; flag: string }> = {
  ALG: { en: "Algeria", flag: "🇩🇿" },
  ARG: { en: "Argentina", flag: "🇦🇷" },
  AUS: { en: "Australia", flag: "🇦🇺" },
  AUT: { en: "Austria", flag: "🇦🇹" },
  BEL: { en: "Belgium", flag: "🇧🇪" },
  BRA: { en: "Brazil", flag: "🇧🇷" },
  BUL: { en: "Bulgaria", flag: "🇧🇬" },
  CHI: { en: "Chile", flag: "🇨🇱" },
  CIV: { en: "Ivory Coast", flag: "🇨🇮" },
  CMR: { en: "Cameroon", flag: "🇨🇲" },
  COL: { en: "Colombia", flag: "🇨🇴" },
  CRC: { en: "Costa Rica", flag: "🇨🇷" },
  CRO: { en: "Croatia", flag: "🇭🇷" },
  CZE: { en: "Czech Republic", flag: "🇨🇿" },
  DEN: { en: "Denmark", flag: "🇩🇰" },
  ECU: { en: "Ecuador", flag: "🇪🇨" },
  EGY: { en: "Egypt", flag: "🇪🇬" },
  ENG: { en: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  ESP: { en: "Spain", flag: "🇪🇸" },
  FRA: { en: "France", flag: "🇫🇷" },
  GER: { en: "Germany", flag: "🇩🇪" },
  GHA: { en: "Ghana", flag: "🇬🇭" },
  GRE: { en: "Greece", flag: "🇬🇷" },
  HUN: { en: "Hungary", flag: "🇭🇺" },
  IRL: { en: "Ireland", flag: "🇮🇪" },
  ITA: { en: "Italy", flag: "🇮🇹" },
  JPN: { en: "Japan", flag: "🇯🇵" },
  KOR: { en: "South Korea", flag: "🇰🇷" },
  MAR: { en: "Morocco", flag: "🇲🇦" },
  MEX: { en: "Mexico", flag: "🇲🇽" },
  NED: { en: "Netherlands", flag: "🇳🇱" },
  NGA: { en: "Nigeria", flag: "🇳🇬" },
  NIR: { en: "Northern Ireland", flag: "🇬🇧" },
  PAR: { en: "Paraguay", flag: "🇵🇾" },
  PER: { en: "Peru", flag: "🇵🇪" },
  POL: { en: "Poland", flag: "🇵🇱" },
  POR: { en: "Portugal", flag: "🇵🇹" },
  ROU: { en: "Romania", flag: "🇷🇴" },
  RUS: { en: "Russia", flag: "🇷🇺" },
  SCO: { en: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  SEN: { en: "Senegal", flag: "🇸🇳" },
  SRB: { en: "Serbia", flag: "🇷🇸" },
  SUI: { en: "Switzerland", flag: "🇨🇭" },
  SWE: { en: "Sweden", flag: "🇸🇪" },
  TCH: { en: "Czechoslovakia", flag: "🇨🇿" },
  TUR: { en: "Turkey", flag: "🇹🇷" },
  UKR: { en: "Ukraine", flag: "🇺🇦" },
  URS: { en: "Soviet Union", flag: "🇷🇺" },
  URU: { en: "Uruguay", flag: "🇺🇾" },
  USA: { en: "United States", flag: "🇺🇸" },
  WAL: { en: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  YUG: { en: "Yugoslavia", flag: "🇷🇸" },
};

export function countryDisplay(team: string): { name: string; flag: string } {
  const entry = COUNTRY_NAMES[team];
  if (entry) return { name: entry.en, flag: entry.flag };
  return { name: team, flag: "🏳️" };
}

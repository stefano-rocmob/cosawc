import type { PositionCode, StyleKey } from "./types";

export const POSITION_LABELS: Record<PositionCode, string> = {
  GOL: "GK",
  LD: "RB",
  LE: "LB",
  ZAG: "CB",
  MD: "RM",
  ME: "LM",
  VOL: "DM",
  MC: "CM",
  MEI: "AM",
  PD: "RW",
  PE: "LW",
  CA: "ST",
};

const POSITION_SORT_ORDER: Record<PositionCode, number> = {
  GOL: 0,
  LD: 1,
  LE: 2,
  ZAG: 3,
  MD: 4,
  ME: 5,
  VOL: 6,
  MC: 7,
  MEI: 8,
  PD: 9,
  PE: 10,
  CA: 11,
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
  player: { name: string; positions: PositionCode[]; force: number; number: number },
  statsVisible: boolean,
): string {
  const jersey = formatJerseyNumber(player.number, statsVisible);
  const pos = statsVisible ? formatAllPlayerPositions(player.positions) : "?";
  const force = statsVisible ? String(player.force) : "?";
  return `${jersey} ${player.name} · ${pos} · ${force}`;
}

export function primaryPositionOrder(positions: PositionCode[]): number {
  const first = positions[0];
  return first !== undefined ? (POSITION_SORT_ORDER[first] ?? 99) : 99;
}

export const STYLE_DISPLAY: Record<StyleKey, string> = {
  defensivo: "DEFENSIVE",
  equilibrado: "BALANCED",
  ofensivo: "OFFENSIVE",
};

export const STYLE_BUTTON_LABELS: Record<StyleKey, string> = {
  defensivo: "Defensive",
  equilibrado: "Balanced",
  ofensivo: "Attacking",
};

export const MODE_DISPLAY: Record<string, string> = {
  classico: "CLASSIC",
  almanaque: "FROM MEMORY",
};

export const MODE_BUTTON_LABELS: Record<string, string> = {
  classico: "Classic",
  almanaque: "From memory",
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

export function countryDisplay(sel: string): { name: string; flag: string } {
  const entry = COUNTRY_NAMES[sel];
  if (entry) return { name: entry.en, flag: entry.flag };
  return { name: sel, flag: "🏳️" };
}

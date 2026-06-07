import {
  BADGE_THRESHOLDS,
  LEGENDARY_GK_IDS,
  MATCH_MODEL,
  PENALTY_MODEL,
  POSITION_TO_CATEGORY,
  SCORER_CATEGORY_WEIGHTS,
  TOURNAMENT_PHASES,
} from "./constants";
import { generatePenaltyDisplay } from "./penalties";
import { createRng } from "./rng";
import type {
  GoalEvent,
  MatchOutcome,
  MatchResult,
  Player,
  Rng,
  SquadRef,
  TournamentResult,
} from "./types";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function poisson(rng: Rng, lambda: number): number {
  if (lambda <= 0) return 0;
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

function goalLambda(attackOrDefense: number, opponentOverall: number): number {
  const { baseLambda, slope, minLambda, maxLambda } = MATCH_MODEL;
  return clamp(
    baseLambda + (attackOrDefense - opponentOverall) * slope,
    minLambda,
    maxLambda,
  );
}

export function simulateMatch(
  rng: Rng,
  userAttack: number,
  userDefense: number,
  opponentOverall: number,
): { gf: number; ga: number; outcome: MatchOutcome } {
  const gf = poisson(rng, goalLambda(userAttack, opponentOverall));
  const ga = poisson(rng, goalLambda(opponentOverall, userDefense));
  const outcome: MatchOutcome = gf > ga ? "W" : gf < ga ? "L" : "D";
  return { gf, ga, outcome };
}

function isGoalkeeper(player: Player): boolean {
  return player.positions.includes("GK");
}

function isLegendaryGk(player: Player): boolean {
  return !!player.id && LEGENDARY_GK_IDS.has(player.id);
}

function scorerWeight(player: Player): number {
  const weights = player.positions.map(
    (pos) => SCORER_CATEGORY_WEIGHTS[POSITION_TO_CATEGORY[pos]] ?? 0.1,
  );
  return Math.max(...weights) * player.rating;
}

function pickScorers(
  rng: Rng,
  lineup: Player[],
  goalCount: number,
  opts?: { isKnockout?: boolean },
): string[] {
  if (goalCount <= 0 || lineup.length === 0) return [];

  const weights = lineup.map((p) => {
    if (isGoalkeeper(p) && !isLegendaryGk(p)) return 0;
    if (isGoalkeeper(p) && isLegendaryGk(p)) return 0.25 * p.rating;
    return scorerWeight(p);
  });

  const names: string[] = [];
  const mutable = [...weights];

  for (let i = 0; i < goalCount; i++) {
    const isLast = i === goalCount - 1;
    const isKnockoutLast = opts?.isKnockout === true && isLast;
    const roundWeights = mutable.map((w, idx) => {
      const player = lineup[idx];
      if (isGoalkeeper(player) && !isLegendaryGk(player)) {
        return isKnockoutLast ? 0.15 * scorerWeight(player) : 0;
      }
      return w;
    });
    const total = roundWeights.reduce((a, b) => a + b, 0);
    if (total <= 0) {
      names.push(lineup[0].name);
      continue;
    }
    let roll = rng() * total;
    let chosen = 0;
    for (; chosen < roundWeights.length - 1 && (roll -= roundWeights[chosen]) > 0; chosen++);
    names.push(lineup[chosen].name);
    mutable[chosen] *= 0.45;
  }

  return names;
}

function uniqueMinutes(rng: Rng, count: number): number[] {
  if (count <= 0) return [];
  const mins = new Set<number>();
  let attempts = 0;
  while (mins.size < count && attempts < 1000) {
    attempts++;
    mins.add(1 + Math.floor(90 * Math.pow(rng(), 0.85)));
  }
  return [...mins].sort((a, b) => a - b);
}

function gkScorerMinutes(rng: Rng, used: Set<number>): number {
  for (let i = 0; i < 50; i++) {
    const min = 87 + Math.floor(7 * rng());
    if (!used.has(min)) return min;
  }
  return 93;
}

function goalkeeperNames(players: Player[]): Set<string> {
  return new Set(
    players.filter((p) => p.positions.includes("GK")).map((p) => p.name),
  );
}

export function buildGoalTimeline(
  rngSeed: string,
  userScorers: string[],
  concededScorers: string[],
  userLineup: Player[],
  oppLineup: Player[],
): GoalEvent[] {
  const rng = createRng(rngSeed);
  const used = new Set<number>();
  const userGk = goalkeeperNames(userLineup);
  const oppGk = goalkeeperNames(oppLineup);
  const regularUser = userScorers.filter((n) => !userGk.has(n));
  const regularOpp = concededScorers.filter((n) => !oppGk.has(n));

  const userMins = uniqueMinutes(rng, regularUser.length);
  userMins.forEach((m) => used.add(m));

  const events: GoalEvent[] = [
    ...userMins.map((min, i) => ({
      min,
      scorer: regularUser[i],
      opp: false,
    })),
    ...userScorers
      .filter((n) => userGk.has(n))
      .map((scorer) => ({
        min: gkScorerMinutes(rng, used),
        scorer,
        opp: false,
      })),
    ...uniqueMinutes(rng, regularOpp.length).map((min, i) => ({
      min,
      scorer: regularOpp[i],
      opp: true,
    })),
  ];

  concededScorers
    .filter((n) => oppGk.has(n))
    .forEach((scorer) => {
      events.push({ min: gkScorerMinutes(rng, used), scorer, opp: true });
    });

  return events.sort((a, b) => a.min - b.min);
}

type GroupSimResult = {
  pts: number;
  gd: number;
  gf: number;
  me?: boolean;
  oppIndex?: number;
};

function simulateGroupStandings(
  rng: Rng,
  userResults: { gf: number; ga: number; outcome: MatchOutcome }[],
  opponentOveralls: number[],
): { standings: GroupSimResult[]; advanced: boolean } {
  const user: GroupSimResult = {
    me: true,
    pts: userResults.reduce(
      (acc, r) => acc + (r.outcome === "W" ? 3 : r.outcome === "D" ? 1 : 0),
      0,
    ),
    gd: userResults.reduce((acc, r) => acc + (r.gf - r.ga), 0),
    gf: userResults.reduce((acc, r) => acc + r.gf, 0),
  };

  const oppRows: GroupSimResult[] = opponentOveralls.map((overall, oppIndex) => {
    if (userResults.length >= 3) {
      const mirror = userResults[oppIndex];
      return {
        pts: mirror.outcome === "L" ? 3 : mirror.outcome === "D" ? 1 : 0,
        gd: mirror.ga - mirror.gf,
        gf: mirror.ga,
        oppIndex,
      };
    }
    return { pts: 0, gd: 0, gf: 0, oppIndex };
  });

  for (let i = 0; i < opponentOveralls.length; i++) {
    for (let j = i + 1; j < opponentOveralls.length; j++) {
      const match = simulateMatch(rng, opponentOveralls[i], opponentOveralls[i], opponentOveralls[j]);
      if (match.outcome === "W") {
        oppRows[i].pts += 3;
      } else if (match.outcome === "D") {
        oppRows[i].pts += 1;
        oppRows[j].pts += 1;
      } else {
        oppRows[j].pts += 3;
      }
      oppRows[i].gd += match.gf - match.ga;
      oppRows[i].gf += match.gf;
      oppRows[j].gd += match.ga - match.gf;
      oppRows[j].gf += match.ga;
    }
  }

  const standings = [user, ...oppRows].sort(
    (a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf,
  );

  return {
    standings,
    advanced: standings.findIndex((s) => s.me) < 2,
  };
}

export function simulateTournament(
  seed: string,
  userAttack: number,
  userDefense: number,
  userLineup: Player[],
  opponents: SquadRef[],
  getOpponentSquad: (team: string, year: number) => Player[],
): TournamentResult {
  const tournamentSeed = `${seed.toUpperCase()}:tournament`;
  const matchRng = createRng(tournamentSeed);
  const scorerRng = createRng(`${tournamentSeed}:goals`);
  const teamAvg = (userAttack + userDefense) / 2;

  const campaign: MatchResult[] = [];
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let gf = 0;
  let ga = 0;
  let eliminated = false;
  let oppIdx = 0;

  for (const phase of TOURNAMENT_PHASES) {
    if (eliminated) break;

    if (phase.type === "group") {
      const groupResults: { gf: number; ga: number; outcome: MatchOutcome }[] = [];
      const groupStart = oppIdx;

      for (const opp of phase.opponents) {
        const oppRef = opponents[oppIdx++] ?? { team: "", year: 0 };
        const result = simulateMatch(matchRng, userAttack, userDefense, opp.overall);
        gf += result.gf;
        ga += result.ga;
        if (result.outcome === "W") wins++;
        else if (result.outcome === "D") draws++;
        else losses++;

        const matchIndex = oppIdx - 1;
        const oppSquad = getOpponentSquad(oppRef.team, oppRef.year);
        const scorers = pickScorers(scorerRng, userLineup, result.gf, {
          isKnockout: false,
        });
        const conceded = pickScorers(scorerRng, oppSquad, result.ga, {
          isKnockout: false,
        });

        campaign.push({
          phase: phase.key,
          opp: opp.label,
          oppOverall: opp.overall,
          gf: result.gf,
          ga: result.ga,
          outcome: result.outcome,
          advanced: true,
          oppTeam: oppRef.team,
          oppYear: oppRef.year,
          scorers,
          conceded,
          goals: buildGoalTimeline(
            `${tournamentSeed}:min:${matchIndex}`,
            scorers,
            conceded,
            userLineup,
            oppSquad,
          ),
        });
        groupResults.push(result);
      }

      const { standings, advanced } = simulateGroupStandings(
        matchRng,
        groupResults,
        phase.opponents.map((o) => o.overall),
      );

      if (!advanced) eliminated = true;

      const last = campaign[campaign.length - 1];
      if (last) {
        last.groupTable = standings.map((row) => {
          if (row.me) {
            return { me: true, pts: row.pts, gd: row.gd, gf: row.gf };
          }
          const ref = opponents[groupStart + (row.oppIndex ?? 0)];
          return {
            me: false,
            pts: row.pts,
            gd: row.gd,
            gf: row.gf,
            team: ref?.team,
            year: ref?.year,
          };
        });
        last.advanced = advanced;
      }
      continue;
    }

    const opp = phase.opponent;
    const oppRef = opponents[oppIdx++] ?? { team: "", year: 0 };
    const result = simulateMatch(matchRng, userAttack, userDefense, opp.overall);
    gf += result.gf;
    ga += result.ga;

    let advanced: boolean;
    if (result.outcome === "W") {
      advanced = true;
      wins++;
    } else if (result.outcome === "L") {
      advanced = false;
      losses++;
    } else {
      const prob = clamp(
        PENALTY_MODEL.base + (teamAvg - opp.overall) * PENALTY_MODEL.slope,
        PENALTY_MODEL.min,
        PENALTY_MODEL.max,
      );
      advanced = matchRng() < prob;
      if (advanced) wins++;
      else losses++;
    }

    const matchIndex = oppIdx - 1;
    const isDraw = result.outcome === "D";
    const oppSquad = getOpponentSquad(oppRef.team, oppRef.year);
    const scorers = pickScorers(scorerRng, userLineup, result.gf, {
      isKnockout: true,
    });
    const conceded = pickScorers(scorerRng, oppSquad, result.ga, {
      isKnockout: true,
    });

    campaign.push({
      phase: phase.key,
      opp: opp.label,
      oppOverall: opp.overall,
      gf: result.gf,
      ga: result.ga,
      outcome: result.outcome,
      advanced,
      penalties: isDraw,
      oppTeam: oppRef.team,
      oppYear: oppRef.year,
      scorers,
      conceded,
      goals: buildGoalTimeline(
        `${tournamentSeed}:min:${matchIndex}`,
        scorers,
        conceded,
        userLineup,
        oppSquad,
      ),
      pens: isDraw
        ? generatePenaltyDisplay(
            createRng(`${tournamentSeed}:pen:${matchIndex}`),
            advanced,
          )
        : undefined,
    });

    if (!advanced) eliminated = true;
  }

  const champion = !eliminated;
  const perfect = champion && wins === 7 && draws === 0 && losses === 0;
  const cleanSheet = champion && ga === 0;
  let badge: string | null = null;
  if (perfect && gf - ga >= BADGE_THRESHOLDS.recordBreakerGD) {
    badge = "RECORD BREAKER";
  } else if (cleanSheet) {
    badge = "THE WALL";
  }

  return {
    record: `${wins}-${losses}`,
    champion,
    perfect,
    wins,
    draws,
    losses,
    gf,
    ga,
    campaign,
    badge,
  };
}

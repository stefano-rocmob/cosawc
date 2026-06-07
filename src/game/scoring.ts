import { ATTACK_WEIGHTS, DEFENSE_WEIGHTS } from "./constants";
import type { DraftState, Player, TeamScores } from "./types";

export function calcOverall(filled: (Player | null)[]): number {
  const players = filled.filter((p): p is Player => p !== null);
  if (players.length === 0) return 0;
  const sum = players.reduce((acc, p) => acc + p.rating, 0);
  return Math.round(sum / players.length);
}

export function calcTeamScores(draft: DraftState): TeamScores {
  let attackNum = 0;
  let attackDen = 0;
  let defenseNum = 0;
  let defenseDen = 0;
  let overallSum = 0;
  let overallCount = 0;

  draft.slots.forEach((slot, i) => {
    const player = draft.filled[i];
    const aw = ATTACK_WEIGHTS[slot.pos];
    const dw = DEFENSE_WEIGHTS[slot.pos];
    attackDen += aw;
    defenseDen += dw;
    if (player) {
      attackNum += player.rating * aw;
      defenseNum += player.rating * dw;
      overallSum += player.rating;
      overallCount++;
    }
  });

  return {
    attack: attackDen > 0 ? Math.round(attackNum / attackDen) : 0,
    defense: defenseDen > 0 ? Math.round(defenseNum / defenseDen) : 0,
    overall: overallCount > 0 ? Math.round(overallSum / overallCount) : 0,
  };
}

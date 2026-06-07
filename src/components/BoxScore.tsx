"use client";

import { filledCount } from "@/game/draft";
import { formatBoxScorePlayer, positionLabel } from "@/game/positionLabels";
import { MODES } from "@/game/constants";
import type { DraftState, TeamScores } from "@/game/types";

type Props = {
  draft: DraftState;
  scores: TeamScores;
};

export function BoxScore({ draft, scores }: Props) {
  const statsVisible =
    MODES[draft.mode].statsVisible || draft.filled.every(Boolean);
  const count = filledCount(draft);

  return (
    <div className="box-panel">
      <div className="box-head">
        <span className="box-title">
          Box score <strong>{count}/11</strong>
        </span>
      </div>

      <div className="box-ratings">
        <div className="box-rating box-rating-atk">
          <span className="eyebrow">Attack</span>
          <strong>{scores.attack}</strong>
          <div className="rating-bar">
            <div className="rating-fill atk" style={{ width: `${scores.attack}%` }} />
          </div>
        </div>
        <div className="box-rating box-rating-def">
          <span className="eyebrow">Defense</span>
          <strong>{scores.defense}</strong>
          <div className="rating-bar">
            <div className="rating-fill def" style={{ width: `${scores.defense}%` }} />
          </div>
        </div>
      </div>

      <table className="boxscore">
        <tbody>
          {draft.slots.map((slot, i) => {
            const player = draft.filled[i];
            return (
              <tr key={`${slot.pos}-${i}`} className={player ? "" : "empty"}>
                <td className="pos">{positionLabel(slot.pos)}</td>
                <td className="name">
                  {player ? formatBoxScorePlayer(player) : "—"}
                </td>
                <td className="val">
                  {player ? (statsVisible ? player.force : "?") : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="box-overall">
        <span className="eyebrow">Overall</span>
        <strong>{scores.overall}</strong>
      </div>
    </div>
  );
}

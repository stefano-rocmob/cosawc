"use client";

import { positionLabel } from "@/game/positionLabels";
import { MODES } from "@/game/constants";
import type { DraftState } from "@/game/types";
import { PitchMarkings } from "./PitchMarkings";

type Props = {
  draft: DraftState;
  selectedSlot?: number | null;
  compatibleSlots?: number[];
  moveFrom?: number | null;
  moveTargets?: number[];
  onSlotClick?: (index: number) => void;
};

export function Pitch({
  draft,
  selectedSlot = null,
  compatibleSlots = [],
  moveFrom = null,
  moveTargets = [],
  onSlotClick,
}: Props) {
  const statsVisible =
    MODES[draft.mode].statsVisible || draft.filled.every(Boolean);

  return (
    <div className="pitch-outer">
      <div className="pitch-wrap">
        <div className="pitch">
          <PitchMarkings />
          {draft.slots.map((slot, index) => {
            const player = draft.filled[index];
            const classes = [
              "pitch-slot",
              player ? "filled" : "",
              selectedSlot === index || moveFrom === index ? "selected" : "",
              compatibleSlots.includes(index) ? "compatible" : "",
              moveTargets.includes(index) ? "target" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={`${slot.pos}-${index}`}
                type="button"
                className={classes}
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                onClick={() => onSlotClick?.(index)}
                disabled={!onSlotClick}
              >
                <span className="pos">{positionLabel(slot.pos)}</span>
                {player ? (
                  <>
                    {player.legend && (
                      <span className="legend-badge" title="Legend" />
                    )}
                    <span className="name">{player.name}</span>
                    <span className="rating">
                      {statsVisible ? player.rating : "?"}
                    </span>
                  </>
                ) : (
                  <span className="name">—</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { countryDisplay } from "@/game/positionLabels";

type Props = {
  sel: string;
  copa: number;
  rerollsLeft: number;
  onAnotherTeam: () => void;
  onAnotherCup: () => void;
  onEmergencyReroll?: () => void;
  emergencyNeeded?: boolean;
};

export function SquadHeader({
  sel,
  copa,
  rerollsLeft,
  onAnotherTeam,
  onAnotherCup,
  onEmergencyReroll,
  emergencyNeeded,
}: Props) {
  const { name, flag } = countryDisplay(sel);

  return (
    <div className="roll-result">
      <p className="eyebrow">Drawn</p>
      <div className="squad-title">
        <span className="squad-flag">{flag}</span>
        <span className="squad-country">{name}</span>
      </div>
      <p className="squad-copa">Cup {copa}</p>

      <p className="reroll-copy">
        Not feeling it? Re-roll — {rerollsLeft} left
      </p>
      <div className="btn-row reroll-btns">
        <button
          type="button"
          className="secondary"
          disabled={rerollsLeft <= 0}
          onClick={onAnotherTeam}
        >
          Another Team
        </button>
        <button
          type="button"
          className="secondary"
          disabled={rerollsLeft <= 0}
          onClick={onAnotherCup}
        >
          Another Cup
        </button>
        {emergencyNeeded && onEmergencyReroll && (
          <button type="button" className="ghost" onClick={onEmergencyReroll}>
            Emergency reroll
          </button>
        )}
      </div>
    </div>
  );
}

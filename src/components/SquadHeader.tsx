"use client";

import { countryDisplay } from "@/game/positionLabels";

type Props = {
  team: string;
  year: number;
  rerollsLeft: number;
  onAnotherTeam: () => void;
  onAnotherCup: () => void;
  onEmergencyReroll?: () => void;
  emergencyNeeded?: boolean;
};

export function SquadHeader({
  team,
  year,
  rerollsLeft,
  onAnotherTeam,
  onAnotherCup,
  onEmergencyReroll,
  emergencyNeeded,
}: Props) {
  const { name, flag } = countryDisplay(team);

  return (
    <div className="roll-result">
      <p className="eyebrow">Drawn</p>
      <div className="squad-title">
        <span className="squad-flag">{flag}</span>
        <span className="squad-country">{name}</span>
      </div>
      <p className="squad-year">Cup {year}</p>

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

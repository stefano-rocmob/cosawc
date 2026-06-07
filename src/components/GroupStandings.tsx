"use client";

import { USER_TEAM_NAME } from "@/game/matchDisplay";
import { countryDisplay } from "@/game/positionLabels";
import type { GroupStandingRow } from "@/game/types";

type Props = {
  table: GroupStandingRow[];
  advanced: boolean;
};

export function GroupStandings({ table, advanced }: Props) {
  const sorted = [...table].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return (
    <div className="group-standings">
      <p className="eyebrow">Group · final standings</p>
      <table className="group-standings-table">
        <tbody>
          {sorted.map((row, i) => {
            const rank = i + 1;
            const label = row.me
              ? USER_TEAM_NAME
              : row.team
                ? `${countryDisplay(row.team).flag} ${countryDisplay(row.team).name.toUpperCase()}`
                : "—";
            return (
              <tr key={i} className={row.me ? "is-me" : ""}>
                <td className="rank">{rank}°</td>
                <td className="team">{label}</td>
                <td className="pts">{row.pts} pts</td>
                <td className="gd">{row.gd >= 0 ? `+${row.gd}` : row.gd}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={`group-qualified${advanced ? " is-in" : " is-out"}`}>
        {advanced
          ? "Qualified 2 · advances"
          : "Did not qualify · eliminated"}
      </p>
    </div>
  );
}

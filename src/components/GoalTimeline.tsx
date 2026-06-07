"use client";

import type { GoalEvent } from "@/game/types";

type Props = {
  goals: GoalEvent[];
  visibleCount: number;
};

export function GoalTimeline({ goals, visibleCount }: Props) {
  const visible = goals.slice(0, visibleCount);
  if (visible.length === 0) return null;

  return (
    <div className="goal-timeline">
      {visible.map((goal, i) => (
        <div
          key={`${goal.min}-${goal.scorer}-${i}`}
          className={`goal-row${goal.opp ? " is-opp" : ""}`}
        >
          <span className="goal-min">{goal.min}&apos;</span>
          <span className="goal-ball" aria-hidden>
            ⚽
          </span>
          <span className="goal-scorer">{goal.scorer}</span>
        </div>
      ))}
    </div>
  );
}

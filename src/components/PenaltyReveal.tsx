"use client";

import type { PenaltyDisplay } from "@/game/types";

import { penaltyResultLabel } from "@/game/matchDisplay";

type Props = {
  pens: PenaltyDisplay;
  visibleKicks: number;
  advanced: boolean;
  phase?: string;
};

type KickRef = {
  side: "me" | "them";
  index: number;
  phase: "regular" | "sd";
  value: number;
};

function flattenPenKicks(pens: PenaltyDisplay): KickRef[] {
  const kicks: KickRef[] = [];
  for (let i = 0; i < pens.me.length; i++) {
    kicks.push({ side: "me", index: i, phase: "regular", value: pens.me[i] ?? 0 });
    kicks.push({ side: "them", index: i, phase: "regular", value: pens.them[i] ?? 0 });
  }
  if (pens.sd) {
    for (let i = 0; i < pens.sd.me.length; i++) {
      kicks.push({ side: "me", index: i, phase: "sd", value: pens.sd.me[i] ?? 0 });
      kicks.push({
        side: "them",
        index: i,
        phase: "sd",
        value: pens.sd.them[i] ?? 0,
      });
    }
  }
  return kicks;
}

function kickVisible(
  kicks: KickRef[],
  visibleKicks: number,
  side: "me" | "them",
  index: number,
  phase: "regular" | "sd",
): boolean {
  const idx = kicks.findIndex(
    (k) => k.side === side && k.index === index && k.phase === phase,
  );
  return idx >= 0 && idx < visibleKicks;
}

function KickDot({ scored, visible }: { scored: number; visible: boolean }) {
  if (!visible) return <span className="pen-dot pen-dot-pending" />;
  return (
    <span className={`pen-dot${scored ? " is-goal" : " is-miss"}`}>
      {scored ? "✓" : "✕"}
    </span>
  );
}

function PenRows({
  pens,
  kicks,
  visibleKicks,
  phase,
  count,
}: {
  pens: PenaltyDisplay;
  kicks: KickRef[];
  visibleKicks: number;
  phase: "regular" | "sd";
  count: number;
}) {
  const meArr = phase === "regular" ? pens.me : pens.sd?.me ?? [];
  const themArr = phase === "regular" ? pens.them : pens.sd?.them ?? [];

  return (
    <div className="pen-rows">
      <div className="pen-row">
        {Array.from({ length: count }, (_, i) => (
          <KickDot
            key={`me-${phase}-${i}`}
            scored={meArr[i] ?? 0}
            visible={kickVisible(kicks, visibleKicks, "me", i, phase)}
          />
        ))}
      </div>
      <div className="pen-row">
        {Array.from({ length: count }, (_, i) => (
          <KickDot
            key={`them-${phase}-${i}`}
            scored={themArr[i] ?? 0}
            visible={kickVisible(kicks, visibleKicks, "them", i, phase)}
          />
        ))}
      </div>
    </div>
  );
}

export function PenaltyReveal({ pens, visibleKicks, advanced, phase }: Props) {
  const kicks = flattenPenKicks(pens);
  const regularSteps = pens.me.length + pens.them.length;
  const sdCount = pens.sd ? Math.max(pens.sd.me.length, pens.sd.them.length) : 0;
  const allDone = visibleKicks >= kicks.length;

  return (
    <div className="penalty-reveal">
      <p className="eyebrow">Penalty shootout · best of 5</p>
      <PenRows
        pens={pens}
        kicks={kicks}
        visibleKicks={visibleKicks}
        phase="regular"
        count={pens.me.length}
      />

      {sdCount > 0 && visibleKicks > regularSteps && (
        <>
          <p className="pen-sudden eyebrow">Sudden death</p>
          <PenRows
            pens={pens}
            kicks={kicks}
            visibleKicks={visibleKicks}
            phase="sd"
            count={sdCount}
          />
        </>
      )}

      {allDone && (
        <p className={`pen-result${advanced ? " is-win" : " is-loss"}`}>
          {pens.score.replace("–", "-")} ·{" "}
          {penaltyResultLabel(phase ?? "", advanced)}
        </p>
      )}
    </div>
  );
}

export function totalPenaltySteps(pens: PenaltyDisplay): number {
  return flattenPenKicks(pens).length;
}

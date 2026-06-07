"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isPlayerSelectable } from "@/game/draft";
import {
  formatJerseyNumber,
  formatPlayerPositions,
  formatPlayerTooltip,
  primaryPositionOrder,
} from "@/game/positionLabels";
import { MODES } from "@/game/constants";
import type { DraftState, Player } from "@/game/types";
import { DelayedTooltip } from "./DelayedTooltip";

type Props = {
  draft: DraftState;
  squad: Player[];
  pendingPlayer?: Player | null;
  onSelectPlayer?: (player: Player) => void;
};

function PoolRow({
  player,
  statsVisible,
  isPending,
  selectable,
  onSelectPlayer,
}: {
  player: Player;
  statsVisible: boolean;
  isPending: boolean;
  selectable: boolean;
  onSelectPlayer?: (player: Player) => void;
}) {
  const nameRef = useRef<HTMLSpanElement>(null);
  const [nameTruncated, setNameTruncated] = useState(false);
  const posTruncated = statsVisible && player.positions.length > 2;
  const needsTooltip = nameTruncated || posTruncated;

  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    const check = () => setNameTruncated(el.scrollWidth > el.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [player.name]);

  const posLabel = statsVisible ? formatPlayerPositions(player.positions) : "?";

  const row = (
    <button
      type="button"
      className={[
        "pool-row",
        selectable ? "selectable" : "disabled",
        isPending ? "is-selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={!selectable || !onSelectPlayer}
      onClick={() => onSelectPlayer?.(player)}
    >
      <span className="pool-num">
        {formatJerseyNumber(player.number, statsVisible)}
      </span>
      <span className="pool-name" ref={nameRef}>
        {player.name}
        {player.legend && <span className="legend-star"> ★</span>}
      </span>
      <span className="pool-pos">{posLabel}</span>
      <span className="pool-force">
        {statsVisible ? player.force : "?"}
      </span>
    </button>
  );

  if (!needsTooltip) return row;

  return (
    <DelayedTooltip
      enabled
      content={formatPlayerTooltip(player, statsVisible)}
    >
      {row}
    </DelayedTooltip>
  );
}

export function SquadList({
  draft,
  squad,
  pendingPlayer,
  onSelectPlayer,
}: Props) {
  const statsVisible =
    MODES[draft.mode].statsVisible || draft.filled.every(Boolean);

  const sortedSquad = useMemo(
    () =>
      [...squad].sort(
        (a, b) => primaryPositionOrder(a.positions) - primaryPositionOrder(b.positions),
      ),
    [squad],
  );

  return (
    <div className="draft-pool">
      <div className="draft-pool-head">
        <span className="eyebrow">Pick a player</span>
      </div>
      <div className="squad-list">
        {sortedSquad.map((player) => (
          <PoolRow
            key={player.playerId}
            player={player}
            statsVisible={statsVisible}
            isPending={pendingPlayer?.playerId === player.playerId}
            selectable={isPlayerSelectable(draft, player)}
            onSelectPlayer={onSelectPlayer}
          />
        ))}
      </div>
    </div>
  );
}

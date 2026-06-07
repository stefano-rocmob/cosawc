"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  choosePlayer,
  createGameState,
  getMoveTargets,
  hasSelectablePlayer,
  lineupComplete,
  movePlayer,
  rerollSquadAction,
  rollSquad,
  updateDraftOptions,
} from "@/game/draft";
import { generateSeed } from "@/game/rng";
import { generateOpponents } from "@/game/opponents";
import { calcTeamScores } from "@/game/scoring";
import { simulateTournament } from "@/game/simulation";
import { createSquadLoader } from "@/game/squadLoader";
import { buildShareUrl } from "@/game/share";
import type {
  FormationKey,
  GameState,
  ModeKey,
  Player,
  StyleKey,
  TournamentResult,
} from "@/game/types";
import { useLocalPref } from "@/hooks/useLocalPref";
import { Pitch } from "./Pitch";
import { SquadList } from "./SquadList";
import { SquadHeader } from "./SquadHeader";
import { BoxScore } from "./BoxScore";
import { DraftHeader } from "./DraftHeader";
import { StartControls } from "./StartControls";
import { TournamentRun } from "./TournamentRun";

type Phase = "drafting" | "ready" | "simulating" | "revealing" | "done";

export function PlayGame() {
  const [game, setGame] = useState<GameState>(() => createGameState(generateSeed()));
  const [phase, setPhase] = useState<Phase>("drafting");
  const [currentSquad, setCurrentSquad] = useState<Player[]>([]);
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [moveFrom, setMoveFrom] = useState<number | null>(null);
  const [simResult, setSimResult] = useState<TournamentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useLocalPref("cosa-wc-theme", "light", ["dark", "light"] as const);
  const [revealMode, setRevealMode] = useLocalPref("cosa-wc-reveal", "manual", ["manual", "auto"] as const);

  const loader = useMemo(() => createSquadLoader(), []);

  const scores = useMemo(() => calcTeamScores(game.draft), [game.draft]);
  const moveTargets = moveFrom !== null ? getMoveTargets(game.draft, moveFrom) : [];
  const compatibleSlots = useMemo(() => {
    if (!pendingPlayer) return [];
    return game.draft.slots
      .map((slot, i) => ({ slot, i }))
      .filter(
        ({ slot, i }) =>
          !game.draft.filled[i] && pendingPlayer.positions.includes(slot.pos),
      )
      .map(({ i }) => i);
  }, [pendingPlayer, game.draft]);
  const emergencyNeeded =
    !!game.current &&
    currentSquad.length > 0 &&
    !hasSelectablePlayer(game.draft, currentSquad);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const currentRef = game.current;

  useEffect(() => {
    if (!currentRef) {
      setCurrentSquad([]);
      return;
    }
    loader
      .ensure(currentRef.team, currentRef.year)
      .then(setCurrentSquad)
      .catch((err: Error) => setError(err.message));
  }, [currentRef, loader]);

  const apply = useCallback((updater: (prev: GameState) => GameState) => {
    setGame((prev) => updater(prev));
    setError(null);
  }, []);

  const onRoll = () => {
    apply((prev) => rollSquad(prev));
    setPendingPlayer(null);
    setSelectedSlot(null);
    setMoveFrom(null);
  };

  const onReroll = (axis: "year" | "team") => {
    try {
      apply((prev) => rerollSquadAction(prev, axis, true));
      setPendingPlayer(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onEmergencyReroll = () => {
    try {
      apply((prev) => rerollSquadAction(prev, "team", false));
      setPendingPlayer(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onSelectPlayer = (player: Player) => {
    setPendingPlayer(player);
    setMoveFrom(null);
    const compatible = game.draft.slots
      .map((slot, i) => ({ slot, i }))
      .filter(({ slot, i }) => !game.draft.filled[i] && player.positions.includes(slot.pos))
      .map(({ i }) => i);
    if (compatible.length === 1) {
      setSelectedSlot(compatible[0]);
    } else {
      setSelectedSlot(null);
    }
  };

  const onSlotClick = (index: number) => {
    if (pendingPlayer) {
      const slot = game.draft.slots[index];
      if (!slot || game.draft.filled[index] || !pendingPlayer.positions.includes(slot.pos)) {
        return;
      }
      try {
        apply((prev) => {
          const next = choosePlayer(prev, pendingPlayer, index);
          if (lineupComplete(next.draft)) {
            setPhase("ready");
          }
          return next;
        });
        setPendingPlayer(null);
        setSelectedSlot(null);
      } catch (err) {
        setError((err as Error).message);
      }
      return;
    }

    if (moveFrom !== null) {
      if (!moveTargets.includes(index)) return;
      try {
        apply((prev) => movePlayer(prev, moveFrom, index));
        setMoveFrom(null);
      } catch (err) {
        setError((err as Error).message);
      }
      return;
    }

    if (game.draft.filled[index]) {
      setMoveFrom(index);
      setPendingPlayer(null);
    }
  };

  const onSimulate = async () => {
    try {
      const opponents = generateOpponents(game);
      await loader.ensureMany(opponents);
      const lineup = game.draft.filled.filter((p): p is Player => p !== null);
      const result = simulateTournament(
        game.seed,
        scores.attack,
        scores.defense,
        lineup,
        opponents,
        (team, year) => loader.get(team, year),
      );
      setSimResult(result);
      setPhase("revealing");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onPlayAgain = () => {
    const nextSeed = generateSeed();
    setGame(createGameState(nextSeed, {
      formation: game.draft.formation,
      style: game.draft.style,
      mode: game.draft.mode,
    }));
    setPhase("drafting");
    setSimResult(null);
    setPendingPlayer(null);
    setMoveFrom(null);
    setCurrentSquad([]);
  };

  const updateOption = (
    key: "formation" | "style" | "mode",
    value: FormationKey | StyleKey | ModeKey,
  ) => {
    apply((prev) =>
      updateDraftOptions(prev, {
        formation: key === "formation" ? (value as FormationKey) : prev.draft.formation,
        style: key === "style" ? (value as StyleKey) : prev.draft.style,
        mode: key === "mode" ? (value as ModeKey) : prev.draft.mode,
      }),
    );
  };

  const shareUrl =
    typeof window !== "undefined" && lineupComplete(game.draft)
      ? buildShareUrl(game, window.location.origin)
      : undefined;

  return (
    <div className="app-shell">
      {(phase === "drafting" ||
        phase === "ready" ||
        phase === "revealing" ||
        phase === "done") && (
        <DraftHeader
          draft={game.draft}
          seed={game.seed}
          theme={theme}
          revealMode={revealMode}
          onThemeChange={setTheme}
          onRevealChange={setRevealMode}
          onHomeClick={onPlayAgain}
        />
      )}

      {error && (
        <div className="panel error-panel">{error}</div>
      )}

      {(phase === "drafting" || phase === "ready") && (
        <div className="draft-layout">
          <aside className="roll-panel">
            {lineupComplete(game.draft) ? (
              <div className="simulate-panel">
                <p className="eyebrow">Ready to play</p>
                <p className="simulate-copy">
                  Your squad is complete. Simulate the World Cup campaign.
                </p>
                <button type="button" className="roll-cta" onClick={onSimulate}>
                  Simulate Cup
                </button>
              </div>
            ) : game.current ? (
              <>
                <SquadHeader
                  team={game.current.team}
                  year={game.current.year}
                  rerollsLeft={game.draft.rerollsLeft}
                  onAnotherTeam={() => onReroll("team")}
                  onAnotherCup={() => onReroll("year")}
                  onEmergencyReroll={onEmergencyReroll}
                  emergencyNeeded={emergencyNeeded}
                />
                <SquadList
                  draft={game.draft}
                  squad={currentSquad}
                  pendingPlayer={pendingPlayer}
                  onSelectPlayer={onSelectPlayer}
                />
                {pendingPlayer && (
                  <p className="progress pitch-hint">
                    Tap a compatible empty slot for {pendingPlayer.name}
                  </p>
                )}
                {moveFrom !== null && (
                  <p className="progress pitch-hint">
                    Tap a highlighted slot to move/swap
                  </p>
                )}
              </>
            ) : (
              <StartControls
                formation={game.draft.formation}
                style={game.draft.style}
                mode={game.draft.mode}
                onChange={updateOption}
                onRoll={onRoll}
              />
            )}
          </aside>

          <main className="pitch-panel">
            <Pitch
              draft={game.draft}
              selectedSlot={selectedSlot}
              compatibleSlots={compatibleSlots}
              moveFrom={moveFrom}
              moveTargets={moveTargets}
              onSlotClick={onSlotClick}
            />
            {game.current && !pendingPlayer && !lineupComplete(game.draft) && (
              <p className="pitch-hint">Select a player from the list, then assign to a slot</p>
            )}
          </main>

          <aside className="box-panel-wrap">
            <BoxScore draft={game.draft} scores={scores} />
          </aside>
        </div>
      )}

      {(phase === "revealing" || phase === "done") && simResult && (
        <TournamentRun
          result={simResult}
          seed={game.seed}
          overall={scores.overall}
          lineup={game.draft.filled.filter((p): p is Player => p !== null)}
          revealMode={revealMode}
          shareUrl={shareUrl}
          onPlayAgain={onPlayAgain}
        />
      )}
    </div>
  );
}

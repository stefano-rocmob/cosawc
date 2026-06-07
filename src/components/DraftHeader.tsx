"use client";

import { MODE_DISPLAY, STYLE_DISPLAY } from "@/game/positionLabels";
import type { DraftState } from "@/game/types";
import { APP_VERSION } from "@/version";

type Props = {
  draft: DraftState;
  seed: string;
  theme: "light" | "dark";
  revealMode: "manual" | "auto";
  onThemeChange: (theme: "light" | "dark") => void;
  onRevealChange: (mode: "manual" | "auto") => void;
  onHomeClick?: () => void;
};

export function DraftHeader({
  draft,
  seed,
  theme,
  revealMode,
  onThemeChange,
  onRevealChange,
  onHomeClick,
}: Props) {
  const configLabel = [
    draft.formation,
    STYLE_DISPLAY[draft.style],
    MODE_DISPLAY[draft.mode],
  ].join(" · ");

  return (
    <header className="draft-header">
      <button
        type="button"
        className="draft-header-brand"
        onClick={onHomeClick}
        title="Start a new session"
      >
        <div className="brand-text">
          <span className="brand-name">COSA WC — Version {APP_VERSION}</span>
          <span className="brand-tagline">Build · Simulate · Win</span>
        </div>
      </button>
      <span className="draft-config-label">{configLabel}</span>
      <div className="draft-header-right play-toggles">
        <label className="toggle-label">
          <select
            value={revealMode}
            onChange={(e) => onRevealChange(e.target.value as typeof revealMode)}
          >
            <option value="manual">Match by match</option>
            <option value="auto">Automatic</option>
          </select>
        </label>
        <button
          type="button"
          className={`header-pill${theme === "light" ? " is-active" : ""}`}
          onClick={() => onThemeChange("light")}
        >
          Light
        </button>
        <button
          type="button"
          className={`header-pill${theme === "dark" ? " is-active" : ""}`}
          onClick={() => onThemeChange("dark")}
        >
          Dark
        </button>
        <span className="eyebrow seed-label">Seed {seed}</span>
      </div>
    </header>
  );
}

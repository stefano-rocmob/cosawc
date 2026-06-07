"use client";

import { FORMATION_KEYS, STYLE_KEYS } from "@/game/constants";
import { MODE_BUTTON_LABELS, STYLE_BUTTON_LABELS } from "@/game/positionLabels";
import type { FormationKey, ModeKey, StyleKey } from "@/game/types";

type Props = {
  formation: FormationKey;
  style: StyleKey;
  mode: ModeKey;
  disabled?: boolean;
  onChange: (key: "formation" | "style" | "mode", value: FormationKey | StyleKey | ModeKey) => void;
  onRoll: () => void;
};

const MODE_KEYS: ModeKey[] = ["classico", "almanaque"];

export function StartControls({
  formation,
  style,
  mode,
  disabled = false,
  onChange,
  onRoll,
}: Props) {
  return (
    <div className="start-controls">
      <section className="cfg-section">
        <h2 className="eyebrow">Formation</h2>
        <div className="formation-grid">
          {FORMATION_KEYS.map((f) => (
            <button
              key={f}
              type="button"
              className={`option-btn${formation === f ? " is-active" : ""}`}
              disabled={disabled}
              onClick={() => onChange("formation", f)}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="cfg-section">
        <h2 className="eyebrow">Style</h2>
        <div className="option-row">
          {STYLE_KEYS.map((s) => (
            <button
              key={s}
              type="button"
              className={`option-btn${style === s ? " is-active" : ""}`}
              disabled={disabled}
              onClick={() => onChange("style", s)}
            >
              {STYLE_BUTTON_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      <section className="cfg-section">
        <h2 className="eyebrow">Mode · Difficulty</h2>
        <div className="option-row">
          {MODE_KEYS.map((m) => (
            <button
              key={m}
              type="button"
              className={`option-btn${mode === m ? " is-active" : ""}`}
              disabled={disabled}
              onClick={() => onChange("mode", m)}
            >
              {MODE_BUTTON_LABELS[m]}
            </button>
          ))}
        </div>
      </section>

      <p className="roll-hint">Roll to draw a national team and a World Cup</p>

      <button type="button" className="roll-cta" onClick={onRoll}>
        Roll <span aria-hidden>🎲</span>
      </button>
    </div>
  );
}

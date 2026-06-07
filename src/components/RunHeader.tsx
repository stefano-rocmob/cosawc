"use client";

type Props = {
  seed: string;
  revealMode: "manual" | "auto";
  theme: "light" | "dark";
  onRevealChange: (mode: "manual" | "auto") => void;
  onThemeChange: (theme: "light" | "dark") => void;
};

export function RunHeader({
  seed,
  revealMode,
  theme,
  onRevealChange,
  onThemeChange,
}: Props) {
  return (
    <header className="run-header">
      <div className="run-header-left">
        <p className="eyebrow">The run · seed #{seed}</p>
        <h1 className="run-title">The run</h1>
      </div>
      <div className="run-header-right">
        <button
          type="button"
          className={`header-pill${revealMode === "manual" ? " is-active" : ""}`}
          onClick={() => onRevealChange("manual")}
        >
          Match by match
        </button>
        <button
          type="button"
          className={`header-pill${revealMode === "auto" ? " is-active" : ""}`}
          onClick={() => onRevealChange("auto")}
        >
          Automatic
        </button>
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
      </div>
    </header>
  );
}

import { describe, expect, it } from "vitest";
import {
  formatAllPlayerPositions,
  formatBoxScorePlayer,
  formatJerseyNumber,
  formatPlayerPositions,
  positionLabel,
} from "./positionLabels";

describe("display formatters", () => {
  it("formats jersey with # prefix", () => {
    expect(formatJerseyNumber(12, true)).toBe("#12");
  });

  it("shows #0 for zero (literal v1)", () => {
    expect(formatJerseyNumber(0, true)).toBe("#0");
  });

  it("hides jersey in memory mode", () => {
    expect(formatJerseyNumber(12, false)).toBe("?");
  });

  it("formats single position", () => {
    expect(formatPlayerPositions(["GK"])).toBe("GK");
  });

  it("formats two positions with slash", () => {
    expect(formatPlayerPositions(["RB", "CB"])).toBe("RB/CB");
  });

  it("formats three positions with +N suffix", () => {
    expect(formatPlayerPositions(["DM", "RM", "CM"])).toBe("DM/RM+1");
  });

  it("maps pitch position codes to labels", () => {
    expect(positionLabel("AM")).toBe("AM");
    expect(positionLabel("ST")).toBe("ST");
  });

  it("formats all positions comma-separated", () => {
    expect(formatAllPlayerPositions(["AM", "LW", "ST"])).toBe("AM, LW, ST");
  });

  it("formats box score player with positions", () => {
    expect(
      formatBoxScorePlayer({ name: "Neymar", positions: ["LW", "ST"] }),
    ).toBe("Neymar (LW, ST)");
  });
});

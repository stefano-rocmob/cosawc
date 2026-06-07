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

  it("hides jersey in almanaque mode", () => {
    expect(formatJerseyNumber(12, false)).toBe("?");
  });

  it("formats single position", () => {
    expect(formatPlayerPositions(["GOL"])).toBe("GK");
  });

  it("formats two positions with slash", () => {
    expect(formatPlayerPositions(["LD", "ZAG"])).toBe("RB/CB");
  });

  it("formats three positions with +N suffix", () => {
    expect(formatPlayerPositions(["VOL", "MD", "MC"])).toBe("DM/RM+1");
  });

  it("maps pitch position codes to EN labels", () => {
    expect(positionLabel("MEI")).toBe("AM");
    expect(positionLabel("CA")).toBe("ST");
  });

  it("formats all positions comma-separated", () => {
    expect(formatAllPlayerPositions(["MEI", "PE", "CA"])).toBe("AM, LW, ST");
  });

  it("formats box score player with positions", () => {
    expect(
      formatBoxScorePlayer({ name: "Neymar", positions: ["PE", "CA"] }),
    ).toBe("Neymar (LW, ST)");
  });
});

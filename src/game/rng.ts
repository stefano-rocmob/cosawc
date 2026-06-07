import type { Rng } from "./types";

function hashSeed(seed: string): number {
  let h = 0x6a09e667 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 0xcc9e2d51);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

/** Deterministic RNG from a string seed (v1 mulberry32-style). */
export function createRng(seed: string): Rng {
  let state = hashSeed(seed);
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
}

/** Uniform pick from a non-empty array. */
export function pick<T>(rng: Rng, items: T[]): T {
  if (items.length === 0) {
    throw new Error("pick: empty array");
  }
  const index = Math.floor(rng() * items.length);
  const item = items[index];
  if (item === undefined) {
    throw new Error("pick: index out of range");
  }
  return item;
}

export function generateSeed(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0].toString(36);
}

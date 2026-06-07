import type { PenaltyDisplay, Rng } from "./types";

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

/** Generate penalty shootout display matching the predetermined winner. */
export function generatePenaltyDisplay(
  rng: Rng,
  userWins: boolean,
): PenaltyDisplay {
  for (let attempt = 0; attempt < 100; attempt++) {
    const me = Array.from({ length: 5 }, () => +(rng() < 0.78));
    const them = Array.from({ length: 5 }, () => +(rng() < 0.78));
    const meTotal = sum(me);
    const themTotal = sum(them);

    if ((userWins ? meTotal : themTotal) > (userWins ? themTotal : meTotal)) {
      return { me, them, score: `${meTotal}–${themTotal}` };
    }

    if (meTotal === themTotal) {
      const sdMe: number[] = [];
      const sdThem: number[] = [];
      let c = meTotal;
      let o = themTotal;
      let p = 0;

      while (c === o && p < 5) {
        p++;
        const s = +(rng() < 0.78);
        const l = +(rng() < 0.78);
        if (s !== l) {
          const e = +userWins;
          const t = +!userWins;
          sdMe.push(e);
          sdThem.push(t);
          c += e;
          o += t;
        } else {
          sdMe.push(s);
          sdThem.push(l);
          c += s;
          o += l;
        }
      }

      if (c === o) {
        const e = +userWins;
        const t = +!userWins;
        sdMe.push(e);
        sdThem.push(t);
        c += e;
        o += t;
      }

      return {
        me,
        them,
        sd: { me: sdMe, them: sdThem },
        score: `${c}–${o}`,
      };
    }
  }

  return userWins
    ? { me: [1, 0, 0, 0, 0], them: [0, 0, 0, 0, 0], score: "1–0" }
    : { me: [0, 0, 0, 0, 0], them: [1, 0, 0, 0, 0], score: "0–1" };
}

// SM-2 "lite" — a faithful but compact implementation of the classic Anki/SM-2
// algorithm. Given a card's current state and a quality rating, returns the next
// interval (in days), the next due date, and an updated ease factor.

export type SM2Quality = "again" | "hard" | "good" | "easy";

export interface SM2State {
  /** Number of consecutive correct reviews (resets to 0 on "again"). */
  repetitions: number;
  /** Interval in days until next review. */
  intervalDays: number;
  /** Ease factor; classic SM-2 starts at 2.5. Clamped to >= 1.3. */
  ease: number;
  /** ISO date string for when the card is next due. */
  due: string;
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export function freshCard(now: Date = new Date()): SM2State {
  return {
    repetitions: 0,
    intervalDays: 0,
    ease: 2.5,
    due: now.toISOString(),
  };
}

function qualityToGrade(q: SM2Quality): number {
  // Map to SM-2's 0-5 quality scale.
  switch (q) {
    case "again":
      return 1;
    case "hard":
      return 3;
    case "good":
      return 4;
    case "easy":
      return 5;
  }
}

export function review(state: SM2State, q: SM2Quality, now: Date = new Date()): SM2State {
  const grade = qualityToGrade(q);
  let { repetitions, intervalDays, ease } = state;

  if (q === "again") {
    repetitions = 0;
    intervalDays = 0; // see again today (will resurface)
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * ease);
  }

  // Standard SM-2 ease update.
  ease = ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (ease < 1.3) ease = 1.3;

  // "Easy" bonus widens the interval a bit.
  if (q === "easy" && repetitions >= 2) {
    intervalDays = Math.max(intervalDays + 1, Math.round(intervalDays * 1.3));
  }

  const due = new Date(now.getTime() + intervalDays * ONE_DAY).toISOString();
  return { repetitions, intervalDays, ease, due };
}

export function isDue(state: SM2State, now: Date = new Date()): boolean {
  return new Date(state.due).getTime() <= now.getTime();
}

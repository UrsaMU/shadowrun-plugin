// ─── Karma mutation helper ─────────────────────────────────────────────────────
// Called by +karma/award, +karma/spend, +karma/advance, and +run/close (P3-B).

import type { IShadowrunChar, IKarmaLogEntry } from "../types.ts";
import { saveChar } from "../db.ts";

/**
 * Apply a karma delta to a character, append the log entry, and persist.
 *
 * @param char          Character to mutate.
 * @param delta         Positive = awarded; negative = spent.
 * @param reason        Human-readable reason (should already be validated/stripped).
 * @param awardedByName Optional: name of staff member who awarded karma.
 * @param advancement   Optional: advancement detail if spending karma to improve.
 */
export async function awardKarma(
  char: IShadowrunChar,
  delta: number,
  reason: string,
  awardedByName?: string,
  advancement?: IKarmaLogEntry["advancement"],
): Promise<void> {
  char.karmaAvailable += delta;
  if (delta > 0) char.karmaTotal += delta;

  const entry: IKarmaLogEntry = { timestamp: Date.now(), delta, reason };
  if (awardedByName) entry.awardedBy = awardedByName;
  if (advancement)   entry.advancement = advancement;
  char.karmaLog.push(entry);

  await saveChar(char);
}

// ─── Dice roll log database layer ─────────────────────────────────────────────

import { DBO } from "@ursamu/ursamu";

// ── Interface ─────────────────────────────────────────────────────────────────

export interface IRollLogEntry {
  id: string;
  playerId: string;
  playerName: string;
  timestamp: number;
  pool: number;
  dice: number[];
  hits: number;
  glitch: boolean;
  critGlitch: boolean;
  edgeUsed: boolean;
  threshold?: number;
  success?: boolean;
}

// ── DBO ───────────────────────────────────────────────────────────────────────

/** All dice roll log records. One document per roll. */
export const rolllogs = new DBO<IRollLogEntry>("shadowrun.rolllogs");

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Append a roll log entry. Fire-and-forget: errors are swallowed so logging
 * never blocks roll output or causes a visible error to the player.
 */
export async function appendRollLog(entry: Omit<IRollLogEntry, "id">): Promise<void> {
  await rolllogs.create({ ...entry, id: crypto.randomUUID() });
}

/**
 * Fetch recent rolls for a player, sorted newest-first.
 * @param playerId  Player to query.
 * @param limit     Maximum number of entries to return (default 20).
 */
export async function getRecentRolls(
  playerId: string,
  limit = 20,
): Promise<IRollLogEntry[]> {
  const all = await rolllogs.find({ playerId });
  return all
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
}

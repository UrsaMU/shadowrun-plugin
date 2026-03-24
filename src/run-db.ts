// ─── Run database layer ────────────────────────────────────────────────────────

import { DBO } from "@ursamu/ursamu";

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface IRunRosterEntry {
  playerId: string;
  playerName: string;
  registeredAt: number;
  karmaAwarded: number;
}

export interface IRunAwardEntry {
  timestamp: number;
  playerId: string;
  playerName: string;
  delta: number;
  reason: string;
  awardedByName: string;
}

export interface IShadowrunRun {
  id: string;
  number: number;           // auto-increment; query runs by this, not by id
  name: string;             // max 80 chars
  summary: string;          // max 500 chars
  status: "open" | "active" | "closed";
  createdBy: string;
  createdByName: string;
  createdAt: number;
  openedAt?: number;
  closedAt?: number;
  baseKarmaAward: number;
  roster: IRunRosterEntry[];
  awardLog: IRunAwardEntry[];
}

// ── DBO ───────────────────────────────────────────────────────────────────────

/** All run records. */
export const runs = new DBO<IShadowrunRun>("shadowrun.runs");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fetch a run by its sequential run number. Returns null if not found. */
export async function getRun(runNumber: number): Promise<IShadowrunRun | null> {
  const all = await runs.find({});
  return all.find((r) => r.number === runNumber) ?? null;
}

/** Create or update a run record. Always keyed on the auto-increment `number`. */
export async function saveRun(run: IShadowrunRun): Promise<void> {
  const byId = await runs.find({ id: run.id });
  if (byId[0]) {
    await runs.update({ id: run.id }, run);
  } else {
    await runs.create(run);
  }
}

/** Return the next unused run number (max existing + 1, starting at 1). */
export async function getNextRunNumber(): Promise<number> {
  const all = await runs.find({});
  if (all.length === 0) return 1;
  return Math.max(...all.map((r) => r.number)) + 1;
}

/** Return the most recent non-closed run, or null. */
export async function getActiveRun(): Promise<IShadowrunRun | null> {
  const all = await runs.find({});
  const active = all
    .filter((r) => r.status !== "closed")
    .sort((a, b) => b.createdAt - a.createdAt);
  return active[0] ?? null;
}

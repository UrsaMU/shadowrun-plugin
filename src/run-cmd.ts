// ─── +run command ─────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { runs, getRun, saveRun, getNextRunNumber, getActiveRun } from "./run-db.ts";
import type { IShadowrunRun, IRunRosterEntry, IRunAwardEntry } from "./run-db.ts";
import { getChar } from "./db.ts";
import { awardKarma } from "./chargen/karma-ops.ts";
import { validateRunBonusKarma } from "./sr4/karma.ts";

const MAX_RUN_NAME    = 80;
const MAX_RUN_SUMMARY = 500;
const MAX_BASE_KARMA  = 20;

addCmd({
  name: "+run",
  pattern: /^\+run(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+run[/<switch>] [<args>]  — Run (scene) management.

Switches:
  /create <name>=<summary>              Create a new run (admin).
  /register [<run#>]                    Register for a run.
  /unregister [<run#>]                  Unregister from a run.
  /roster [<run#>]                      Show run roster.
  /open <run#>                          Mark a run as active (admin).
  /close <run#>=<baseKarma>             Close run and award base karma (admin).
  /info <run#>                          Show full run details.
  /award <run#> <player>=<karma> <why>  Bonus karma to one player (admin).

Examples:
  +run                          List open/active runs.
  +run/create Redmond Rats=Extraction job in Redmond.
  +run/register 3               Register for run #3.
  +run/close 3=5                Close run #3, award 5 karma to all.
  +run/award 3 Alice=2 MVP      Award Alice 2 bonus karma on run #3.`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const arg = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":           return await listRuns(u);
      case "create":     return await createRun(u, arg);
      case "register":   return await registerRun(u, arg, true);
      case "unregister": return await registerRun(u, arg, false);
      case "roster":     return await showRoster(u, arg);
      case "open":       return await openRun(u, arg);
      case "close":      return await closeRun(u, arg);
      case "info":       return await infoRun(u, arg);
      case "award":      return await awardRun(u, arg);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help run%cn.`);
    }
  },
});

// ── helpers ───────────────────────────────────────────────────────────────────

function isAdmin(u: IUrsamuSDK): boolean {
  return u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
}

async function resolveRun(u: IUrsamuSDK, arg: string): Promise<IShadowrunRun | null> {
  if (!arg) {
    const active = await getActiveRun();
    if (!active) { u.send("No active run found. Specify a run number."); return null; }
    return active;
  }
  const num = parseInt(arg, 10);
  if (isNaN(num) || num < 1) { u.send("Invalid run number."); return null; }
  const run = await getRun(num);
  if (!run) { u.send(`Run #${num} not found.`); return null; }
  return run;
}

// ── list ──────────────────────────────────────────────────────────────────────

async function listRuns(u: IUrsamuSDK): Promise<void> {
  const all = await runs.find({});
  const visible = all
    .filter((r) => r.status !== "closed")
    .sort((a, b) => a.number - b.number);

  if (visible.length === 0) {
    u.send("No open or active runs.");
    return;
  }

  const lines = ["%ch  #    Status   Name%cn"];
  for (const r of visible) {
    const statusTag = r.status === "active" ? "%cg%chACTIVE%cn" : "%cyOPEN%cn";
    lines.push(`  ${String(r.number).padStart(3)}  ${statusTag.padEnd(8)}  ${r.name}`);
  }
  u.send(lines.join("%r"));
}

// ── create ────────────────────────────────────────────────────────────────────

async function createRun(u: IUrsamuSDK, arg: string): Promise<void> {
  if (!isAdmin(u)) { u.send("Only staff can create runs."); return; }

  const eqIdx = arg.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +run/create <name>=<summary>"); return; }

  const name    = arg.slice(0, eqIdx).trim().slice(0, MAX_RUN_NAME);
  const summary = arg.slice(eqIdx + 1).trim().slice(0, MAX_RUN_SUMMARY);

  if (!name) { u.send("Run name cannot be empty."); return; }
  if (!summary) { u.send("Run summary cannot be empty."); return; }

  const number = await getNextRunNumber();
  const run: IShadowrunRun = {
    id: crypto.randomUUID(),
    number,
    name,
    summary,
    status: "open",
    createdBy: u.me.id,
    createdByName: u.me.name ?? "Unknown",
    createdAt: Date.now(),
    baseKarmaAward: 0,
    roster: [],
    awardLog: [],
  };

  await saveRun(run);
  u.send(`%chRun #${number} created:%cn ${name}`);
}

// ── register / unregister ─────────────────────────────────────────────────────

async function registerRun(u: IUrsamuSDK, arg: string, adding: boolean): Promise<void> {
  const run = await resolveRun(u, arg);
  if (!run) return;

  if (run.status === "closed") {
    u.send(`Run #${run.number} is closed.`);
    return;
  }

  const idx = run.roster.findIndex((e) => e.playerId === u.me.id);

  if (adding) {
    if (idx !== -1) { u.send(`You are already registered for run #${run.number}.`); return; }
    const entry: IRunRosterEntry = {
      playerId: u.me.id,
      playerName: u.me.name ?? "Unknown",
      registeredAt: Date.now(),
      karmaAwarded: 0,
    };
    run.roster.push(entry);
    await saveRun(run);
    u.send(`%chRegistered for run #${run.number}:%cn ${run.name}`);
  } else {
    if (idx === -1) { u.send(`You are not registered for run #${run.number}.`); return; }
    run.roster.splice(idx, 1);
    await saveRun(run);
    u.send(`Unregistered from run #${run.number}.`);
  }
}

// ── roster ────────────────────────────────────────────────────────────────────

async function showRoster(u: IUrsamuSDK, arg: string): Promise<void> {
  const run = await resolveRun(u, arg);
  if (!run) return;

  const lines = [
    `%ch  Run #${run.number}: ${run.name}%cn`,
    `  Status: ${run.status}   Base Karma: ${run.baseKarmaAward}`,
    `%ch  Roster (${run.roster.length}):%cn`,
  ];

  if (run.roster.length === 0) {
    lines.push("  (no one registered)");
  } else {
    for (const e of run.roster) {
      lines.push(`  ${e.playerName.padEnd(30)}  karma: ${e.karmaAwarded}`);
    }
  }

  u.send(lines.join("%r"));
}

// ── open ──────────────────────────────────────────────────────────────────────

async function openRun(u: IUrsamuSDK, arg: string): Promise<void> {
  if (!isAdmin(u)) { u.send("Only staff can open runs."); return; }

  const run = await resolveRun(u, arg);
  if (!run) return;

  if (run.status !== "open") {
    u.send(`Run #${run.number} is already ${run.status}.`);
    return;
  }

  run.status = "active";
  run.openedAt = Date.now();
  await saveRun(run);
  u.send(`%chRun #${run.number} is now ACTIVE:%cn ${run.name}`);
}

// ── close ─────────────────────────────────────────────────────────────────────

async function closeRun(u: IUrsamuSDK, arg: string): Promise<void> {
  if (!isAdmin(u)) { u.send("Only staff can close runs."); return; }

  const eqIdx = arg.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +run/close <run#>=<baseKarma>"); return; }

  const numStr   = arg.slice(0, eqIdx).trim();
  const karmaStr = arg.slice(eqIdx + 1).trim();
  const num      = parseInt(numStr, 10);
  const karma    = parseInt(karmaStr, 10);

  if (isNaN(num) || num < 1) { u.send("Invalid run number."); return; }
  if (isNaN(karma) || karma < 0 || karma > MAX_BASE_KARMA) {
    u.send(`Base karma must be 0–${MAX_BASE_KARMA}. Use /award for larger bonuses.`);
    return;
  }

  const run = await getRun(num);
  if (!run) { u.send(`Run #${num} not found.`); return; }
  if (run.status === "closed") { u.send(`Run #${num} is already closed.`); return; }

  run.status = "closed";
  run.closedAt = Date.now();
  run.baseKarmaAward = karma;

  const staffName = u.me.name ?? "Unknown";
  const reason    = `Run #${run.number}: ${run.name}`;

  const awarded: string[] = [];
  for (const entry of run.roster) {
    const char = await getChar(entry.playerId);
    if (!char) continue;
    entry.karmaAwarded += karma;
    await awardKarma(char, karma, reason, staffName);
    awarded.push(entry.playerName);
  }

  await saveRun(run);

  const lines = [
    `%chRun #${run.number} closed.%cn  Base karma awarded: %ch${karma}%cn`,
    `  Recipients: ${awarded.length === 0 ? "(none)" : awarded.join(", ")}`,
  ];
  u.send(lines.join("%r"));
}

// ── info ──────────────────────────────────────────────────────────────────────

async function infoRun(u: IUrsamuSDK, arg: string): Promise<void> {
  const run = await resolveRun(u, arg);
  if (!run) return;

  const lines = [
    `%ch  Run #${run.number}: ${run.name}%cn`,
    `  Status:  ${run.status}`,
    `  Created: ${new Date(run.createdAt).toISOString()} by ${run.createdByName}`,
    `  Summary: ${run.summary}`,
    `  Base Karma: ${run.baseKarmaAward}`,
    `  Roster: ${run.roster.map((e) => e.playerName).join(", ") || "(none)"}`,
  ];

  if (run.awardLog.length > 0) {
    lines.push(`%ch  Bonus Awards:%cn`);
    for (const a of run.awardLog) {
      lines.push(`    ${a.playerName}: +${a.delta} (${a.reason}) by ${a.awardedByName}`);
    }
  }

  u.send(lines.join("%r"));
}

// ── award ─────────────────────────────────────────────────────────────────────

async function awardRun(u: IUrsamuSDK, arg: string): Promise<void> {
  if (!isAdmin(u)) { u.send("Only staff can award bonus karma."); return; }

  // Format: "<run#> <player>=<karma> <reason>"
  const spaceIdx = arg.indexOf(" ");
  if (spaceIdx === -1) { u.send("Usage: +run/award <run#> <player>=<karma> <reason>"); return; }

  const numStr = arg.slice(0, spaceIdx).trim();
  const rest   = arg.slice(spaceIdx + 1).trim();
  const num    = parseInt(numStr, 10);
  if (isNaN(num) || num < 1) { u.send("Invalid run number."); return; }

  const eqIdx = rest.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +run/award <run#> <player>=<karma> <reason>"); return; }

  const playerArg = rest.slice(0, eqIdx).trim();
  const afterEq   = rest.slice(eqIdx + 1).trim();
  const spaceIdx2 = afterEq.indexOf(" ");
  if (spaceIdx2 === -1) { u.send("Usage: +run/award <run#> <player>=<karma> <reason>"); return; }

  const karmaStr = afterEq.slice(0, spaceIdx2).trim();
  const reason   = afterEq.slice(spaceIdx2 + 1).trim();
  const karma    = parseInt(karmaStr, 10);

  // L2 FIX: apply same upper cap as +karma/award so the run-award path cannot
  // bypass the karma ceiling enforced everywhere else in the system.
  const karmaErr = validateRunBonusKarma(karma);
  if (karmaErr) { u.send(karmaErr); return; }
  if (!reason) { u.send("Reason is required."); return; }

  const run = await getRun(num);
  if (!run) { u.send(`Run #${num} not found.`); return; }

  const rosterEntry = run.roster.find(
    (e) => e.playerName.toLowerCase() === playerArg.toLowerCase(),
  );
  if (!rosterEntry) {
    u.send(`${playerArg} is not on the roster for run #${num}.`);
    return;
  }

  const char = await getChar(rosterEntry.playerId);
  if (!char) { u.send(`${rosterEntry.playerName}'s character not found.`); return; }

  const staffName = u.me.name ?? "Unknown";
  const awardReason = `Run #${run.number} bonus: ${reason}`;

  rosterEntry.karmaAwarded += karma;

  const logEntry: IRunAwardEntry = {
    timestamp: Date.now(),
    playerId: rosterEntry.playerId,
    playerName: rosterEntry.playerName,
    delta: karma,
    reason,
    awardedByName: staffName,
  };
  run.awardLog.push(logEntry);

  await awardKarma(char, karma, awardReason, staffName);
  await saveRun(run);

  u.send(`Awarded %ch${karma}%cn karma to ${rosterEntry.playerName} on run #${num} (${reason}).`);
}

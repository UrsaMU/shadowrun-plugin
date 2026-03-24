// ─── +extend, +teamwork commands ─────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import {
  accumulateHits,
  extendedTestComplete,
  teamworkPool,
  maxAssistants,
  validateExtendedThreshold,
  validatePoolSize,
} from "./sr4/extended.ts";
import { appendRollLog } from "./rolllog-db.ts";

// ── +extend ───────────────────────────────────────────────────────────────────

addCmd({
  name: "+extend",
  pattern: /^\+extend\s+(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+extend <pool>/<threshold>[/<accumulated>]  — Roll one interval of an extended test.

  Rolls <pool> dice and adds hits to <accumulated> (default 0).
  Reports progress toward threshold. Keep rolling until threshold is met.

Examples:
  +extend 8/10           Start extended test: pool 8, threshold 10.
  +extend 8/10/3         Continue: 3 hits already accumulated, roll again.`,

  exec: async (u: IUrsamuSDK) => {
    const raw = u.util.stripSubs(u.cmd.args[0] ?? "").trim();

    const parts = raw.split("/");
    if (parts.length < 2) {
      u.send("Usage: %ch+extend <pool>/<threshold>[/<accumulated>]%cn");
      return;
    }

    const pool      = parseInt(parts[0].trim(), 10);
    const threshold = parseInt(parts[1].trim(), 10);
    const prev      = parts[2] ? parseInt(parts[2].trim(), 10) : 0;

    const poolErr = validatePoolSize(pool);
    if (poolErr) { u.send(poolErr); return; }

    const threshErr = validateExtendedThreshold(threshold);
    if (threshErr) { u.send(threshErr); return; }

    if (isNaN(prev) || prev < 0) { u.send("Accumulated hits must be a non-negative integer."); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const result      = rollPool(pool);
    const accumulated = accumulateHits(prev, result.hits);
    const complete    = extendedTestComplete(accumulated, threshold);
    const name        = u.util.displayName(u.me, u.me);

    const statusLine = complete
      ? `%cgComplete!%cn ${accumulated}/${threshold} hits — threshold met.`
      : `%cyIn progress%cn ${accumulated}/${threshold} hits — roll again.`;

    const msg = [
      `%ch${name}%cn rolls extended test (pool ${pool}, threshold ${threshold}):`,
      `  Dice: [${result.dice.join(", ")}] — Hits this roll: %ch${result.hits}%cn`,
      `  Accumulated: %ch${accumulated}%cn / ${threshold}  ${statusLine}`,
    ].join("%r");

    u.send(msg);
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold, success: complete,
    }).catch(() => {});
  },
});

// ── +teamwork ─────────────────────────────────────────────────────────────────

addCmd({
  name: "+teamwork",
  pattern: /^\+teamwork\s+(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+teamwork <primaryPool>/<threshold>[/<assistantHits>...]  — Roll a teamwork test.

  Each comma-separated value after the threshold is one assistant's hit contribution.
  Primary actor's effective pool = primaryPool + sum(assistantHits), capped at primaryPool × 2.

Examples:
  +teamwork 6/4/2,3        Primary pool 6, two assistants contributed 2 and 3 hits.
  +teamwork 8/6/1,1,2      Primary pool 8, three assistants contributed 1, 1, 2 hits.`,

  exec: async (u: IUrsamuSDK) => {
    const raw = u.util.stripSubs(u.cmd.args[0] ?? "").trim();

    const parts = raw.split("/");
    if (parts.length < 2) {
      u.send("Usage: %ch+teamwork <primaryPool>/<threshold>[/<assistantHits>...]%cn");
      return;
    }

    const primaryPool    = parseInt(parts[0].trim(), 10);
    const threshold      = parseInt(parts[1].trim(), 10);
    const assistantPart  = parts[2] ?? "";
    const assistantHits  = assistantPart
      ? assistantPart.split(",").map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n) && n >= 0)
      : [];

    const primaryPoolErr = validatePoolSize(primaryPool);
    if (primaryPoolErr) { u.send(primaryPoolErr); return; }

    const threshErr = validateExtendedThreshold(threshold);
    if (threshErr) { u.send(threshErr); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const effectivePool = teamworkPool(primaryPool, assistantHits);
    const result        = rollPool(effectivePool);
    const name          = u.util.displayName(u.me, u.me);
    const maxAsst       = maxAssistants(primaryPool);

    const outcome = result.hits >= threshold
      ? `%cgSuccess%cn (${result.hits} hits ≥ threshold ${threshold})`
      : `%crFailed%cn (${result.hits} hits < threshold ${threshold})`;

    const assistNote = assistantHits.length > 0
      ? ` + assistants [${assistantHits.join(", ")}] = effective pool %ch${effectivePool}%cn (cap: ${primaryPool * 2})`
      : "";

    const msg = [
      `%ch${name}%cn rolls teamwork test (threshold ${threshold}):`,
      `  Primary pool: %ch${primaryPool}%cn (max ${maxAsst} assistants)${assistNote}`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${outcome}`,
    ].join("%r");

    u.send(msg);
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool: effectivePool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold, success: result.hits >= threshold,
    }).catch(() => {});
  },
});

// ─── +roll command ────────────────────────────────────────────────────────────

import { addCmd, gameHooks } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { rollPool, rollEdge, validatePoolSize } from "./sr4/dice.ts";
import type { DiceResult } from "./sr4/dice.ts";
import { appendRollLog } from "./rolllog-db.ts";
import type { ISrRollEvent } from "./game-hooks-augment.ts";

addCmd({
  name: "+roll",
  pattern: /^\+roll(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+roll[/edge] <pool>[/<threshold>]  — Roll a Shadowrun dice pool.

Switches:
  /edge   Roll pool then reroll all non-hits once (Edge burn).

  <pool>       Number of d6s to roll. Minimum 1.
  <threshold>  Optional. Number of hits needed to succeed.
               Hits are dice showing 5 or 6.

  Glitch: half or more of your dice show 1s.
  Critical Glitch: glitch with zero hits.

Examples:
  +roll 8          Roll 8 dice, report hits.
  +roll 8/3        Roll 8 dice, succeed on 3+ hits.
  +roll/edge 8     Roll 8 dice, reroll non-hits once.
  +roll/edge 8/3   Edge roll vs threshold 3.`,
  exec: async (u: IUrsamuSDK) => {
    const sw      = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const rawArg  = u.util.stripSubs(u.cmd.args[1] ?? "").trim();
    const [poolStr, threshStr] = rawArg.split("/");
    const pool    = parseInt(poolStr, 10);
    const thresh  = threshStr ? parseInt(threshStr, 10) : null;

    const poolErr = validatePoolSize(pool);
    if (poolErr) {
      u.send(poolErr);
      return;
    }
    if (thresh !== null && (isNaN(thresh) || thresh < 1)) {
      u.send("Threshold must be a positive integer.");
      return;
    }

    const name = u.util.displayName(u.me, u.me);

    if (sw === "edge") {
      const result = rollEdge(pool);
      const lines = [
        `%ch${name}%cn rolls %ch${pool}%cn dice (Edge):`,
        `  Initial: ${formatDice(result.initial)}`,
        `  Reroll:  ${formatDice(result.reroll)}`,
        formatHits(result.totalHits, thresh),
        formatGlitch(result.initial),
      ].filter(Boolean);
      u.send(lines.join("%r"));
      u.here.broadcast(`${name} rolls ${pool} dice with Edge.`);
      // Fire-and-forget roll log — never blocks output
      appendRollLog({
        playerId: u.me.id, playerName: name, timestamp: Date.now(),
        pool, dice: [...result.initial.dice, ...result.reroll.dice],
        hits: result.totalHits, glitch: result.initial.glitch,
        critGlitch: result.initial.critGlitch, edgeUsed: true,
        threshold: thresh ?? undefined,
        success: thresh !== null ? result.totalHits >= thresh : undefined,
      }).catch(() => {});
      emitRollEvent(u, {
        pool, hits: result.totalHits,
        glitch: result.initial.glitch, critGlitch: result.initial.critGlitch,
        edgeUsed: true, threshold: thresh ?? undefined,
        success: thresh !== null ? result.totalHits >= thresh : undefined,
      });
      return;
    }

    if (sw && sw !== "") {
      u.send(`Unknown switch "/${sw}".`);
      return;
    }

    const result = rollPool(pool);
    const lines = [
      `%ch${name}%cn rolls %ch${pool}%cn dice: ${formatDice(result)}`,
      formatHits(result.hits, thresh),
      formatGlitch(result),
    ].filter(Boolean);
    u.send(lines.join("%r"));
    u.here.broadcast(`${name} rolls ${pool} dice.`);
    // Fire-and-forget roll log
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold: thresh ?? undefined,
      success: thresh !== null ? result.hits >= thresh : undefined,
    }).catch(() => {});
    emitRollEvent(u, {
      pool, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch,
      edgeUsed: false, threshold: thresh ?? undefined,
      success: thresh !== null ? result.hits >= thresh : undefined,
    });
  },
});

// ─── ai-gm bridge ─────────────────────────────────────────────────────────────

/**
 * Emit `shadowrun:roll` on the shared gameHooks bus so ai-gm can inject
 * the result into the current round context. Fire-and-forget — errors
 * are swallowed so a missing ai-gm installation never breaks +roll.
 */
function emitRollEvent(
  u: IUrsamuSDK,
  data: Omit<ISrRollEvent, "playerId" | "playerName" | "roomId">,
): void {
  const payload: ISrRollEvent = {
    playerId: u.me.id,
    playerName: u.util.displayName(u.me, u.me),
    roomId: u.here.id,
    ...data,
  };
  gameHooks.emit("shadowrun:roll" as never, payload as never).catch(() => {});
}

/** Format the dice array with color-coded hits and ones. */
function formatDice(r: DiceResult): string {
  return (
    "[" +
    r.dice.map((d) => {
      if (d >= 5) return `%cg%ch${d}%cn`;   // hit = green bold
      if (d === 1) return `%cr${d}%cn`;      // one = red
      return String(d);
    }).join(" ") +
    "]"
  );
}

/** Format the hit count line with optional threshold result. */
function formatHits(hits: number, thresh: number | null): string {
  const hitStr = `Hits: %ch${hits}%cn`;
  if (thresh === null) return `  ${hitStr}`;
  if (hits >= thresh) return `  ${hitStr}  %cg%chSUCCESS%cn (${hits - thresh} over threshold ${thresh})`;
  return `  ${hitStr}  %cr%chFAIL%cn (${thresh - hits} short of threshold ${thresh})`;
}

/** Format glitch/critical glitch warning, or empty string if none. */
function formatGlitch(r: DiceResult): string {
  if (r.critGlitch) return `  %cr%chCRITICAL GLITCH!%cn (${r.ones} ones, 0 hits)`;
  if (r.glitch)     return `  %crGLITCH%cn (${r.ones} of ${r.dice.length} dice showed 1s)`;
  return "";
}

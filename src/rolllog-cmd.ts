// ─── +rolllog command ──────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getRecentRolls, rolllogs } from "./rolllog-db.ts";
import type { IRollLogEntry } from "./rolllog-db.ts";

const DEFAULT_LIMIT = 20;

addCmd({
  name: "+rolllog",
  pattern: /^\+rolllog(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+rolllog[/<switch>] [<player>]  — View dice roll history.

Switches:
  /all   Show full roll history (not just recent 20).

  Without arguments, shows your last 20 rolls.
  Staff can view any player's roll log by providing a name.

Examples:
  +rolllog              Show your last 20 rolls.
  +rolllog/all          Show your full roll history.
  +rolllog Alice        Show Alice's last 20 rolls (staff only).`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const arg = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");

    if (sw === "" && arg) {
      // +rolllog <player> — staff only
      if (!isAdmin) { u.send("Only staff can view another player's roll log."); return; }
      const target = await u.util.target(u.me, arg, true);
      if (!target) { u.send(`Player "${arg}" not found.`); return; }
      const rolls = await getRecentRolls(target.id, DEFAULT_LIMIT);
      u.send(formatRollLog(rolls, target.name ?? arg, DEFAULT_LIMIT));
      return;
    }

    const limit = sw === "all" ? Infinity : DEFAULT_LIMIT;
    const rolls = await getRecentRolls(u.me.id, limit === Infinity ? 10_000 : limit);
    u.send(formatRollLog(rolls, u.me.name ?? "You", limit));
  },
});

// ── display ───────────────────────────────────────────────────────────────────

function formatRollLog(rolls: IRollLogEntry[], displayName: string, limit: number): string {
  const header = `%ch  Roll Log: ${displayName}%cn` +
    (limit !== Infinity ? ` (last ${limit})` : " (all)");

  if (rolls.length === 0) {
    return header + "%r  (no rolls recorded)";
  }

  const lines = [header];
  for (const r of rolls) {
    const date    = new Date(r.timestamp).toISOString().slice(0, 16).replace("T", " ");
    const diceStr = `[${r.dice.join(" ")}]`;
    const thStr   = r.threshold !== undefined ? `/${r.threshold}` : "";
    const result  = r.success !== undefined
      ? (r.success ? " %cg%chSUCCESS%cn" : " %cr%chFAIL%cn")
      : "";
    const glitch  = r.critGlitch ? " %cr%chCRIT GLITCH%cn" : r.glitch ? " %crGLITCH%cn" : "";
    const edge    = r.edgeUsed ? " %cy[EDGE]%cn" : "";
    lines.push(
      `  ${date}  ${r.pool}d${thStr}  ${diceStr}  hits:%ch${r.hits}%cn${result}${glitch}${edge}`,
    );
  }

  return lines.join("%r");
}

// ── export for tests ──────────────────────────────────────────────────────────

export { formatRollLog };
export type { IRollLogEntry };

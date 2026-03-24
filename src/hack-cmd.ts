// ─── +hack command ─────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import { HACK_ACTIONS, hackActionPool } from "./sr4/matrix.ts";
import type { HackAction } from "./sr4/matrix.ts";
import { appendRollLog } from "./rolllog-db.ts";

addCmd({
  name: "+hack",
  pattern: /^\+hack\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+hack <node>=<action>[/<threshold>]  — Perform a Matrix hacking action.

  Pool: Hacking or Computer + Logic (action-specific; see below).
  Threshold: optional; if omitted, result is just hits.

  Actions:
    probe    — Detect node; Hacking+Logic vs. Firewall
    access   — Gain account; Hacking+Logic vs. Firewall (extended)
    crash    — Crash a program; Cybercombat+Logic vs. rating+Firewall
    attack   — Cybercombat; Cybercombat+Logic vs. IC Pilot+Firewall
    spoof    — Fake command; Computer+Logic vs. Firewall
    trace    — Locate signal; Computer+Logic vs. Signal+Firewall
    edit     — Modify data; Computer+Logic vs. System+Firewall
    analyze  — Analyze node; Computer+Logic vs. System/2

Examples:
  +hack GridNode=probe         Roll Hacking+Logic to probe GridNode.
  +hack GridNode=access/4      Roll Hacking+Logic, threshold 4, extended test.
  +hack IC-7=attack            Roll Cybercombat+Logic to attack IC.`,

  exec: async (u: IUrsamuSDK) => {
    const raw = u.util.stripSubs(u.cmd.args[0] ?? "").trim();

    const eqIdx = raw.indexOf("=");
    if (eqIdx === -1) {
      u.send("Usage: %ch+hack <node>=<action>[/<threshold>]%cn");
      return;
    }

    const nodeName  = raw.slice(0, eqIdx).trim() || "node";
    const rest      = raw.slice(eqIdx + 1).trim();
    const slashIdx  = rest.indexOf("/");
    const actionStr = (slashIdx === -1 ? rest : rest.slice(0, slashIdx)).toLowerCase().trim();
    const threshold = slashIdx === -1 ? null : parseInt(rest.slice(slashIdx + 1).trim(), 10);

    if (!HACK_ACTIONS.includes(actionStr as HackAction)) {
      u.send(`Unknown action "${actionStr}". Valid: ${HACK_ACTIONS.join(", ")}`);
      return;
    }

    const char = await getChar(u.me.id);
    if (!char) { u.send("You have no character sheet."); return; }
    if (char.chargenState !== "approved") {
      u.send("Your character must be approved.");
      return;
    }

    const logic = char.attrs["Logic"] ?? 1;
    const action = actionStr as HackAction;

    // Pick the primary skill based on action
    const skillName = hackSkillName(action);
    const skill     = char.skills[skillName]?.rating ?? 0;
    const pool      = skill + logic;

    const result  = rollPool(pool);
    const name    = u.util.displayName(u.me, u.me);
    const poolDesc = hackActionPool(action);

    const thresholdLine = threshold !== null
      ? (result.hits >= threshold
          ? `  %cgSuccess%cn (${result.hits} hits ≥ threshold ${threshold})`
          : `  %crFailed%cn (${result.hits} hits < threshold ${threshold})`)
      : `  Hits: %ch${result.hits}%cn`;

    const msg = [
      `%ch${name}%cn hacks ${nodeName} [%ch${action}%cn]:`,
      `  Pool: %ch${pool}%cn (${skillName} ${skill} + Logic ${logic}) — ${poolDesc}`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      thresholdLine,
    ].join("%r");

    u.send(msg);
    u.here.broadcast(`${name} performs a Matrix action against ${nodeName}.`);

    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold: threshold ?? undefined,
      success: threshold !== null ? result.hits >= threshold : undefined,
    }).catch(() => {});
  },
});

function hackSkillName(action: HackAction): string {
  const map: Record<HackAction, string> = {
    probe:   "Hacking",
    access:  "Hacking",
    crash:   "Cybercombat",
    attack:  "Cybercombat",
    spoof:   "Computer",
    trace:   "Computer",
    edit:    "Computer",
    analyze: "Computer",
  };
  return map[action];
}

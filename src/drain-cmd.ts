// ─── +drain command ────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import { drainPool, calcDrainDv, isAwakened, effectiveMagic } from "./sr4/magic.ts";
import { appendRollLog } from "./rolllog-db.ts";

const MAX_FORCE = 12;

addCmd({
  name: "+drain",
  pattern: /^\+drain\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+drain <force>  — Roll drain resistance after casting a spell.

  Hermetic drain pool: Willpower + Logic
  Shaman   drain pool: Willpower + Charisma

  Drain DV = max(ceil(Force/2), 2).
  If Force > effective Magic attribute → damage is Physical; else Stun.
  Each hit on the drain roll reduces applied drain by 1.

Examples:
  +drain 6    Roll drain after casting a Force 6 spell.
  +drain 10   Roll drain after casting a Force 10 spell.`,

  exec: async (u: IUrsamuSDK) => {
    const raw   = u.util.stripSubs(u.cmd.args[0] ?? "").trim();
    const force = parseInt(raw, 10);

    if (isNaN(force) || force < 1 || force > MAX_FORCE) {
      u.send(`Force must be 1–${MAX_FORCE}.`);
      return;
    }

    const char = await getChar(u.me.id);
    if (!char) { u.send("You have no character sheet."); return; }
    if (char.chargenState !== "approved") {
      u.send("Your character must be approved before rolling drain.");
      return;
    }
    if (!isAwakened(char)) {
      u.send("Only Awakened characters roll drain.");
      return;
    }
    if (!char.tradition) {
      u.send("No tradition set. Use %ch+chargen/tradition%cn to set one.");
      return;
    }

    const pool   = drainPool(char);
    const magic  = effectiveMagic(char);
    const { dv, type } = calcDrainDv(force, magic);
    const result = rollPool(pool);

    const applied   = Math.max(0, dv - result.hits);
    const trackType = type === "physical" ? "Physical" : "Stun";
    const name      = u.util.displayName(u.me, u.me);

    const msg = [
      `%ch${name}%cn rolls drain (Force ${force}):`,
      `  Pool: %ch${pool}%cn dice (${char.tradition} — Willpower ${char.attrs["Willpower"] ?? 1}`,
      `  Drain DV: %ch${dv}%cn ${trackType} — Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  Applied drain: %ch${applied}%cn ${trackType}${applied === 0 ? " (fully resisted)" : ""}`,
    ].join("%r");

    u.send(msg);
    u.here.broadcast(`${name} resists drain: ${result.hits} hits, ${applied} ${trackType.toLowerCase()} drain applied.`);

    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch,
      edgeUsed: false,
    }).catch(() => {});
  },
});

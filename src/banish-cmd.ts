// ─── +banish command ───────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import { isAwakened, effectiveMagic } from "./sr4/magic.ts";
import { spiritBanishPool } from "./sr4/spirits.ts";
import { appendRollLog } from "./rolllog-db.ts";

const MAX_FORCE = 12;

addCmd({
  name: "+banish",
  pattern: /^\+banish\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+banish <spirit name or force>  — Roll banishing test against an active spirit.

  Pool: Banishing + Magic.
  Spirit resists with: Force × 2.
  Net hits determine the outcome (each hit reduces the spirit's services by 1).

Examples:
  +banish Air spirit    Banish the Air spirit in the scene.
  +banish 6             Banish an untracked Force 6 spirit.`,

  exec: async (u: IUrsamuSDK) => {
    const raw = u.util.stripSubs(u.cmd.args[0] ?? "").trim();
    if (!raw) { u.send("Usage: %ch+banish <spirit name or force>%cn"); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("You have no character sheet."); return; }
    if (char.chargenState !== "approved") {
      u.send("Your character must be approved.");
      return;
    }
    if (!isAwakened(char)) {
      u.send("Only Awakened characters can banish spirits.");
      return;
    }

    // Accept either a spirit name from the char's spirit list, or a raw Force number
    const forceDirect = parseInt(raw, 10);
    let force: number;
    let spiritLabel: string;
    let spiritIdx: number = -1;

    if (!isNaN(forceDirect) && forceDirect >= 1 && forceDirect <= MAX_FORCE) {
      force = forceDirect;
      spiritLabel = `Force ${force} spirit`;
    } else {
      const spirits = char.spirits ?? [];
      spiritIdx = spirits.findIndex(
        (s) => s.type.toLowerCase() === raw.toLowerCase() ||
               `${s.type} spirit`.toLowerCase() === raw.toLowerCase(),
      );
      if (spiritIdx === -1) {
        u.send(
          `No spirit named "${raw}" in your active list. Use %ch+summon/list%cn or provide a Force number.`,
        );
        return;
      }
      force = spirits[spiritIdx].force;
      spiritLabel = `${spirits[spiritIdx].type} spirit (Force ${force})`;
    }

    const magic     = effectiveMagic(char);
    const banSkill  = char.skills["Banishing"]?.rating ?? 0;
    const pool      = banSkill + magic;
    const spiritRes = spiritBanishPool(force);

    const attackRoll  = rollPool(pool);
    const defenceRoll = rollPool(spiritRes);
    const netHits     = Math.max(0, attackRoll.hits - defenceRoll.hits);

    const name = u.util.displayName(u.me, u.me);

    let outcome: string;
    if (netHits === 0) {
      outcome = "%crBanishing failed%cn — spirit resisted.";
    } else if (spiritIdx !== -1) {
      // Reduce services on tracked spirit
      const spirits     = [...(char.spirits ?? [])];
      const spirit      = spirits[spiritIdx];
      const newServices = Math.max(0, spirit.services - netHits);
      if (newServices === 0) {
        spirits.splice(spiritIdx, 1);
        outcome = `%cg${spirit.type} spirit banished!%cn (${netHits} net hits exceeded services).`;
      } else {
        spirits[spiritIdx] = { ...spirit, services: newServices };
        outcome = `Spirit weakened: %ch${netHits}%cn services removed (${newServices} remaining).`;
      }
      await saveChar({ ...char, spirits });
    } else {
      outcome = `%cg${netHits}%cn net hits — spirit driven off.`;
    }

    const msg = [
      `%ch${name}%cn attempts to banish ${spiritLabel}:`,
      `  Banishing pool: %ch${pool}%cn — Dice: [${attackRoll.dice.join(", ")}] — Hits: %ch${attackRoll.hits}%cn`,
      `  Spirit pool: %ch${spiritRes}%cn — Dice: [${defenceRoll.dice.join(", ")}] — Hits: %ch${defenceRoll.hits}%cn`,
      `  ${outcome}`,
    ].join("%r");

    u.send(msg);
    u.here.broadcast(`${name} attempts to banish a ${spiritLabel}.`);

    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: attackRoll.dice, hits: attackRoll.hits,
      glitch: attackRoll.glitch, critGlitch: attackRoll.critGlitch, edgeUsed: false,
    }).catch(() => {});
  },
});

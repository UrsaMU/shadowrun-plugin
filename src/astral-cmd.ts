// ─── +astral and +assense commands ────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import { isAwakened } from "./sr4/magic.ts";
import { appendRollLog } from "./rolllog-db.ts";

// ── +astral ────────────────────────────────────────────────────────────────────

addCmd({
  name: "+astral",
  pattern: /^\+astral\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+astral  — Toggle astral perception on or off.

  Awakened characters can shift to astral perception as a free action (SR4A p. 185).
  While astrally perceiving, you see magical auras and astral entities.
  Full astral projection (body left behind) is not mechanically tracked here.

Examples:
  +astral   Toggle astral perception.`,

  exec: async (u: IUrsamuSDK) => {
    const char = await getChar(u.me.id);
    if (!char) { u.send("You have no character sheet."); return; }
    if (char.chargenState !== "approved") {
      u.send("Your character must be approved.");
      return;
    }
    if (!isAwakened(char)) {
      u.send("Only Awakened characters can perceive astrally.");
      return;
    }

    const now = !char.astrally;
    await saveChar({ ...char, astrally: now });

    if (now) {
      u.send("You shift your perception into the astral plane. %cy[ASTRAL ACTIVE]%cn");
      u.here.broadcast(`${u.util.displayName(u.me, u.me)}'s eyes go distant as they slip into astral perception.`);
    } else {
      u.send("You return fully to the physical plane. %cg[ASTRAL OFF]%cn");
      u.here.broadcast(`${u.util.displayName(u.me, u.me)} blinks, returning from astral space.`);
    }
  },
});

// ── +assense ───────────────────────────────────────────────────────────────────

addCmd({
  name: "+assense",
  pattern: /^\+assense\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+assense <target>  — Roll assensing to read a target's magical aura.

  Pool: Assensing + Intuition (SR4A p. 186).
  Threshold: 1 hit for basic health/Essence; 3 hits for emotional state; 5 hits for magical signature.

Examples:
  +assense Alice    Read Alice's aura.
  +assense #5       Assense object #5.`,

  exec: async (u: IUrsamuSDK) => {
    const arg = u.util.stripSubs(u.cmd.args[0] ?? "").trim();

    const char = await getChar(u.me.id);
    if (!char) { u.send("You have no character sheet."); return; }
    if (char.chargenState !== "approved") {
      u.send("Your character must be approved.");
      return;
    }
    if (!isAwakened(char)) {
      u.send("Only Awakened characters can assense auras.");
      return;
    }

    const assSkill  = char.skills["Assensing"]?.rating ?? 0;
    const intuition = char.attrs["Intuition"] ?? 1;
    const pool      = assSkill + intuition;
    const result    = rollPool(pool);
    const name      = u.util.displayName(u.me, u.me);
    const targetStr = arg || "the area";

    const quality = result.hits >= 5
      ? "Deep read: health, Essence, magical signature, emotional state all visible."
      : result.hits >= 3
        ? "Clear read: health, Essence, and emotional state visible."
        : result.hits >= 1
          ? "Basic read: health and Essence visible."
          : "Insufficient hits — only vague impressions.";

    const msg = [
      `%ch${name}%cn assenses ${targetStr}:`,
      `  Pool: %ch${pool}%cn (Assensing ${assSkill} + Intuition ${intuition})`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${quality}`,
    ].join("%r");

    u.send(msg);
    u.here.broadcast(`${name} gazes into the astral, assensing ${targetStr}.`);

    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
    }).catch(() => {});
  },
});

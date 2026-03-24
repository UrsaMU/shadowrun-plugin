// ─── +damage command ──────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { physBoxes, stunBoxes, validateDamageInput } from "./sr4/dice.ts";
import type { IShadowrunChar } from "./types.ts";

addCmd({
  name: "+damage",
  pattern: /^\+damage(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+damage[/stun] <boxes>  — Apply damage to your condition monitor.

Switches:
  /stun   Apply stun damage instead of physical damage.

  <boxes>  Number of damage boxes to apply (positive integer).

  Physical damage track = ceil(Body/2) + 8 boxes.
  Stun damage track     = ceil(Willpower/2) + 8 boxes.
  When physical fills, overflow transfers to stun (1:1).
  When stun fills, the character is knocked unconscious.

Examples:
  +damage 3        Apply 3 boxes of physical damage.
  +damage/stun 4   Apply 4 boxes of stun damage.`,
  exec: async (u: IUrsamuSDK) => {
    const sw   = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw  = u.util.stripSubs(u.cmd.args[1] ?? "").trim();
    const dmg  = parseInt(raw, 10);

    const dmgErr = validateDamageInput(dmg);
    if (dmgErr) { u.send(dmgErr); return; }

    if (sw !== "" && sw !== "stun") {
      u.send(`Unknown switch "/${sw}". Use +damage or +damage/stun.`);
      return;
    }

    const char = await getChar(u.me.id);
    if (!char) { u.send("You have no character sheet. Use +chargen to create one."); return; }
    if (char.chargenState !== "approved") { u.send("Your character is not yet approved."); return; }

    const body = char.attrs["Body"] ?? 1;
    const will = char.attrs["Willpower"] ?? 1;
    const physMax = physBoxes(body);
    const stunMax = stunBoxes(will);

    if (sw === "stun") {
      applyStun(u, char, dmg, stunMax);
    } else {
      applyPhysical(u, char, dmg, physMax, stunMax);
    }

    await saveChar(char);
    u.send(formatMonitors(char, physMax, stunMax));
  },
});

function applyPhysical(
  u: IUrsamuSDK,
  char: IShadowrunChar,
  dmg: number,
  physMax: number,
  stunMax: number,
): void {
  // New physical wound resets the first-aid flag
  char.firstAidApplied = false;

  const physSpace = physMax - char.physicalDmg;
  if (dmg <= physSpace) {
    char.physicalDmg += dmg;
    return;
  }
  // Overflow physical → stun
  char.physicalDmg = physMax;
  const overflow = dmg - physSpace;
  char.stunDmg = Math.min(char.stunDmg + overflow, stunMax);
  u.send(`%cy${overflow} box(es) overflow to stun.%cn`);
}

function applyStun(
  _u: IUrsamuSDK,
  char: IShadowrunChar,
  dmg: number,
  stunMax: number,
): void {
  char.stunDmg = Math.min(char.stunDmg + dmg, stunMax);
}

function formatMonitors(
  char: IShadowrunChar,
  physMax: number,
  stunMax: number,
): string {
  const physBar = dmgBar(char.physicalDmg, physMax);
  const stunBar = dmgBar(char.stunDmg, stunMax);
  const physKo  = char.physicalDmg >= physMax ? " %cr%chINCAPACITATED%cn" : "";
  const stunKo  = char.stunDmg >= stunMax ? " %cy%chKNOCKED OUT%cn" : "";

  return [
    `%ch  CONDITION MONITORS%cn`,
    `  Physical: ${physBar} (${char.physicalDmg}/${physMax})${physKo}`,
    `  Stun:     ${stunBar} (${char.stunDmg}/${stunMax})${stunKo}`,
  ].join("%r");
}

function dmgBar(filled: number, total: number): string {
  return Array.from({ length: total }, (_, i) =>
    i < filled ? "%cr[X]%cn" : "[ ]",
  ).join("");
}

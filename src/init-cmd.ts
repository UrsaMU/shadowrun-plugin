// ─── +init command ─────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import {
  rollInitiative,
  rollInitiativeEdge,
  MAX_INIT_DICE,
  MAX_INIT_ATTR_SUM,
} from "./sr4/initiative.ts";
import type { InitResult } from "./sr4/initiative.ts";
import { appendRollLog } from "./rolllog-db.ts";

addCmd({
  name: "+init",
  pattern: /^\+init(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+init[/<switch>] [<args>]  — Roll initiative for your character.

Switches:
  /edge                   Burn Edge: reroll any die showing 1–4 once.
  /manual <attrSum>+<n>   Manual roll — skip sheet lookup.

  Initiative = Reaction + Intuition + 1d6 (SR4A p. 149).
  Characters with augmentation dice use +init/manual until gear tracking is added.
  Results are announced to the room but not saved.

Examples:
  +init                   Roll initiative from your approved character sheet.
  +init/edge              Roll initiative, burning Edge.
  +init/manual 9+2        Roll 2d6 and add 9 (e.g. Reaction 5 + Intuition 4).`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":       return await initFromSheet(u, false);
      case "edge":   return await initFromSheet(u, true);
      case "manual": return await initManual(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help init%cn.`);
    }
  },
});

// ── handlers ──────────────────────────────────────────────────────────────────

async function initFromSheet(u: IUrsamuSDK, useEdge: boolean): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) {
    u.send("You have no character sheet. Use +chargen to create one.");
    return;
  }
  if (char.chargenState !== "approved") {
    u.send("Your character must be approved before rolling initiative.");
    return;
  }

  const reaction  = char.attrs["Reaction"]  ?? 1;
  const intuition = char.attrs["Intuition"] ?? 1;
  const attrSum   = reaction + intuition;
  const extraDice = char.initDiceBonus ?? 0;

  const result = useEdge
    ? rollInitiativeEdge(attrSum)
    : rollInitiative(attrSum, 1 + extraDice);

  announceInit(u, result);
}

async function initManual(u: IUrsamuSDK, raw: string): Promise<void> {
  const plusIdx = raw.indexOf("+");
  if (plusIdx === -1) {
    u.send("Usage: +init/manual <attrSum>+<numDice>  (e.g. +init/manual 9+2)");
    return;
  }

  const attrSum = parseInt(raw.slice(0, plusIdx).trim(), 10);
  const numDice = parseInt(raw.slice(plusIdx + 1).trim(), 10);

  if (isNaN(attrSum) || attrSum < 1 || attrSum > MAX_INIT_ATTR_SUM) {
    u.send(`Attribute sum must be 1–${MAX_INIT_ATTR_SUM}.`);
    return;
  }
  if (isNaN(numDice) || numDice < 1 || numDice > MAX_INIT_DICE) {
    u.send(`Dice count must be 1–${MAX_INIT_DICE}.`);
    return;
  }

  const result = rollInitiative(attrSum, numDice);
  announceInit(u, result);
}

// ── helpers ───────────────────────────────────────────────────────────────────

function announceInit(u: IUrsamuSDK, result: InitResult): void {
  const name    = u.util.displayName(u.me, u.me);
  const diceStr = result.dice.join(", ");
  const edgeTag = result.edgeUsed ? " %cy[EDGE]%cn" : "";
  const msg     = `%ch${name}%cn rolls initiative: %ch${result.attrSum}%cn (attrs) + [${diceStr}] = %ch${result.total}%cn${edgeTag}`;
  u.send(msg);
  u.here.broadcast(`${name} rolls initiative: ${result.total}.`);
  // Fire-and-forget initiative log (pool = number of dice, hits = total score)
  appendRollLog({
    playerId: u.me.id, playerName: name, timestamp: Date.now(),
    pool: result.dice.length, dice: result.dice,
    hits: result.total, glitch: false, critGlitch: false,
    edgeUsed: result.edgeUsed,
  }).catch(() => {});
}

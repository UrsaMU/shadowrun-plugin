// ─── +summon command ───────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import type { ISpiritRecord } from "./types.ts";
import { getChar, saveChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import { drainPool, isAwakened, effectiveMagic } from "./sr4/magic.ts";
import {
  lookupSpiritType,
  isSpiritValidForTradition,
  summoningServices,
  summoningDrain,
  spiritsForTradition,
} from "./sr4/spirits.ts";
import type { Tradition } from "./sr4/spirits.ts";
import { appendRollLog } from "./rolllog-db.ts";

const MAX_FORCE = 12;

addCmd({
  name: "+summon",
  pattern: /^\+summon(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+summon[/<switch>] <type>=<force>  — Summon a spirit.

  Pool: Summoning + Magic (Summoning is the relevant active skill).
  Net hits above Force = services owed.
  Drain: Force − hits boxes Stun (resisted by drain pool from tradition).

Switches:
  /list    Show spirit types available for your tradition.

Examples:
  +summon Air=4        Summon an Air spirit at Force 4 (Hermetic).
  +summon Beasts=6     Summon a Beasts spirit at Force 6 (Shaman).
  +summon/list         Show all spirits available for your tradition.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    if (sw === "list") return await listSpirits(u);
    if (sw && sw !== "") {
      u.send(`Unknown switch "/${sw}". See %ch+help summon%cn.`);
      return;
    }

    await doSummon(u, raw);
  },
});

async function listSpirits(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (!isAwakened(char)) { u.send("Only Awakened characters can summon spirits."); return; }
  if (!char.tradition) { u.send("No tradition set. Use %ch+chargen/tradition%cn."); return; }

  const types = spiritsForTradition(char.tradition as Tradition);
  const lines = [
    `%ch  Spirit Types (${char.tradition}):%cn`,
    ...types.map((t) => `  ${t.name.padEnd(12)} Powers: ${t.powers.join(", ")}`),
  ];
  u.send(lines.join("%r"));
}

async function doSummon(u: IUrsamuSDK, raw: string): Promise<void> {
  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: %ch+summon <type>=<force>%cn");
    return;
  }

  const typeName = raw.slice(0, eqIdx).trim();
  const force    = parseInt(raw.slice(eqIdx + 1).trim(), 10);

  if (isNaN(force) || force < 1 || force > MAX_FORCE) {
    u.send(`Force must be 1–${MAX_FORCE}.`);
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState !== "approved") {
    u.send("Your character must be approved to summon spirits.");
    return;
  }
  if (!isAwakened(char)) {
    u.send("Only Awakened characters can summon spirits.");
    return;
  }
  if (!char.tradition) {
    u.send("No tradition set. Use %ch+chargen/tradition%cn.");
    return;
  }

  const spiritType = lookupSpiritType(typeName);
  if (!spiritType) {
    u.send(`Unknown spirit type "${typeName}". Use %ch+summon/list%cn.`);
    return;
  }

  if (!isSpiritValidForTradition(typeName, char.tradition as Tradition)) {
    const valid = spiritsForTradition(char.tradition as Tradition).map((s) => s.name).join(", ");
    u.send(`${char.tradition} mages cannot summon ${typeName} spirits. Valid types: ${valid}`);
    return;
  }

  const magic    = effectiveMagic(char);
  const summSkill = char.skills["Summoning"]?.rating ?? 0;
  const pool     = summSkill + magic;

  const result   = rollPool(pool);
  const services = summoningServices(result.hits, force);
  const drainDv  = summoningDrain(force, result.hits);
  const drainRes = drainPool(char);
  const drainRoll = rollPool(drainRes);
  const appliedDrain = Math.max(0, drainDv - drainRoll.hits);

  const name = u.util.displayName(u.me, u.me);

  // Record the spirit
  if (services > 0) {
    const spirit: ISpiritRecord = {
      id:          crypto.randomUUID(),
      type:        spiritType.name,
      force,
      services,
      bound:       false,
      summonedBy:  u.me.id,
      summonedAt:  Date.now(),
    };
    await saveChar({ ...char, spirits: [...(char.spirits ?? []), spirit] });
  }

  const spiritLine = services > 0
    ? `%ch${spiritType.name} spirit (Force ${force})%cn summoned with %ch${services}%cn service${services !== 1 ? "s" : ""}.`
    : `%crSummoning failed%cn — not enough hits (Force ${force} threshold).`;

  const msg = [
    `%ch${name}%cn summons a ${spiritType.name} spirit (Force ${force}):`,
    `  Summoning pool: %ch${pool}%cn — Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
    `  ${spiritLine}`,
    `  Drain: %ch${drainDv}%cn Stun — Drain pool: %ch${drainRes}%cn — Hits: %ch${drainRoll.hits}%cn — Applied: %ch${appliedDrain}%cn`,
  ].join("%r");

  u.send(msg);
  u.here.broadcast(`${name} summons a ${spiritType.name} spirit.`);

  appendRollLog({
    playerId: u.me.id, playerName: name, timestamp: Date.now(),
    pool, dice: result.dice, hits: result.hits,
    glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
  }).catch(() => {});
}

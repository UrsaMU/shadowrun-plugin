// ─── +toxin command ───────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import {
  TOXIN_CATALOGUE,
  DRUG_CATALOGUE,
  lookupToxin,
  lookupDrug,
  toxinDamage,
  toxinResistPoolFromChar,
  drugCrashDv,
} from "./sr4/toxins.ts";

addCmd({
  name: "+toxin",
  pattern: /^\+toxin(?:\/(list|resist|drug))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+toxin[/<switch>] [<args>]  — View toxins or roll resistance.

Switches:
  /list [drugs]    List toxins (or /list drugs for drug list).
  /resist <toxin>  Roll resistance using your character sheet attributes.
  /drug <name>     Show drug stats and crash DV.

Examples:
  +toxin/list               Show all toxins.
  +toxin/list drugs         Show all drugs.
  +toxin/resist Narcoject   Roll your Body against Narcoject.
  +toxin/drug Kamikaze      Show Kamikaze stats.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":
      case "list":   return showToxinList(u, raw);
      case "resist": return await rollToxinResist(u, raw);
      case "drug":   return showDrug(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help toxin%cn.`);
    }
  },
});

function showToxinList(u: IUrsamuSDK, filter: string): void {
  const isDrugs = filter.toLowerCase() === "drugs";
  const list    = isDrugs ? DRUG_CATALOGUE : TOXIN_CATALOGUE;
  const title   = isDrugs ? "DRUGS" : "TOXINS";
  const W       = 78;
  const hr      = "=".repeat(W);
  const div     = "-".repeat(W);

  const lines = [
    `%ch${hr}%cn`,
    `%ch  ${title}%cn`,
    `%ch${hr}%cn`,
    `  ${"Name".padEnd(24)} ${"Vector".padEnd(12)} ${"Pwr".padEnd(4)} Resist   Effect`,
    div,
  ];
  for (const t of list) {
    lines.push(
      `  ${t.name.padEnd(24)} ${t.vector.padEnd(12)} ${String(t.power).padEnd(4)} ` +
      `${t.resistAttr.padEnd(8)} ${t.effect}`,
    );
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

async function rollToxinResist(u: IUrsamuSDK, raw: string): Promise<void> {
  // H1 FIX: toxin name only — attrs come from character sheet, not user input
  const toxinName = raw.trim();
  if (!toxinName) {
    u.send("Usage: %ch+toxin/resist <toxin>%cn");
    return;
  }

  const toxin = lookupToxin(toxinName);
  if (!toxin) {
    u.send(`Unknown toxin "%ch${toxinName}%cn". See %ch+toxin/list%cn.`);
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  // H1 FIX: always read from char sheet — user cannot supply their own attrs
  const pool    = toxinResistPoolFromChar(toxin, char);
  const result  = rollPool(pool);
  const damage  = toxinDamage(toxin.power, result.hits);
  const name    = u.util.displayName(u.me, u.me);
  const attrVal = char.attrs[toxin.resistAttr] ?? 1;

  const outcome = damage === 0
    ? `%cgFully resisted%cn — no damage.`
    : `%cr${damage} ${toxin.effect} damage%cn penetrates.`;

  const msg = [
    `%ch${name}%cn resists %ch${toxin.name}%cn (Power ${toxin.power}, ${toxin.effect}):`,
    `  Pool: %ch${pool}%cn (${toxin.resistAttr} ${attrVal})`,
    `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
    `  ${outcome}`,
  ].join("%r");

  u.send(msg);

  // Apply damage to character if non-zero
  if (damage > 0) {
    const dmgField = toxin.effect === "physical" ? "physicalDmg" : "stunDmg";
    await saveChar({ ...char, [dmgField]: (char[dmgField] ?? 0) + damage });
  }
}

function showDrug(u: IUrsamuSDK, name: string): void {
  if (!name) { u.send("Usage: %ch+toxin/drug <name>%cn"); return; }

  const drug = lookupDrug(name);
  if (!drug) {
    u.send(`Unknown drug "%ch${name}%cn". See %ch+toxin/list drugs%cn.`);
    return;
  }

  const bonusStr = Object.entries(drug.bonus)
    .map(([k, v]) => `${k} +${v}`)
    .join(", ") || "(none)";

  const crashDv = drugCrashDv(drug.addictionRating);
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  ${drug.name.toUpperCase()}%cn`,
    `%ch${hr}%cn`,
    `  ${drug.description}`,
    div,
    `  Vector: ${drug.vector}   Speed: ${drug.speed}`,
    `  Bonuses: %ch${bonusStr}%cn   Duration: %ch${drug.duration} turns%cn`,
    `  Crash DV: %ch${crashDv} stun%cn   Addiction: threshold ${drug.addictionThreshold}, rating ${drug.addictionRating}`,
    `%ch${hr}%cn`,
  ];
  u.send(lines.join("%r"));
}

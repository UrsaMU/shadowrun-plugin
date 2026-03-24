// ─── Chargen attribute and skill setters ──────────────────────────────────────

import type { IUrsamuSDK } from "@ursamu/ursamu";
import { CHAR_ATTRS } from "../types.ts";
import { getChar, saveChar } from "../db.ts";
import { getMetatype, racialBaseAttrs, METATYPE_NAMES } from "../sr4/metatypes.ts";
import { resolveSkill } from "../sr4/skills.ts";
import { calcBP, BP_TOTAL, attrCost } from "./bp.ts";

/** +chargen/metatype <type> — Set metatype, resetting attrs to racial minimums. */
export async function setMetatype(u: IUrsamuSDK, arg: string): Promise<void> {
  const input = u.util.stripSubs(arg).trim();
  const meta = getMetatype(input);

  if (!meta) {
    const list = METATYPE_NAMES.join(", ");
    u.send(`Unknown metatype "%ch${input}%cn". Valid: ${list}.`);
    return;
  }

  const metatype = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  const existing = await getChar(u.me.id);

  if (existing?.chargenState !== "draft" && existing?.chargenState != null) {
    u.send("Your character is submitted or approved. Ask staff to reset it.");
    return;
  }

  const char = existing ?? {
    id: crypto.randomUUID(),
    playerId: u.me.id,
    playerName: u.me.name ?? "Unknown",
    metatype: "",
    attrs: {},
    skills: {},
    qualities: [],
    nuyen: 0,
    physicalDmg: 0,
    stunDmg: 0,
    chargenState: "draft" as const,
  };

  char.metatype = metatype;
  char.attrs = racialBaseAttrs(metatype);

  await saveChar(char);
  u.send(`%chMetatype set to ${metatype}.%cn Attributes reset to racial minimums. BP: ${calcBP(char)}/${BP_TOTAL}.`);
}

/** +chargen/attr <Attr>=<value> — Set an attribute value. */
export async function setAttr(u: IUrsamuSDK, arg: string): Promise<void> {
  const clean = u.util.stripSubs(arg).trim();
  const sep = clean.indexOf("=");
  if (sep === -1) { u.send("Usage: +chargen/attr <Attribute>=<value>"); return; }

  const attrRaw = clean.slice(0, sep).trim();
  const valRaw  = clean.slice(sep + 1).trim();
  const value   = parseInt(valRaw, 10);

  const attr = CHAR_ATTRS.find((a) => a.toLowerCase() === attrRaw.toLowerCase());
  if (!attr) {
    u.send(`Unknown attribute "${attrRaw}". Valid: ${CHAR_ATTRS.join(", ")}.`);
    return;
  }
  if (isNaN(value) || value < 1) { u.send("Attribute value must be a positive integer."); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("Set a metatype first with +chargen/metatype."); return; }
  if (char.chargenState !== "draft") { u.send("Character is locked. Ask staff to reset."); return; }

  const meta = getMetatype(char.metatype);
  if (!meta) {
    u.send(`Internal error: metatype "${char.metatype}" is invalid. Ask staff to reset your character.`);
    return;
  }
  const [min, max] = meta.attrs[attr];
  if (value < min || value > max) {
    u.send(`${attr} must be ${min}–${max} for ${char.metatype}. You entered ${value}.`);
    return;
  }

  const prev = char.attrs[attr] ?? min;
  char.attrs[attr] = value;
  const newBP = calcBP(char);
  if (newBP > BP_TOTAL) {
    char.attrs[attr] = prev; // rollback
    u.send(`Not enough BP. Setting ${attr} to ${value} would cost ${attrCost(char.metatype, attr, value)} BP (total: ${newBP}/${BP_TOTAL}).`);
    return;
  }

  await saveChar(char);
  u.send(`${attr} set to %ch${value}%cn. BP: ${newBP}/${BP_TOTAL}.`);
}

/** +chargen/skill <Skill>=<rating>[:<Spec>] — Buy an active skill. */
export async function setSkill(u: IUrsamuSDK, arg: string): Promise<void> {
  const clean = u.util.stripSubs(arg).trim();
  const sep = clean.indexOf("=");
  if (sep === -1) { u.send("Usage: +chargen/skill <Skill>=<rating>[:<Specialization>]"); return; }

  const skillRaw = clean.slice(0, sep).trim();
  const rest     = clean.slice(sep + 1).trim();
  const [ratingStr, ...specParts] = rest.split(":");
  const rating = parseInt(ratingStr, 10);
  const spec   = specParts.join(":").trim() || undefined;

  const skillName = resolveSkill(skillRaw);
  if (!skillName) { u.send(`"${skillRaw}" is not a valid SR4 active skill.`); return; }
  if (isNaN(rating) || rating < 1 || rating > 6) { u.send("Skill rating must be 1–6."); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("Set a metatype first with +chargen/metatype."); return; }
  if (char.chargenState !== "draft") { u.send("Character is locked. Ask staff to reset."); return; }

  const prev = char.skills[skillName];
  char.skills[skillName] = { rating, ...(spec ? { spec } : {}) };
  const newBP = calcBP(char);
  if (newBP > BP_TOTAL) {
    if (prev) char.skills[skillName] = prev; else delete char.skills[skillName]; // rollback
    u.send(`Not enough BP. Total would be ${newBP}/${BP_TOTAL}.`);
    return;
  }

  await saveChar(char);
  const specMsg = spec ? ` (${spec} specialization)` : "";
  u.send(`${skillName} set to rating %ch${rating}%cn${specMsg}. BP: ${newBP}/${BP_TOTAL}.`);
}

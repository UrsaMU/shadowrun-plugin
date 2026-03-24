// ─── Chargen magic helpers (tradition, spell purchase) ────────────────────────

import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "../db.ts";
import { lookupSpell } from "../sr4/spells.ts";
import { isAwakened } from "../sr4/magic.ts";

export const VALID_TRADITIONS = ["hermetic", "shaman"];

export async function setTradition(u: IUrsamuSDK, arg: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character yet. Use +chargen/metatype first."); return; }
  if (char.chargenState !== "draft") {
    u.send("Only draft characters can be edited.");
    return;
  }

  const raw = u.util.stripSubs(arg).trim().toLowerCase();
  if (!VALID_TRADITIONS.includes(raw)) {
    u.send(`Invalid tradition. Choose: Hermetic or Shaman.`);
    return;
  }

  if (!isAwakened(char)) {
    u.send("You must have the Magician or Mystic Adept quality to choose a tradition.");
    return;
  }

  const tradition = raw === "hermetic" ? "Hermetic" : "Shaman";
  await saveChar({ ...char, tradition });
  u.send(`Tradition set to %ch${tradition}%cn.`);
}

export async function addSpell(u: IUrsamuSDK, arg: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character yet."); return; }
  if (char.chargenState !== "draft") {
    u.send("Only draft characters can be edited.");
    return;
  }

  if (!isAwakened(char)) {
    u.send("You must have the Magician or Mystic Adept quality to learn spells.");
    return;
  }

  if (!char.tradition) {
    u.send("Set a tradition first: %ch+chargen/tradition Hermetic%cn or %ch+chargen/tradition Shaman%cn.");
    return;
  }

  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: %ch+chargen/spell <Spell Name>%cn"); return; }

  const entry = lookupSpell(name);
  if (!entry) {
    u.send(`Spell "${name}" not found. Use %ch+spells%cn to list available spells.`);
    return;
  }

  const existing = char.spells.find((s) => s.name.toLowerCase() === entry.name.toLowerCase());
  if (existing) {
    u.send(`You already know %ch${entry.name}%cn.`);
    return;
  }

  const updated = { ...char, spells: [...char.spells, {
    name: entry.name,
    category: entry.category,
    type: entry.type,
    range: entry.range,
    damage: entry.damage,
    dvBase: entry.dvBase,
    dvPerForce: entry.dvPerForce,
  }]};
  await saveChar(updated);
  u.send(`Added spell %ch${entry.name}%cn (${entry.category}, 3 BP).`);
}

export async function removeSpell(u: IUrsamuSDK, arg: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character yet."); return; }
  if (char.chargenState !== "draft") {
    u.send("Only draft characters can be edited.");
    return;
  }

  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: %ch+chargen/spell/remove <Spell Name>%cn"); return; }

  const idx = char.spells.findIndex((s) => s.name.toLowerCase() === name.toLowerCase());
  if (idx === -1) {
    u.send(`You don't know "${name}".`);
    return;
  }

  const removed = char.spells[idx];
  await saveChar({ ...char, spells: char.spells.filter((_, i) => i !== idx) });
  u.send(`Removed spell %ch${removed.name}%cn.`);
}

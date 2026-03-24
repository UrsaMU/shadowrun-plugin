// ─── Chargen quality and resource setters ─────────────────────────────────────

import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "../db.ts";
import { resolveQuality } from "../sr4/qualities.ts";
import { calcBP, BP_TOTAL, posQualBP, negQualBP, MAX_POSITIVE_QUALITY_BP, MAX_NEGATIVE_QUALITY_BP, MAX_NUYEN } from "./bp.ts";

/** +chargen/quality <name> — Add a positive or negative quality. */
export async function addQuality(u: IUrsamuSDK, arg: string): Promise<void> {
  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: +chargen/quality <Quality Name>"); return; }

  const def = resolveQuality(name);
  if (!def) { u.send(`"${name}" is not a recognised SR4 quality. Check +help chargen-qualities.`); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("Set a metatype first with +chargen/metatype."); return; }
  if (char.chargenState !== "draft") { u.send("Character is locked. Ask staff to reset."); return; }

  if (char.qualities.some((q) => q.name.toLowerCase() === def.name.toLowerCase())) {
    u.send(`You already have "${def.name}".`);
    return;
  }

  // Check quality BP limits before adding
  const projPosTotal = posQualBP(char) + (def.type === "positive" ? def.bp : 0);
  const projNegTotal = negQualBP(char) + (def.type === "negative" ? def.bp : 0);
  if (projPosTotal > MAX_POSITIVE_QUALITY_BP) {
    u.send(`Adding "${def.name}" would exceed the ${MAX_POSITIVE_QUALITY_BP} BP positive quality cap (${projPosTotal} BP).`);
    return;
  }
  if (projNegTotal > MAX_NEGATIVE_QUALITY_BP) {
    u.send(`Adding "${def.name}" would exceed the ${MAX_NEGATIVE_QUALITY_BP} BP negative quality cap (${projNegTotal} BP).`);
    return;
  }

  char.qualities.push({ name: def.name, bp: def.bp, type: def.type });
  const newBP = calcBP(char);
  if (newBP > BP_TOTAL) {
    char.qualities.pop(); // rollback
    u.send(`Not enough BP. Total would be ${newBP}/${BP_TOTAL}.`);
    return;
  }

  await saveChar(char);
  const sign = def.type === "positive" ? "+" : "−";
  const note = def.note ? ` %cy(${def.note})%cn` : "";
  u.send(`[${sign}] %ch${def.name}%cn added (${def.bp} BP).${note} Total BP: ${newBP}/${BP_TOTAL}.`);
}

/** +chargen/quality/remove <name> — Remove a quality from the draft. */
export async function removeQuality(u: IUrsamuSDK, arg: string): Promise<void> {
  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: +chargen/quality/remove <Quality Name>"); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character found."); return; }
  if (char.chargenState !== "draft") { u.send("Character is locked. Ask staff to reset."); return; }

  const idx = char.qualities.findIndex((q) => q.name.toLowerCase() === name.toLowerCase());
  if (idx === -1) { u.send(`You don't have "${name}" on your sheet.`); return; }

  const [removed] = char.qualities.splice(idx, 1);
  await saveChar(char);
  u.send(`%ch${removed.name}%cn removed. BP: ${calcBP(char)}/${BP_TOTAL}.`);
}

/** +chargen/resources <nuyen> — Set starting nuyen (1 BP per 5,000¥). */
export async function setResources(u: IUrsamuSDK, arg: string): Promise<void> {
  const clean = u.util.stripSubs(arg).replace(/[,_¥]/g, "").trim();
  const nuyen = parseInt(clean, 10);
  if (isNaN(nuyen) || nuyen < 0) { u.send("Usage: +chargen/resources <nuyen> (e.g. 50000)"); return; }
  if (nuyen > MAX_NUYEN) {
    u.send(`Maximum starting nuyen is ${MAX_NUYEN.toLocaleString()}¥ (50 BP).`);
    return;
  }
  if (nuyen % 5_000 !== 0) {
    u.send(`Nuyen must be a multiple of 5,000¥ (1 BP per 5,000¥).`);
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("Set a metatype first with +chargen/metatype."); return; }
  if (char.chargenState !== "draft") { u.send("Character is locked. Ask staff to reset."); return; }

  const prev = char.nuyen;
  char.nuyen = nuyen;
  const newBP = calcBP(char);
  if (newBP > BP_TOTAL) {
    char.nuyen = prev; // rollback
    u.send(`Not enough BP. Total would be ${newBP}/${BP_TOTAL}.`);
    return;
  }

  await saveChar(char);
  u.send(`Starting nuyen set to %ch${nuyen.toLocaleString()}¥%cn. BP: ${newBP}/${BP_TOTAL}.`);
}

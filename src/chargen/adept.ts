// ─── Chargen adept power helpers ──────────────────────────────────────────────

import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "../db.ts";
import { lookupAdeptPower, validateAddPower, isAdept } from "../sr4/adept.ts";

export async function addAdeptPower(u: IUrsamuSDK, arg: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character yet."); return; }
  if (char.chargenState !== "draft") {
    u.send("Only draft characters can be edited.");
    return;
  }

  if (!isAdept(char)) {
    u.send("You must have the Adept or Mystic Adept quality to purchase adept powers.");
    return;
  }

  // Support optional rating: "+chargen/power Improved Ability=3" or "+chargen/power Killing Hands"
  const raw = u.util.stripSubs(arg).trim();
  let powerName: string;
  let rating: number | undefined;

  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx !== -1) {
    powerName = raw.slice(0, eqIdx).trim();
    rating    = parseInt(raw.slice(eqIdx + 1).trim(), 10);
    if (isNaN(rating) || rating < 1) {
      u.send("Rating must be a positive integer (e.g. %ch+chargen/power Improved Ability=2%cn).");
      return;
    }
  } else {
    powerName = raw;
  }

  if (!powerName) { u.send("Usage: %ch+chargen/power <Power Name>[=<rating>]%cn"); return; }

  const entry = lookupAdeptPower(powerName);
  if (!entry) {
    u.send(`Power "${powerName}" not found. Use %ch+powers/list%cn to browse available powers.`);
    return;
  }

  // Non-leveled powers can only be taken once
  if (!entry.leveled) {
    const already = char.adeptPowers.find((p) => p.name.toLowerCase() === entry.name.toLowerCase());
    if (already) {
      u.send(`You already have %ch${entry.name}%cn.`);
      return;
    }
  }

  const effectiveRating = entry.leveled ? (rating ?? 1) : 1;
  const err = validateAddPower(char, entry, effectiveRating);
  if (err) { u.send(`%cr${err}%cn`); return; }

  const ppCost = +(entry.ppCost * (entry.leveled ? effectiveRating : 1)).toFixed(2);
  const power = { name: entry.name, ppCost, ...(entry.leveled ? { rating: effectiveRating } : {}) };
  await saveChar({ ...char, adeptPowers: [...char.adeptPowers, power] });
  u.send(`Added adept power %ch${entry.name}%cn${entry.leveled ? ` (rating ${effectiveRating})` : ""} — ${ppCost} PP.`);
}

export async function removeAdeptPower(u: IUrsamuSDK, arg: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character yet."); return; }
  if (char.chargenState !== "draft") {
    u.send("Only draft characters can be edited.");
    return;
  }

  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: %ch+chargen/power/remove <Power Name>%cn"); return; }

  const idx = char.adeptPowers.findIndex((p) => p.name.toLowerCase() === name.toLowerCase());
  if (idx === -1) {
    u.send(`You don't have "${name}".`);
    return;
  }

  const removed = char.adeptPowers[idx];
  await saveChar({ ...char, adeptPowers: char.adeptPowers.filter((_, i) => i !== idx) });
  u.send(`Removed %ch${removed.name}%cn (${removed.ppCost} PP refunded).`);
}

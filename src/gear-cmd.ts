// ─── +gear command ─────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import {
  validateGearName,
  validateQuantity,
  validateGearNote,
  catalogueStatsFor,
  recomputeArmorFromGear,
  recomputeRecoilCompFromGear,
} from "./sr4/gear.ts";
import { lookupGear, GEAR_CATALOGUE, MAX_CATALOG_UNFILTERED_ROWS, safeCatalogSlice } from "./sr4/gear-catalogue.ts";
import type { IGearItem } from "./types.ts";

addCmd({
  name: "+gear",
  pattern: /^\+gear(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+gear[/<switch>] [<args>]  — Manage your gear and equipment.

Switches:
  /add <Name>=<qty>        Add a gear item (auto-applies catalogue stats).
  /remove <Name>           Remove a gear item.
  /set <Name>=<qty>        Update quantity on an existing item.
  /note <Name>=<text>      Add or update a note on a gear item.
  /info <Name>             Show catalogue stats for a named item.
  /catalog [<category>]    Browse the gear catalogue.
  /view <player>           [Staff] View another player's gear.

Examples:
  +gear                              List your gear and armor totals.
  +gear/add Armor Jacket=1           Add armor jacket (auto-sets armor).
  +gear/add Ares Predator IV=1       Add a pistol.
  +gear/remove Armor Jacket          Remove item (armor totals update).
  +gear/info Lined Coat              Show stats for Lined Coat.
  +gear/catalog armor                Browse all armor items.
  +gear/set Stimulant Patch Rating 3=2
  +gear/note Ares Predator IV=Smartlinked, silencer attached.
  +gear/view Alice                   View Alice's gear (staff only).`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":        return await listGear(u);
      case "add":     return await addGear(u, raw);
      case "remove":  return await removeGear(u, raw);
      case "set":     return await setGear(u, raw);
      case "note":    return await noteGear(u, raw);
      case "info":    return showGearInfo(u, raw);
      case "catalog": return showCatalog(u, raw);
      case "view":    return await viewGear(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help gear%cn.`);
    }
  },
});

// ── helpers ───────────────────────────────────────────────────────────────────

function isAdmin(u: IUrsamuSDK): boolean {
  return u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
}

function findItem(gear: IGearItem[], name: string): number {
  return gear.findIndex((g) => g.name.toLowerCase() === name.toLowerCase());
}

/** Apply catalogue stats to char after gear list changes, then save. */
async function applyAndSave(u: IUrsamuSDK, char: Awaited<ReturnType<typeof getChar>>): Promise<void> {
  if (!char) return;
  const armor = recomputeArmorFromGear(char.gear);
  char.armorRating  = armor.ballistic;
  char.armorImpact  = armor.impact;
  char.recoilComp   = recomputeRecoilCompFromGear(char.gear);
  await saveChar(char);
}

// ── list ──────────────────────────────────────────────────────────────────────

async function listGear(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  const gear = char.gear ?? [];
  if (gear.length === 0) {
    u.send("You have no gear recorded. Use +gear/add to add items.");
    return;
  }

  const lines = [`%ch  GEAR (${gear.length} item${gear.length !== 1 ? "s" : ""})%cn`];
  for (const item of gear) {
    let statStr = "";
    if (item.ballistic !== undefined || item.impact !== undefined) {
      statStr += `  %cy[B${item.ballistic ?? 0}/I${item.impact ?? 0}]%cn`;
    }
    if (item.recoilComp) {
      statStr += `  %cy[RC+${item.recoilComp}]%cn`;
    }
    const noteStr = item.note ? `  %cg${item.note}%cn` : "";
    lines.push(`  ${item.name.padEnd(38)} ×${item.quantity}${statStr}${noteStr}`);
  }

  // ── Totals ──
  lines.push("%ch  ───────────────────────────────────────────────────────%cn");
  lines.push(`  Armor: %chB${char.armorRating ?? 0} / I${char.armorImpact ?? 0}%cn    Recoil Comp: %ch${char.recoilComp ?? 0}%cn`);

  u.send(lines.join("%r"));
}

// ── add ───────────────────────────────────────────────────────────────────────

async function addGear(u: IUrsamuSDK, raw: string): Promise<void> {
  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) { u.send("Usage: +gear/add <Name>=<qty>"); return; }

  const name   = raw.slice(0, eqIdx).trim();
  const qtyStr = raw.slice(eqIdx + 1).trim();
  const qty    = parseInt(qtyStr, 10);

  const nameErr = validateGearName(name);
  if (nameErr) { u.send(nameErr); return; }
  const qtyErr = validateQuantity(qty);
  if (qtyErr) { u.send(qtyErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  if (findItem(char.gear, name) !== -1) {
    u.send(`"${name}" already exists. Use +gear/set to change the quantity.`);
    return;
  }

  const stats = catalogueStatsFor(name);
  const item: IGearItem = { name, quantity: qty, ...stats };
  char.gear.push(item);

  await applyAndSave(u, char);

  // Build feedback line
  let feedback = `Added: ${name} ×${qty}`;
  if (stats.ballistic !== undefined || stats.impact !== undefined) {
    feedback += `  %cy(B${stats.ballistic ?? 0}/I${stats.impact ?? 0} → armor now B${char.armorRating}/I${char.armorImpact})%cn`;
  }
  if (stats.recoilComp) {
    feedback += `  %cy(RC+${stats.recoilComp} → total RC ${char.recoilComp})%cn`;
  }
  if (!stats.category) {
    feedback += `  %cy(not in catalogue — no stats applied)%cn`;
  }
  u.send(feedback);
}

// ── remove ────────────────────────────────────────────────────────────────────

async function removeGear(u: IUrsamuSDK, raw: string): Promise<void> {
  const name = raw.trim();
  if (!name) { u.send("Usage: +gear/remove <Name>"); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  const idx = findItem(char.gear, name);
  if (idx === -1) { u.send(`"${name}" not found in your gear.`); return; }

  const removed = char.gear.splice(idx, 1)[0];
  await applyAndSave(u, char);

  let feedback = `Removed: ${removed.name}`;
  if (removed.ballistic !== undefined || removed.impact !== undefined) {
    feedback += `  %cy(armor now B${char.armorRating}/I${char.armorImpact})%cn`;
  }
  u.send(feedback);
}

// ── set ───────────────────────────────────────────────────────────────────────

async function setGear(u: IUrsamuSDK, raw: string): Promise<void> {
  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) { u.send("Usage: +gear/set <Name>=<qty>"); return; }

  const name   = raw.slice(0, eqIdx).trim();
  const qtyStr = raw.slice(eqIdx + 1).trim();
  const qty    = parseInt(qtyStr, 10);

  const qtyErr = validateQuantity(qty);
  if (qtyErr) { u.send(qtyErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  const idx = findItem(char.gear, name);
  if (idx === -1) { u.send(`"${name}" not found. Use +gear/add to create it.`); return; }

  char.gear[idx].quantity = qty;
  await saveChar(char);
  u.send(`Updated: ${char.gear[idx].name} ×${qty}`);
}

// ── note ──────────────────────────────────────────────────────────────────────

async function noteGear(u: IUrsamuSDK, raw: string): Promise<void> {
  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +gear/note <Name>=<text>"); return; }

  const name = raw.slice(0, eqIdx).trim();
  const note = raw.slice(eqIdx + 1).trim();

  const noteErr = validateGearNote(note);
  if (noteErr) { u.send(noteErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  const idx = findItem(char.gear, name);
  if (idx === -1) { u.send(`"${name}" not found in your gear.`); return; }

  if (note) {
    char.gear[idx].note = note;
    u.send(`Note set on ${char.gear[idx].name}.`);
  } else {
    delete char.gear[idx].note;
    u.send(`Note removed from ${char.gear[idx].name}.`);
  }
  await saveChar(char);
}

// ── info ──────────────────────────────────────────────────────────────────────

function showGearInfo(u: IUrsamuSDK, raw: string): void {
  const name = raw.trim();
  if (!name) { u.send("Usage: +gear/info <Name>"); return; }

  const entry = lookupGear(name);
  if (!entry) {
    u.send(`"${name}" not found in the gear catalogue. Names are case-sensitive exact matches.`);
    return;
  }

  const lines = [
    `%ch${entry.name}%cn  [${entry.category}${entry.subcategory ? ` / ${entry.subcategory}` : ""}]`,
    `  Cost: %ch${entry.cost.toLocaleString()}¥%cn    Availability: %ch${entry.availability}%cn`,
  ];

  if (entry.ballistic  !== undefined) lines.push(`  Armor:  %chB${entry.ballistic} / I${entry.impact ?? 0}%cn`);
  if (entry.recoilComp !== undefined) lines.push(`  Recoil Comp: %ch+${entry.recoilComp}%cn`);
  if (entry.dv         !== undefined) {
    const apStr = entry.ap !== undefined ? `  AP ${entry.ap > 0 ? "+" : ""}${entry.ap}` : "";
    lines.push(`  DV: %ch${entry.dv}%cn${apStr}`);
  }
  if (entry.modes      !== undefined) lines.push(`  Modes: %ch${entry.modes}%cn    Ammo: %ch${entry.ammo ?? "—"}%cn`);
  if (entry.response   !== undefined) lines.push(`  Response: %ch${entry.response}%cn    Signal: %ch${entry.signal ?? "—"}%cn`);
  if (entry.firewall   !== undefined) lines.push(`  Firewall: %ch${entry.firewall}%cn    System: %ch${entry.system ?? "—"}%cn`);
  if (entry.description) lines.push(`  %cg${entry.description}%cn`);

  u.send(lines.join("%r"));
}

// ── catalog ───────────────────────────────────────────────────────────────────

function showCatalog(u: IUrsamuSDK, raw: string): void {
  const filter = raw.trim().toLowerCase();
  const matched = filter
    ? GEAR_CATALOGUE.filter((e) => e.category === filter || e.subcategory === filter)
    : GEAR_CATALOGUE;

  if (matched.length === 0) {
    u.send(`No gear found for category "${raw}". Try: armor, melee-weapon, ranged-weapon, ammo, commlink, drug, medical, survival, etc.`);
    return;
  }

  // Guard: without a filter the catalogue is 350+ items — truncate and warn.
  const list     = filter ? matched : safeCatalogSlice(matched);
  const truncated = !filter && matched.length > MAX_CATALOG_UNFILTERED_ROWS;

  const lines = [
    `%ch  GEAR CATALOGUE${filter ? ` — ${filter}` : ""} (showing ${list.length}${truncated ? ` of ${matched.length}` : ""})%cn`,
    `  ${"Name".padEnd(38)} ${"Cat".padEnd(16)} ${"Avail".padEnd(6)} Cost`,
  ];
  for (const e of list) {
    const costStr = e.cost.toLocaleString() + "¥";
    lines.push(`  ${e.name.padEnd(38)} ${e.category.padEnd(16)} ${String(e.availability).padEnd(6)} ${costStr}`);
  }
  if (truncated) {
    lines.push(`  %cy(${matched.length - list.length} more — use +gear/catalog <category> to filter)%cn`);
  }
  u.send(lines.join("%r"));
}

// ── view ──────────────────────────────────────────────────────────────────────

async function viewGear(u: IUrsamuSDK, raw: string): Promise<void> {
  if (!isAdmin(u)) { u.send("Only staff can view another player's gear."); return; }
  if (!raw) { u.send("Usage: +gear/view <player>"); return; }

  const target = await u.util.target(u.me, raw, true);
  if (!target) { u.send(`Player "${raw}" not found.`); return; }

  const char = await getChar(target.id);
  if (!char) { u.send(`${target.name ?? raw} has no character sheet.`); return; }

  const gear = char.gear ?? [];
  if (gear.length === 0) {
    u.send(`${target.name ?? raw} has no gear recorded.`);
    return;
  }

  const lines = [`%ch  GEAR: ${target.name ?? raw} (${gear.length} item${gear.length !== 1 ? "s" : ""})%cn`];
  for (const item of gear) {
    let statStr = "";
    if (item.ballistic !== undefined || item.impact !== undefined) {
      statStr += `  %cy[B${item.ballistic ?? 0}/I${item.impact ?? 0}]%cn`;
    }
    if (item.recoilComp) statStr += `  %cy[RC+${item.recoilComp}]%cn`;
    const noteStr = item.note ? `  %cg${item.note}%cn` : "";
    lines.push(`  ${item.name.padEnd(38)} ×${item.quantity}${statStr}${noteStr}`);
  }
  lines.push("%ch  ───────────────────────────────────────────────────────%cn");
  lines.push(`  Armor: %chB${char.armorRating ?? 0} / I${char.armorImpact ?? 0}%cn    Recoil Comp: %ch${char.recoilComp ?? 0}%cn`);
  u.send(lines.join("%r"));
}

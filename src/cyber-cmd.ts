// ─── +cyber command ────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import type { IImplant } from "./types.ts";
import { getChar, saveChar } from "./db.ts";
import {
  lookupImplant,
  calcEssence,
  initDiceFromImplants,
  gradeCostMultiplier,
  IMPLANT_CATALOGUE,
} from "./sr4/cyberware.ts";
import type { ImplantGrade } from "./sr4/cyberware.ts";

const VALID_GRADES: ImplantGrade[] = ["standard", "alpha", "beta", "delta", "cultured"];

addCmd({
  name: "+cyber",
  pattern: /^\+cyber(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+cyber[/<switch>] [<args>]  — View or manage cyberware and bioware implants.

Switches:
  /install <item>=<grade>   Staff: install an implant at the given grade.
  /remove <item>            Staff: remove an installed implant.
  /list                     Show available implants from the catalogue.

Grades: standard, alpha (×0.9), beta (×0.8), delta (×0.7), cultured (bioware ×0.9)

Examples:
  +cyber                              List your installed implants and current Essence.
  +cyber/list                         Show all available implants.
  +cyber/install Wired Reflexes 2=standard    Install Wired Reflexes 2 (staff only).
  +cyber/remove Wired Reflexes 2      Remove the implant (staff only).`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":         return await cyberList(u);
      case "list":     return showCatalogue(u);
      case "install":  return await cyberInstall(u, raw);
      case "remove":   return await cyberRemove(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help cyber%cn.`);
    }
  },
});

// ── handlers ──────────────────────────────────────────────────────────────────

async function cyberList(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) {
    u.send("You have no character sheet.");
    return;
  }
  u.send(formatCyberSheet(char.implants, char.essence));
}

function showCatalogue(u: IUrsamuSDK): void {
  const W = 78;
  const hr = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  IMPLANT CATALOGUE%cn`,
    `%ch${hr}%cn`,
    `  ${"Name".padEnd(34)} ${"Cat".padEnd(10)} ${"Essence".padEnd(8)} Description`,
    div,
  ];
  for (const e of IMPLANT_CATALOGUE) {
    lines.push(
      `  ${e.name.padEnd(34)} ${e.category.padEnd(10)} ${String(e.baseEssenceCost).padEnd(8)} ${e.description}`,
    );
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

async function cyberInstall(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can install implants."); return; }

  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: %ch+cyber/install <item>=<grade>%cn");
    return;
  }

  const itemName = raw.slice(0, eqIdx).trim();
  const gradeRaw = raw.slice(eqIdx + 1).trim().toLowerCase() as ImplantGrade;

  if (!VALID_GRADES.includes(gradeRaw)) {
    u.send(`Invalid grade "${gradeRaw}". Valid grades: ${VALID_GRADES.join(", ")}`);
    return;
  }

  const entry = lookupImplant(itemName);
  if (!entry) {
    u.send(`Implant "${itemName}" not found. Use %ch+cyber/list%cn to see available implants.`);
    return;
  }

  // Grade-category compatibility: delta only for cyberware
  if (gradeRaw === "delta" && entry.category === "bioware") {
    u.send("Bioware does not come in Delta grade. Valid grades: standard, cultured.");
    return;
  }
  if (gradeRaw === "cultured" && entry.category === "cyberware") {
    u.send("Cyberware does not come in Cultured grade. Valid grades: standard, alpha, beta, delta.");
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("Target has no character sheet."); return; }

  // Check for duplicate
  const existing = char.implants.find((i) => i.name.toLowerCase() === entry.name.toLowerCase());
  if (existing) {
    u.send(`${char.playerName} already has ${entry.name} (${existing.grade}).`);
    return;
  }

  const multiplier = gradeCostMultiplier(gradeRaw);
  const essenceCost = +(entry.baseEssenceCost * multiplier).toFixed(2);

  // Would this reduce Essence below 0?
  const newEssence = +(char.essence - essenceCost).toFixed(2);
  if (newEssence < 0) {
    u.send(
      `Cannot install ${entry.name}: would reduce Essence to ${newEssence.toFixed(2)} (current: ${char.essence.toFixed(2)}).`,
    );
    return;
  }

  const implant: IImplant = {
    name: entry.name,
    category: entry.category,
    grade: gradeRaw,
    essenceCost,
  };

  const updated = {
    ...char,
    implants: [...char.implants, implant],
  };
  updated.essence       = calcEssence(updated.implants);
  updated.initDiceBonus = initDiceFromImplants(updated.implants);

  await saveChar(updated);
  u.send(
    `%chInstalled ${entry.name}%cn (${gradeRaw}, Ess ${essenceCost.toFixed(2)}).` +
    ` Essence: %ch${updated.essence.toFixed(2)}%cn. Init dice bonus: %ch${updated.initDiceBonus}%cn.`,
  );
}

async function cyberRemove(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can remove implants."); return; }

  const itemName = raw.trim();
  if (!itemName) {
    u.send("Usage: %ch+cyber/remove <item name>%cn");
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet found."); return; }

  const idx = char.implants.findIndex((i) => i.name.toLowerCase() === itemName.toLowerCase());
  if (idx === -1) {
    u.send(`${char.playerName} does not have "${itemName}" installed.`);
    return;
  }

  const removed = char.implants[idx];
  const updated = {
    ...char,
    implants: char.implants.filter((_, i) => i !== idx),
  };
  updated.essence       = calcEssence(updated.implants);
  updated.initDiceBonus = initDiceFromImplants(updated.implants);

  await saveChar(updated);
  u.send(
    `%chRemoved ${removed.name}%cn (${removed.grade}).` +
    ` Essence restored to %ch${updated.essence.toFixed(2)}%cn.`,
  );
}

// ── formatting ────────────────────────────────────────────────────────────────

export function formatCyberSheet(implants: IImplant[], essence: number): string {
  const W = 78;
  const hr = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  CYBERWARE / BIOWARE%cn`,
    `%ch${hr}%cn`,
    `  Essence: %ch${essence.toFixed(2)}%cn / 6.00`,
    div,
  ];

  if (implants.length === 0) {
    lines.push("  (none installed)");
  } else {
    lines.push(`  ${"Name".padEnd(34)} ${"Grade".padEnd(10)} ${"Cat".padEnd(10)} Essence`);
    lines.push(div);
    for (const imp of implants) {
      const noteStr = imp.notes ? `  %cy${imp.notes}%cn` : "";
      lines.push(
        `  ${imp.name.padEnd(34)} ${imp.grade.padEnd(10)} ${imp.category.padEnd(10)} ${imp.essenceCost.toFixed(2)}${noteStr}`,
      );
    }
  }

  lines.push(`%ch${hr}%cn`);
  return lines.join("%r");
}

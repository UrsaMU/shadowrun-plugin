// ─── +powers command ───────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import {
  ADEPT_POWER_LIST,
  powerPointsUsed,
  powerPointsAvailable,
  isAdept,
} from "./sr4/adept.ts";

addCmd({
  name: "+powers",
  pattern: /^\+powers(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+powers[/<switch>]  — Display adept powers and power point balance.

Switches:
  /list    Show the full adept power catalogue.

Examples:
  +powers         View your adept powers and remaining PP.
  +powers/list    Browse all available adept powers.`,

  exec: async (u: IUrsamuSDK) => {
    const sw = (u.cmd.args[0] ?? "").toLowerCase().trim();

    switch (sw) {
      case "":     return await showPowers(u);
      case "list": return showCatalogue(u);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help powers%cn.`);
    }
  },
});

async function showPowers(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  if (!isAdept(char)) {
    u.send("Only Adept or Mystic Adept characters have adept powers.");
    return;
  }

  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const ppUsed  = powerPointsUsed(char.adeptPowers ?? []);
  const ppLeft  = powerPointsAvailable(char);
  const ppTotal = char.attrs["Magic"] ?? 0;

  const lines = [
    `%ch${hr}%cn`,
    `%ch  ADEPT POWERS%cn`,
    `%ch${hr}%cn`,
    `  Power Points: %ch${ppUsed.toFixed(2)}%cn used / %ch${ppTotal}%cn total (${ppLeft.toFixed(2)} remaining)`,
    div,
  ];

  const powers = char.adeptPowers ?? [];
  if (powers.length === 0) {
    lines.push("  (none purchased)");
  } else {
    for (const p of powers) {
      const ratingStr = p.rating !== undefined ? ` (rating ${p.rating})` : "";
      const noteStr   = p.notes ? `  %cy${p.notes}%cn` : "";
      lines.push(`  ${(p.name + ratingStr).padEnd(40)} %ch${p.ppCost.toFixed(2)}%cn PP${noteStr}`);
    }
  }

  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

function showCatalogue(u: IUrsamuSDK): void {
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  ADEPT POWER CATALOGUE%cn`,
    `%ch${hr}%cn`,
    `  ${"Name".padEnd(38)} ${"PP".padEnd(6)} Description`,
    div,
  ];

  for (const p of ADEPT_POWER_LIST) {
    const lvl = p.leveled ? ` (max ${p.maxRating ?? "?"})` : "";
    lines.push(`  ${(p.name + lvl).padEnd(38)} ${String(p.ppCost).padEnd(6)} ${p.description}`);
  }

  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

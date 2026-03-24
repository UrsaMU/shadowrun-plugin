// ─── +magic command ─────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import type { IShadowrunChar } from "./types.ts";
import { getChar } from "./db.ts";
import { drainPool, isAwakened, effectiveMagic } from "./sr4/magic.ts";
import { SPELL_CATALOGUE } from "./sr4/spells.ts";

addCmd({
  name: "+magic",
  pattern: /^\+magic(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+magic[/<switch>]  — Display your magic and spell information.

Switches:
  /spells    Show the full catalogue of available spells.

Examples:
  +magic          View your magic sheet section.
  +magic/spells   Browse all available spells.`,

  exec: async (u: IUrsamuSDK) => {
    const sw = (u.cmd.args[0] ?? "").toLowerCase().trim();

    switch (sw) {
      case "":       return await showMagicSheet(u);
      case "spells": return showSpellCatalogue(u);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help magic%cn.`);
    }
  },
});

async function showMagicSheet(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  u.send(formatMagicSection(char));
}

function showSpellCatalogue(u: IUrsamuSDK): void {
  const W = 78;
  const hr = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  SPELL CATALOGUE%cn`,
    `%ch${hr}%cn`,
    `  ${"Name".padEnd(24)} ${"Cat".padEnd(14)} ${"Type".padEnd(10)} ${"Range".padEnd(8)} Description`,
    div,
  ];

  let lastCat = "";
  for (const s of SPELL_CATALOGUE) {
    if (s.category !== lastCat) {
      if (lastCat) lines.push(div);
      lines.push(`%ch  ${s.category} Spells%cn`);
      lastCat = s.category;
    }
    const dmgTag = s.damage ? ` [${s.damage}]` : "";
    lines.push(
      `  ${s.name.padEnd(24)} ${s.category.padEnd(14)} ${(s.type + dmgTag).padEnd(10)} ${s.range.padEnd(8)} ${s.description}`,
    );
  }

  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

export function formatMagicSection(char: IShadowrunChar): string {
  const W = 78;
  const hr = "=".repeat(W);
  const div = "-".repeat(W);

  if (!isAwakened(char)) {
    return [
      `%ch${hr}%cn`,
      `%ch  MAGIC%cn`,
      `%ch${hr}%cn`,
      "  Not Awakened.",
      `%ch${hr}%cn`,
    ].join("%r");
  }

  const magic   = effectiveMagic(char);
  const pool    = drainPool(char);
  const essence = char.essence ?? 6;

  const lines = [
    `%ch${hr}%cn`,
    `%ch  MAGIC%cn`,
    `%ch${hr}%cn`,
    `  Tradition: %ch${char.tradition ?? "(none)"}%cn   Magic: %ch${magic}%cn   Essence: %ch${essence.toFixed(2)}%cn`,
    `  Drain Pool: %ch${pool}%cn (Willpower + ${char.tradition === "Hermetic" ? "Logic" : "Charisma"})`,
    div,
    `%ch  SPELLS (${char.spells.length})%cn`,
  ];

  if (char.spells.length === 0) {
    lines.push("  (none)");
  } else {
    for (const s of char.spells) {
      const dmgTag = s.damage ? ` %cr[${s.damage}]%cn` : "";
      lines.push(`  ${s.name.padEnd(24)} %cy${s.category}%cn  ${s.type}  ${s.range}${dmgTag}`);
    }
  }

  lines.push(`%ch${hr}%cn`);
  return lines.join("%r");
}

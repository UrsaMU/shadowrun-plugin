// ─── +sheet command ───────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import type { IShadowrunChar } from "./types.ts";
import { CHAR_ATTRS } from "./types.ts";
import { METATYPES } from "./sr4/metatypes.ts";
import { physBoxes, stunBoxes } from "./sr4/dice.ts";
import { getChar } from "./db.ts";
import { calcBP, BP_TOTAL } from "./chargen/bp.ts";
import { contactBP } from "./sr4/contacts.ts";
import { isAwakened, effectiveMagic, drainPool } from "./sr4/magic.ts";

addCmd({
  name: "+sheet",
  pattern: /^\+sheet(?:\s+(.+))?$/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+sheet [<player>]  — Display a Shadowrun character sheet.

Examples:
  +sheet            View your own character sheet.
  +sheet Alice      View Alice's character sheet (staff only for unapproved chars).`,
  exec: async (u: IUrsamuSDK) => {
    const arg = u.util.stripSubs(u.cmd.args[0] ?? "").trim();
    const isSelf = !arg;

    let char: IShadowrunChar | null;
    let displayTarget = u.me.name ?? "Unknown";

    if (isSelf) {
      char = await getChar(u.me.id);
    } else {
      const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
      const target = await u.util.target(u.me, arg, true);
      if (!target) { u.send(`Player "${arg}" not found.`); return; }
      char = await getChar(target.id);
      displayTarget = target.name ?? arg;
      if (char && char.chargenState !== "approved" && !isAdmin) {
        u.send(`${displayTarget}'s character is not yet approved.`);
        return;
      }
    }

    if (!char) {
      u.send(isSelf ? "You have no character yet. Use +chargen to start." : `${displayTarget} has no character sheet.`);
      return;
    }

    u.send(formatSheet(char, displayTarget));
  },
});

function formatSheet(char: IShadowrunChar, displayName: string): string {
  const W = 78;
  const hr = "=".repeat(W);
  const div = "-".repeat(W);
  const meta = METATYPES[char.metatype];
  const bp   = calcBP(char);
  const stateColor = char.chargenState === "approved" ? "%cg" : "%cy";

  const lines: string[] = [
    `%ch${hr}%cn`,
    `%ch  CHARACTER SHEET: ${displayName.toUpperCase()}%cn`,
    `%ch${hr}%cn`,
    `  Metatype: %ch${char.metatype}%cn`,
    `  Status:   ${stateColor}%ch${char.chargenState.toUpperCase()}%cn   BP: ${bp}/${BP_TOTAL}`,
  ];

  // Attributes
  lines.push(div, `%ch  ATTRIBUTES%cn`);
  for (let i = 0; i < CHAR_ATTRS.length; i += 3) {
    const row = CHAR_ATTRS.slice(i, i + 3).map((a) => {
      const val = char.attrs[a] ?? 1;
      const maxNat = meta?.attrs[a]?.[1] ?? 6;
      return `  ${a.padEnd(12)} %ch${String(val).padStart(2)}%cn/${maxNat}`;
    });
    lines.push(row.join("   "));
  }

  // Condition monitors
  const body = char.attrs["Body"] ?? 1;
  const will = char.attrs["Willpower"] ?? 1;
  const physMax = physBoxes(body);
  const stunMax = stunBoxes(will);
  lines.push(div, `%ch  CONDITION MONITORS%cn`);
  lines.push(`  Physical [BOD ${body}]: ${dmgBar(char.physicalDmg, physMax)}  (${char.physicalDmg}/${physMax})`);
  lines.push(`  Stun     [WIL ${will}]: ${dmgBar(char.stunDmg, stunMax)}  (${char.stunDmg}/${stunMax})`);

  // Skills
  lines.push(div, `%ch  ACTIVE SKILLS%cn`);
  const skillEntries = Object.entries(char.skills);
  if (skillEntries.length === 0) {
    lines.push("  (none purchased)");
  } else {
    for (const [name, s] of skillEntries) {
      const spec = s.spec ? ` %cy(${s.spec} +2)%cn` : "";
      lines.push(`  ${name.padEnd(28)} %ch${s.rating}%cn${spec}`);
    }
  }

  // Qualities
  lines.push(div, `%ch  QUALITIES%cn`);
  if (char.qualities.length === 0) {
    lines.push("  (none)");
  } else {
    for (const q of char.qualities) {
      const sign = q.type === "positive" ? "%cg[+]%cn" : "%cr[−]%cn";
      lines.push(`  ${sign} ${q.name}`);
    }
  }

  // Contacts
  const contacts = char.contacts ?? [];
  lines.push(div, `%ch  CONTACTS%cn`);
  if (contacts.length === 0) {
    lines.push("  (none)");
  } else {
    for (const c of contacts) {
      lines.push(
        `  ${c.name.padEnd(30)} Conn %ch${c.connection}%cn  Loy %ch${c.loyalty}%cn  [${contactBP(c)} BP]`,
      );
    }
  }

  // Karma
  lines.push(div, `%ch  KARMA%cn`);
  lines.push(`  Available: %ch${char.karmaAvailable ?? 0}%cn   Total Earned: %ch${char.karmaTotal ?? 0}%cn`);

  // Resources
  lines.push(div, `%ch  RESOURCES%cn`);
  lines.push(`  Nuyen: %ch${char.nuyen.toLocaleString()}¥%cn`);

  // Magic
  if (isAwakened(char)) {
    const magicVal = effectiveMagic(char);
    const drainP   = drainPool(char);
    lines.push(div, `%ch  MAGIC%cn`);
    lines.push(
      `  Tradition: %ch${char.tradition ?? "(none)"}%cn   Magic: %ch${magicVal}%cn   Drain Pool: %ch${drainP}%cn`,
    );
    const spells = char.spells ?? [];
    if (spells.length > 0) {
      lines.push(`  Spells: ${spells.map((s) => `%ch${s.name}%cn`).join(", ")}`);
    }
  }

  // Cyberware / Bioware
  const implants = char.implants ?? [];
  const essence  = char.essence  ?? 6;
  lines.push(div, `%ch  CYBERWARE / BIOWARE%cn`);
  lines.push(`  Essence: %ch${essence.toFixed(2)}%cn / 6.00`);
  if (implants.length > 0) {
    for (const imp of implants) {
      lines.push(`  ${imp.name.padEnd(34)} ${imp.grade.padEnd(10)} Ess ${imp.essenceCost.toFixed(2)}`);
    }
  }

  // Gear
  const gear = char.gear ?? [];
  lines.push(div, `%ch  GEAR%cn`);
  if (gear.length === 0) {
    lines.push("  (none)");
  } else {
    for (const item of gear) {
      const noteStr = item.note ? `  %cy${item.note}%cn` : "";
      lines.push(`  ${item.name.padEnd(38)} ×${item.quantity}${noteStr}`);
    }
  }

  lines.push(`%ch${hr}%cn`);

  return lines.join("%r");
}

function dmgBar(filled: number, total: number): string {
  return Array.from({ length: total }, (_, i) =>
    i < filled ? "%cr[X]%cn" : "[ ]",
  ).join("");
}

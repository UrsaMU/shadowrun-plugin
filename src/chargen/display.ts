// ─── Chargen draft display ─────────────────────────────────────────────────────

import type { IShadowrunChar } from "../types.ts";
import { CHAR_ATTRS } from "../types.ts";
import { METATYPES } from "../sr4/metatypes.ts";
import { calcBP, BP_TOTAL, posQualBP, negQualBP, nuYenBP } from "./bp.ts";
import { contactBP, contactsBP } from "../sr4/contacts.ts";

const W = 78;
const hr = "=".repeat(W);
const div = "-".repeat(W);

/** Format the full chargen draft status block for +chargen (no switch). */
export function formatDraft(char: IShadowrunChar): string {
  const meta = METATYPES[char.metatype] ?? null;
  const bp = calcBP(char);
  const remaining = BP_TOTAL - bp;
  const state = char.chargenState.toUpperCase();
  const stateColor = char.chargenState === "approved" ? "%cg" : "%cy";

  const lines: string[] = [
    `%ch${hr}%cn`,
    `%ch  SHADOWRUN CHARGEN — ${(char.playerName ?? "").toUpperCase()}  [${stateColor}${state}%cn%ch]%cn`,
    `%ch${hr}%cn`,
    `  Metatype: %ch${char.metatype || "(not set)"}%cn  (${meta?.bp ?? 0} BP)`,
    `  BP Spent: %ch${bp}%cn / ${BP_TOTAL}   Remaining: %ch${stateColor}${remaining >= 0 ? remaining : `−${Math.abs(remaining)}`}%cn`,
    div,
    `%ch  ATTRIBUTES%cn`,
  ];

  if (meta) {
    const attrPairs = [];
    for (let i = 0; i < CHAR_ATTRS.length; i += 3) {
      const row = CHAR_ATTRS.slice(i, i + 3).map((a) => {
        const val = char.attrs[a] ?? meta.attrs[a][0];
        const [min, max] = meta.attrs[a];
        return `  ${a.padEnd(10)} %ch${String(val).padStart(2)}%cn  [${min}–${max}]`;
      });
      attrPairs.push(row.join("   "));
    }
    lines.push(...attrPairs);
  } else {
    lines.push("  (set a metatype first with +chargen/metatype)");
  }

  lines.push(div, `%ch  ACTIVE SKILLS%cn`);
  const skillEntries = Object.entries(char.skills);
  if (skillEntries.length === 0) {
    lines.push("  (none)");
  } else {
    for (const [name, s] of skillEntries) {
      const spec = s.spec ? ` (${s.spec} +2)` : "";
      const cost = s.rating * 4 + (s.spec ? 2 : 0);
      lines.push(`  ${name.padEnd(28)}${String(s.rating).padStart(2)}${spec.padEnd(20)} [${cost} BP]`);
    }
  }

  lines.push(div, `%ch  QUALITIES%cn`);
  if (char.qualities.length === 0) {
    lines.push("  (none)");
  } else {
    for (const q of char.qualities) {
      const sign = q.type === "positive" ? "%cg[+]%cn" : "%cr[−]%cn";
      lines.push(`  ${sign} ${q.name.padEnd(30)} [${q.bp} BP]`);
    }
    lines.push(`  Positive: ${posQualBP(char)} BP  |  Negative refund: ${negQualBP(char)} BP`);
  }

  lines.push(div, `%ch  CONTACTS%cn`);
  const contacts = char.contacts ?? [];
  if (contacts.length === 0) {
    lines.push("  (none)");
  } else {
    for (const c of contacts) {
      lines.push(
        `  ${c.name.padEnd(30)} Conn %ch${c.connection}%cn  Loy %ch${c.loyalty}%cn  [${contactBP(c)} BP]`,
      );
    }
    lines.push(`  Total contacts BP: ${contactsBP(contacts)}`);
  }

  lines.push(div, `%ch  RESOURCES%cn`);
  lines.push(`  Starting Nuyen: %ch${char.nuyen.toLocaleString()}¥%cn  [${nuYenBP(char)} BP]`);
  lines.push(`%ch${hr}%cn`);

  return lines.join("%r");
}

/** Short prompt shown to a player who has no character record yet. */
export function newCharPrompt(): string {
  return [
    `%ch${"=".repeat(W)}%cn`,
    `%ch  SHADOWRUN CHARACTER GENERATION%cn`,
    `%ch${"=".repeat(W)}%cn`,
    `  You have %ch${BP_TOTAL}%cn Build Points to spend.`,
    ``,
    `  To begin, choose your metatype:`,
    `    %ch+chargen/metatype%cn <Human|Elf|Dwarf|Ork|Troll>`,
    ``,
    `  Then purchase attributes, skills, and qualities:`,
    `    %ch+chargen/attr%cn <Attribute>=<value>`,
    `    %ch+chargen/skill%cn <Skill>=<rating>[:<Specialization>]`,
    `    %ch+chargen/quality%cn <Quality>`,
    `    %ch+chargen/resources%cn <nuyen>`,
    ``,
    `  When finished:`,
    `    %ch+chargen/submit%cn`,
    `%ch${"=".repeat(W)}%cn`,
  ].join("%r");
}

// ─── +critter command ─────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { CRITTER_CATALOGUE, lookupCritter, critterCmBoxes } from "./sr4/critters.ts";

addCmd({
  name: "+critter",
  pattern: /^\+critter(?:\/(list|view))?\s*(.*)/i,
  lock: "connected admin+",
  category: "Shadowrun",
  help: `+critter[/<switch>] [<args>]  — [Staff] Browse critter and NPC stat blocks.

Switches:
  /list [<category>]   List all critters, optionally filtered by category.
  /view <Name>         Show full stat block for a critter.

Categories: mundane, paranormal, npc, spirit

Examples:
  +critter/list              Show all critters.
  +critter/list npc          Show only NPC entries.
  +critter/view Hellhound    Show full Hellhound stat block.`,

  exec: (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":
      case "list": return showCritterList(u, raw);
      case "view": return showCritterDetail(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help critter%cn.`);
    }
  },
});

function showCritterList(u: IUrsamuSDK, filter: string): void {
  const list = filter
    ? CRITTER_CATALOGUE.filter((c) => c.category === filter)
    : CRITTER_CATALOGUE;

  if (list.length === 0) {
    u.send(`No critters found for category "%ch${filter}%cn".`);
    return;
  }

  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  CRITTER CATALOGUE${filter ? ` — ${filter.toUpperCase()}` : ""}%cn`,
    `%ch${hr}%cn`,
    `  ${"Name".padEnd(28)} ${"Cat".padEnd(10)} Bod  Agi  Rea  Arm  CM`,
    div,
  ];

  for (const c of list) {
    lines.push(
      `  ${c.name.padEnd(28)} ${c.category.padEnd(10)} ` +
      `${String(c.attrs.Body).padEnd(4)} ${String(c.attrs.Agility).padEnd(4)} ` +
      `${String(c.attrs.Reaction).padEnd(4)} ${String(c.armor).padEnd(4)} ${c.physicalCM}`,
    );
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

function showCritterDetail(u: IUrsamuSDK, name: string): void {
  if (!name) { u.send("Usage: %ch+critter/view <name>%cn"); return; }

  const c = lookupCritter(name);
  if (!c) { u.send(`No critter named "%ch${name}%cn" found. See %ch+critter/list%cn.`); return; }

  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const cm  = critterCmBoxes(c.attrs.Body);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  ${c.name.toUpperCase()}%cn  [${c.category}]`,
    `%ch${hr}%cn`,
    `  ${c.description}`,
    div,
    `  Bod:${c.attrs.Body}  Agi:${c.attrs.Agility}  Rea:${c.attrs.Reaction}  Str:${c.attrs.Strength}  Cha:${c.attrs.Charisma}`,
    `  Int:${c.attrs.Intuition}  Log:${c.attrs.Logic}  Wil:${c.attrs.Willpower}  Edg:${c.attrs.Edge}`,
    div,
    `  Initiative: %ch${c.initiative}%cn   Armor: %ch${c.armor}%cn   CM: %ch${cm}%cn   Combat Pool: %ch${c.combatPool}%cn`,
    `%ch${hr}%cn`,
  ];
  u.send(lines.join("%r"));
}

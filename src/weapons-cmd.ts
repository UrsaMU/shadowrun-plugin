// ─── +weapons, +armor commands ────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import {
  WEAPON_CATALOGUE,
  ARMOR_CATALOGUE,
  lookupWeapon,
  lookupArmor,
} from "./sr4/weapons.ts";

// ── +weapons ──────────────────────────────────────────────────────────────────

addCmd({
  name: "+weapons",
  pattern: /^\+weapons(?:\/(list|view))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+weapons[/<switch>] [<args>]  — Browse the weapon database.

Switches:
  /list [<category>]   List weapons, optionally filtered by category.
  /view <Name>         Show full stat block for a weapon.

Categories: light pistol, heavy pistol, machine pistol, submachine gun,
            assault rifle, shotgun, sniper rifle, melee, throwing, heavy weapon

Examples:
  +weapons/list               Show all weapons.
  +weapons/list assault rifle Show only assault rifles.
  +weapons/view Ares Alpha    Show full stats for the Ares Alpha.`,

  exec: (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":
      case "list": return showWeaponList(u, raw);
      case "view": return showWeaponDetail(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help weapons%cn.`);
    }
  },
});

function showWeaponList(u: IUrsamuSDK, filter: string): void {
  const list = filter
    ? WEAPON_CATALOGUE.filter((w) => w.category === filter)
    : WEAPON_CATALOGUE;

  if (list.length === 0) {
    u.send(`No weapons found for category "%ch${filter}%cn".`);
    return;
  }

  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  WEAPONS${filter ? ` — ${filter.toUpperCase()}` : ""}%cn`,
    `%ch${hr}%cn`,
    `  ${"Name".padEnd(26)} ${"Cat".padEnd(16)} DV   Acc  Ammo  Avail  Cost`,
    div,
  ];

  for (const w of list) {
    lines.push(
      `  ${w.name.padEnd(26)} ${w.category.padEnd(16)} ${`${w.dv}${w.damageType}`.padEnd(4)} ` +
      `${String(w.accuracy).padEnd(4)} ${String(w.ammo).padEnd(5)} ${String(w.availability).padEnd(6)} ¥${w.cost.toLocaleString()}`,
    );
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

function showWeaponDetail(u: IUrsamuSDK, name: string): void {
  if (!name) { u.send("Usage: %ch+weapons/view <name>%cn"); return; }

  const w = lookupWeapon(name);
  if (!w) { u.send(`No weapon named "%ch${name}%cn". See %ch+weapons/list%cn.`); return; }

  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  ${w.name.toUpperCase()}%cn  [${w.category}]`,
    `%ch${hr}%cn`,
    `  ${w.description}`,
    div,
    `  DV: %ch${w.dv}${w.damageType}%cn   Accuracy: %ch${w.accuracy}%cn   Reach: %ch${w.reach}%cn`,
    `  Ammo: %ch${w.ammo || "N/A"}%cn   Recoil Comp: %ch${w.recoilComp}%cn`,
    `  Availability: %ch${w.availability}%cn   Cost: %ch¥${w.cost.toLocaleString()}%cn`,
    `%ch${hr}%cn`,
  ];
  u.send(lines.join("%r"));
}

// ── +armor ────────────────────────────────────────────────────────────────────

addCmd({
  name: "+armor",
  pattern: /^\+armor(?:\/(list|view))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+armor[/<switch>] [<args>]  — Browse the armor database.

Switches:
  /list        List all armor pieces.
  /view <Name> Show full stat block for an armor piece.

Examples:
  +armor/list             Show all armor.
  +armor/view Armor Jacket   Show Armor Jacket stats.`,

  exec: (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":
      case "list": return showArmorList(u);
      case "view": return showArmorDetail(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help armor%cn.`);
    }
  },
});

function showArmorList(u: IUrsamuSDK): void {
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  ARMOR CATALOGUE%cn`,
    `%ch${hr}%cn`,
    `  ${"Name".padEnd(32)} Bal  Imp  Avail  Cost`,
    div,
  ];
  for (const a of ARMOR_CATALOGUE) {
    lines.push(
      `  ${a.name.padEnd(32)} ${String(a.ballistic).padEnd(4)} ${String(a.impact).padEnd(4)} ` +
      `${String(a.availability).padEnd(6)} ¥${a.cost.toLocaleString()}`,
    );
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

function showArmorDetail(u: IUrsamuSDK, name: string): void {
  if (!name) { u.send("Usage: %ch+armor/view <name>%cn"); return; }

  const a = lookupArmor(name);
  if (!a) { u.send(`No armor named "%ch${name}%cn". See %ch+armor/list%cn.`); return; }

  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  ${a.name.toUpperCase()}%cn`,
    `%ch${hr}%cn`,
    `  ${a.description}`,
    div,
    `  Ballistic: %ch${a.ballistic}%cn   Impact: %ch${a.impact}%cn`,
    `  Availability: %ch${a.availability}%cn   Cost: %ch¥${a.cost.toLocaleString()}%cn`,
    `%ch${hr}%cn`,
  ];
  u.send(lines.join("%r"));
}

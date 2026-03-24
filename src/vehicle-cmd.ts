// ─── +vehicle, +pilot, +gunnery commands ──────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import type { IVehicle } from "./types.ts";
import { getChar, saveChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import {
  VEHICLE_CATALOGUE,
  lookupVehicle,
  vehicleCmBoxes,
  pilotPool,
  gunneryPool,
  hasControlRig,
  vehicleResistPool,
  validatePilotThreshold,
  validateVehicleDamage,
} from "./sr4/vehicles.ts";
import { appendRollLog } from "./rolllog-db.ts";

// ── +vehicle ───────────────────────────────────────────────────────────────────

addCmd({
  name: "+vehicle",
  pattern: /^\+vehicle(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+vehicle[/<switch>] [<args>]  — View or manage your vehicles and drones.

Switches:
  /add <Name>=<type>    [Staff] Register a vehicle (type: ground/air/water/drone).
  /remove <Name>        [Staff] Remove a vehicle from your list.
  /catalogue            Show available vehicle catalogue.
  /damage <Name>=<n>    [Staff] Apply n physical damage boxes to vehicle.

Examples:
  +vehicle                          List your vehicles.
  +vehicle/catalogue                Browse the vehicle catalogue.
  +vehicle/add Alice's Americar=ground   Register a custom Ford Americar.
  +vehicle/remove Alice's Americar  Remove it from the list.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":          return await listVehicles(u);
      case "catalogue": return showCatalogue(u);
      case "add":       return await addVehicle(u, raw);
      case "remove":    return await removeVehicle(u, raw);
      case "damage":    return await vehicleDamage(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help vehicle%cn.`);
    }
  },
});

async function listVehicles(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const vehicles = char.vehicles ?? [];
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [`%ch${hr}%cn`, `%ch  VEHICLES%cn`, `%ch${hr}%cn`];

  if (vehicles.length === 0) {
    lines.push("  (none)");
  } else {
    lines.push(`  ${"Name".padEnd(30)} ${"Type".padEnd(8)} Han/Acc/Spd  Bod/Arm  CM`);
    lines.push(div);
    for (const v of vehicles) {
      const cmMax = vehicleCmBoxes(v.body);
      lines.push(
        `  ${v.name.padEnd(30)} ${v.type.padEnd(8)} ${String(v.handling)}/${v.accel}/${v.speed}` +
        `       ${v.body}/${v.armor}    ${v.physicalDmg}/${cmMax}`,
      );
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
    `%ch${hr}%cn`, `%ch  VEHICLE CATALOGUE%cn`, `%ch${hr}%cn`,
    `  ${"Name".padEnd(30)} Type    H/A/S   Bod/Arm Sens`,
    div,
  ];
  for (const v of VEHICLE_CATALOGUE) {
    lines.push(
      `  ${v.name.padEnd(30)} ${v.type.padEnd(6)}  ${v.handling}/${v.accel}/${v.speed}` +
      `    ${v.body}/${v.armor}    ${v.sensor}  — ${v.description}`,
    );
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

async function addVehicle(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can add vehicles."); return; }

  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: %ch+vehicle/add <Name>=<type>%cn  (type: ground/air/water/drone)");
    return;
  }

  const name = raw.slice(0, eqIdx).trim();
  const type = raw.slice(eqIdx + 1).trim().toLowerCase() as IVehicle["type"];

  if (!["ground", "air", "water", "drone"].includes(type)) {
    u.send("Vehicle type must be: ground, air, water, or drone.");
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  // Try to find stats from catalogue
  const entry = lookupVehicle(name);
  const stats = entry ?? { handling: 3, accel: 2, speed: 3, pilot: 2, body: 8, armor: 3, sensor: 2 };

  const vehicle: IVehicle = {
    id:         crypto.randomUUID(),
    name,
    type,
    handling:   stats.handling,
    accel:      stats.accel,
    speed:      stats.speed,
    pilot:      stats.pilot,
    body:       stats.body,
    armor:      stats.armor,
    sensor:     stats.sensor,
    physicalDmg: 0,
    ownerId:    u.me.id,
  };

  await saveChar({ ...char, vehicles: [...(char.vehicles ?? []), vehicle] });
  u.send(`Vehicle %ch${name}%cn (${type}) added to your roster.`);
}

async function removeVehicle(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can remove vehicles."); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const idx = (char.vehicles ?? []).findIndex(
    (v) => v.name.toLowerCase() === raw.toLowerCase(),
  );
  if (idx === -1) { u.send(`No vehicle named "${raw}" found.`); return; }

  const removed = char.vehicles![idx];
  await saveChar({ ...char, vehicles: char.vehicles!.filter((_, i) => i !== idx) });
  u.send(`%ch${removed.name}%cn removed.`);
}

async function vehicleDamage(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can apply vehicle damage."); return; }

  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) { u.send("Usage: %ch+vehicle/damage <Name>=<n>%cn"); return; }

  const name = raw.slice(0, eqIdx).trim();
  const dmg  = parseInt(raw.slice(eqIdx + 1).trim(), 10);

  const dmgErr = validateVehicleDamage(dmg);
  if (dmgErr) { u.send(dmgErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const idx = (char.vehicles ?? []).findIndex(
    (v) => v.name.toLowerCase() === name.toLowerCase(),
  );
  if (idx === -1) { u.send(`No vehicle named "${name}" found.`); return; }

  const v      = char.vehicles![idx];
  const cmMax  = vehicleCmBoxes(v.body);
  const newDmg = Math.min(cmMax, Math.max(0, v.physicalDmg + dmg));
  const updated = [...char.vehicles!];
  updated[idx]  = { ...v, physicalDmg: newDmg };

  await saveChar({ ...char, vehicles: updated });
  u.send(`${v.name}: ${newDmg}/${cmMax} physical damage.`);
}

// ── +pilot ─────────────────────────────────────────────────────────────────────

addCmd({
  name: "+pilot",
  pattern: /^\+pilot\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+pilot <threshold>  — Roll a pilot test (Pilot skill + Reaction).

  Threshold 1–20, set by maneuver difficulty (staff adjudicates).

Examples:
  +pilot 3    Roll pilot, threshold 3 (moderate maneuver).
  +pilot 5    Roll pilot, threshold 5 (extreme maneuver).`,

  exec: async (u: IUrsamuSDK) => {
    const raw    = u.util.stripSubs(u.cmd.args[0] ?? "").trim();
    const thresh = parseInt(raw, 10);

    const threshErr = validatePilotThreshold(thresh);
    if (threshErr) { u.send(threshErr); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const pilotSkill = char.skills["Pilot Ground Vehicle"]?.rating
      ?? char.skills["Pilot Aircraft"]?.rating
      ?? char.skills["Pilot Watercraft"]?.rating
      ?? 0;
    const reaction  = char.attrs["Reaction"] ?? 1;
    const pool      = pilotPool(pilotSkill, reaction);
    const rigBonus  = hasControlRig(char.implants ?? []) ? 2 : 0;
    const finalPool = pool + rigBonus;

    const result = rollPool(finalPool);
    const name   = u.util.displayName(u.me, u.me);
    const rigTag = rigBonus > 0 ? " %cy[Control Rig +2]%cn" : "";

    const outcome = result.hits >= thresh
      ? `%cgSuccess%cn (${result.hits} hits ≥ threshold ${thresh})`
      : `%crFailed%cn (${result.hits} hits < threshold ${thresh})`;

    const msg = [
      `%ch${name}%cn rolls pilot (threshold ${thresh}):`,
      `  Pool: %ch${finalPool}%cn (Pilot ${pilotSkill} + Reaction ${reaction}${rigTag})`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${outcome}`,
    ].join("%r");

    u.send(msg);
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool: finalPool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold: thresh, success: result.hits >= thresh,
    }).catch(() => {});
  },
});

// ── +gunnery ───────────────────────────────────────────────────────────────────

addCmd({
  name: "+gunnery",
  pattern: /^\+gunnery\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+gunnery <threshold>  — Roll a gunnery test (Gunnery + Agility or Sensor).

  Pool: Gunnery + Agility (manual), or Gunnery + Sensor (drone).
  Threshold 1–20, set by target defense test or staff.

Examples:
  +gunnery 3    Roll gunnery, threshold 3.
  +gunnery 6    Roll gunnery, threshold 6 (high defense roll).`,

  exec: async (u: IUrsamuSDK) => {
    const raw    = u.util.stripSubs(u.cmd.args[0] ?? "").trim();
    const thresh = parseInt(raw, 10);

    const threshErr = validatePilotThreshold(thresh);
    if (threshErr) { u.send(threshErr); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const gunnerySkill = char.skills["Gunnery"]?.rating ?? 0;
    const agility      = char.attrs["Agility"] ?? 1;
    const pool         = gunneryPool(gunnerySkill, agility);
    const result       = rollPool(pool);
    const name         = u.util.displayName(u.me, u.me);

    const outcome = result.hits >= thresh
      ? `%cgHit%cn (${result.hits} hits ≥ threshold ${thresh})`
      : `%crMiss%cn (${result.hits} hits < threshold ${thresh})`;

    const msg = [
      `%ch${name}%cn rolls gunnery (threshold ${thresh}):`,
      `  Pool: %ch${pool}%cn (Gunnery ${gunnerySkill} + Agility ${agility})`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${outcome}`,
    ].join("%r");

    u.send(msg);
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold: thresh, success: result.hits >= thresh,
    }).catch(() => {});
  },
});

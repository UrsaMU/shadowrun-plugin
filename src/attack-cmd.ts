// ─── +attack command ───────────────────────────────────────────────────────────
//
// Resolves a Shadowrun 4E attack against another player character or NPC.
// The full dice chain: attack pool → defence pool → damage type → resist pool.
//
// Both parties roll live dice via rollPool(). Staff can use +attack/apply to
// manually apply a pre-resolved damage result without re-rolling.

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { rollPool, validateAttackPool } from "./sr4/dice.ts";
import {
  woundModifier, armorVsAP, damageType, resolveCombat,
  resistPool, formatCombatResult, validateCustomWeapon,
} from "./sr4/combat.ts";
import type { IWeaponProfile } from "./sr4/combat.ts";

// ── Built-in weapon shorthand table ──────────────────────────────────────────
// A small default set for common use. P6-I (weapon database) will expand this.
const WEAPONS: Record<string, IWeaponProfile> = {
  "predator":    { name: "Ares Predator IV",  dv: 5, ap: -1, damageCode: "P" },
  "pistol":      { name: "Light Pistol",       dv: 4, ap:  0, damageCode: "P" },
  "smg":         { name: "SMG",                dv: 6, ap:  0, damageCode: "P" },
  "rifle":       { name: "Assault Rifle",      dv: 9, ap: -2, damageCode: "P" },
  "shotgun":     { name: "Shotgun",            dv: 9, ap: -1, damageCode: "P" },
  "sniper":      { name: "Sniper Rifle",       dv: 10,ap: -6, damageCode: "P" },
  "sword":       { name: "Sword",              dv: 6, ap: -1, damageCode: "P" },
  "knife":       { name: "Knife",              dv: 3, ap: -1, damageCode: "P" },
  "unarmed":     { name: "Unarmed",            dv: 2, ap:  0, damageCode: "S" },
  "taser":       { name: "Taser",              dv: 6, ap: -5, damageCode: "S" },
  "stunbaton":   { name: "Stun Baton",         dv: 6, ap: -5, damageCode: "S" },
};

addCmd({
  name: "+attack",
  pattern: /^\+attack(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+attack[/<switch>] <target>=<weapon> [/<attackPool>]  — Resolve an attack.

Switches:
  /full   Target uses full defence (Reaction + Intuition + combat skill).
  /apply  Apply a pre-resolved damage number directly (admin/storyteller use).
  /armor  Set your armour rating: +attack/armor <ballistic>/<impact>
  /recoil Reset your accumulated recoil to 0.
  /wound  Show your current wound modifier.

  <weapon>     A weapon shorthand (predator, rifle, sword, unarmed, etc.)
               or a custom profile: <dv>/<ap>/<P|S>  e.g. 8/-2/P
  <attackPool> Optional override for the attack dice pool.
               Defaults to reading Agility from your character sheet.

Built-in shorthands: predator, pistol, smg, rifle, shotgun, sniper,
  sword, knife, unarmed, taser, stunbaton.

Examples:
  +attack Alice=predator           Attack Alice with an Ares Predator.
  +attack Alice=rifle/12           Attack with rifle, 12 attack dice.
  +attack/full Alice=sword         Alice uses full defence.
  +attack Alice=8/-2/P             Attack with custom weapon (DV 8, AP -2, Physical).
  +attack/armor 9/6                Set armour to Ballistic 9, Impact 6.
  +attack/wound                    Show your wound modifier.`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":      return await resolveAttack(u, raw, false);
      case "full":  return await resolveAttack(u, raw, true);
      case "apply": return await applyDamage(u, raw);
      case "armor": return await setArmor(u, raw);
      case "recoil":return await resetRecoil(u);
      case "wound": return await showWound(u);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help attack%cn.`);
    }
  },
});

// ── helpers ───────────────────────────────────────────────────────────────────

function parseWeapon(arg: string): IWeaponProfile | null {
  // Try shorthand lookup first
  const lower = arg.toLowerCase();
  if (WEAPONS[lower]) return WEAPONS[lower];

  // Try custom format: <dv>/<ap>/<P|S>
  const parts = arg.split("/");
  if (parts.length === 3) {
    const dv = parseInt(parts[0], 10);
    const ap = parseInt(parts[1], 10);
    const dc = parts[2].toUpperCase();
    if (!isNaN(dv) && !isNaN(ap) && (dc === "P" || dc === "S")) {
      // M2 FIX: validate DV/AP bounds before accepting custom weapon profile.
      const weapErr = validateCustomWeapon(dv, ap);
      if (weapErr) return null; // treated as unknown weapon → caller shows error
      return { name: `Custom (DV ${dv}, AP ${ap})`, dv, ap, damageCode: dc as "P" | "S" };
    }
  }
  return null;
}

// ── resolve attack ────────────────────────────────────────────────────────────

async function resolveAttack(u: IUrsamuSDK, raw: string, fullDefence: boolean): Promise<void> {
  // Format: "<target>=<weapon>[/<pool>]"
  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: +attack <target>=<weapon> [/<attackPool>]");
    return;
  }

  const targetArg  = raw.slice(0, eqIdx).trim();
  const weaponPart = raw.slice(eqIdx + 1).trim();

  // weapon part may have an optional pool override: "predator/12"
  const slashIdx  = weaponPart.indexOf("/");
  let weaponKey   = weaponPart;
  let poolOverride: number | null = null;

  if (slashIdx !== -1) {
    // Check if it's a custom DV/AP/code triplet (has two slashes)
    const slashCount = (weaponPart.match(/\//g) ?? []).length;
    if (slashCount >= 2) {
      // Custom weapon format — pass whole string
      weaponKey = weaponPart;
    } else {
      // weapon/pool override
      const maybePool = parseInt(weaponPart.slice(slashIdx + 1), 10);
      if (!isNaN(maybePool)) {
        // C2 FIX: validate pool override before use to prevent DoS via huge arrays.
        const poolErr = validateAttackPool(maybePool);
        if (poolErr) { u.send(poolErr); return; }
        weaponKey    = weaponPart.slice(0, slashIdx);
        poolOverride = maybePool;
      }
    }
  }

  const weapon = parseWeapon(weaponKey);
  if (!weapon) {
    u.send(`Unknown weapon "${weaponKey}". Use a shorthand or format <dv>/<ap>/<P|S>.`);
    return;
  }

  // Fetch attacker
  const attacker = await getChar(u.me.id);
  if (!attacker) { u.send("You have no character sheet."); return; }

  // Fetch defender
  const targetObj = await u.util.target(u.me, targetArg, true);
  if (!targetObj) { u.send(`Target "${targetArg}" not found.`); return; }

  const defender = await getChar(targetObj.id);
  if (!defender) {
    u.send(`${targetObj.name ?? targetArg} has no character sheet.`);
    return;
  }

  // Attack pool: Agility + wound modifier (or override)
  const attackerWound = woundModifier(attacker);
  const agility       = attacker.attrs["Agility"] ?? 1;
  const attackPool    = Math.max(1, (poolOverride ?? agility) + attackerWound);

  // Defence pool: Reaction + Intuition + wound modifier
  const defenderWound  = woundModifier(defender);
  const defReaction    = defender.attrs["Reaction"] ?? 1;
  const defIntuition   = defender.attrs["Intuition"] ?? 1;
  const defencePool    = Math.max(1, defReaction + defIntuition + defenderWound + (fullDefence ? 3 : 0));

  // Roll both pools
  const attackResult  = rollPool(attackPool);
  const defenceResult = rollPool(defencePool);

  // Determine armour type: firearms/projectile use ballistic; melee/stun use impact
  const isRanged      = !["sword", "knife", "unarmed", "stunbaton"].includes(weaponKey.toLowerCase());
  const armourRating  = isRanged ? (defender.armorRating ?? 0) : (defender.armorImpact ?? 0);

  const modArmour     = armorVsAP(armourRating, weapon.ap);
  const netHits       = Math.max(0, attackResult.hits - defenceResult.hits);
  const rawDV         = weapon.dv + netHits;
  const type          = damageType(rawDV, modArmour, weapon.damageCode);

  // Resistance pool and roll
  const defBody       = defender.attrs["Body"] ?? 1;
  const resistDice    = resistPool(defBody, modArmour, type);
  const resistResult  = rollPool(Math.max(1, resistDice));

  const combatResult  = resolveCombat(
    attackResult.hits,
    defenceResult.hits,
    weapon,
    armourRating,
    resistResult.hits,
  );

  const attackerName  = u.util.displayName(u.me, u.me);
  const defenderName  = u.util.displayName(targetObj, u.me);
  const output        = formatCombatResult(attackerName, defenderName, weapon, combatResult);

  // Apply damage to defender
  if (combatResult.appliedDV > 0) {
    if (type === "physical") {
      defender.physicalDmg += combatResult.appliedDV;
      defender.firstAidApplied = false;
    } else {
      defender.stunDmg += combatResult.appliedDV;
    }
    await saveChar(defender);
  }

  // Broadcast to room
  u.send(output);
  u.here.broadcast(
    `${attackerName} attacks ${defenderName} — ${combatResult.appliedDV} box${combatResult.appliedDV !== 1 ? "es" : ""} ${type}.`,
  );
}

// ── apply (admin direct damage) ───────────────────────────────────────────────

async function applyDamage(u: IUrsamuSDK, raw: string): Promise<void> {
  if (!u.me.flags.has("admin") && !u.me.flags.has("wizard") && !u.me.flags.has("superuser")) {
    u.send("Only staff can directly apply damage.");
    return;
  }

  // Format: "<target>=<boxes>/<P|S>"
  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +attack/apply <target>=<boxes>/<P|S>"); return; }

  const targetArg = raw.slice(0, eqIdx).trim();
  const rest      = raw.slice(eqIdx + 1).trim();
  const parts     = rest.split("/");
  if (parts.length !== 2) { u.send("Usage: +attack/apply <target>=<boxes>/<P|S>"); return; }

  const boxes = parseInt(parts[0], 10);
  const type  = parts[1].toUpperCase();

  if (isNaN(boxes) || boxes < 1 || boxes > 100) {
    u.send("Boxes must be 1–100.");
    return;
  }
  if (type !== "P" && type !== "S") {
    u.send("Damage type must be P (Physical) or S (Stun).");
    return;
  }

  const targetObj = await u.util.target(u.me, targetArg, true);
  if (!targetObj) { u.send(`Target "${targetArg}" not found.`); return; }

  const char = await getChar(targetObj.id);
  if (!char) { u.send(`${targetObj.name ?? targetArg} has no character sheet.`); return; }

  if (type === "P") {
    char.physicalDmg += boxes;
    char.firstAidApplied = false;
  } else {
    char.stunDmg += boxes;
  }
  await saveChar(char);

  const label = type === "P" ? "physical" : "stun";
  u.send(`Applied %ch${boxes}%cn ${label} damage to ${targetObj.name ?? targetArg}.`);
}

// ── armor ─────────────────────────────────────────────────────────────────────

async function setArmor(u: IUrsamuSDK, raw: string): Promise<void> {
  const parts = raw.split("/");
  if (parts.length !== 2) { u.send("Usage: +attack/armor <ballistic>/<impact>"); return; }

  const ballistic = parseInt(parts[0], 10);
  const impact    = parseInt(parts[1], 10);

  if (isNaN(ballistic) || ballistic < 0 || ballistic > 20) {
    u.send("Ballistic armour must be 0–20.");
    return;
  }
  if (isNaN(impact) || impact < 0 || impact > 20) {
    u.send("Impact armour must be 0–20.");
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  char.armorRating = ballistic;
  char.armorImpact = impact;
  await saveChar(char);
  u.send(`Armour set: Ballistic %ch${ballistic}%cn  Impact %ch${impact}%cn`);
}

// ── recoil reset ──────────────────────────────────────────────────────────────

async function resetRecoil(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  char.recoilAccum = 0;
  await saveChar(char);
  u.send("Recoil accumulation reset to 0.");
}

// ── wound modifier display ────────────────────────────────────────────────────

async function showWound(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  const mod = woundModifier(char);
  const total = (char.physicalDmg ?? 0) + (char.stunDmg ?? 0);
  u.send(
    `Wound modifier: %ch${mod}%cn  (${total} boxes filled: ${char.physicalDmg} physical + ${char.stunDmg} stun)`,
  );
}

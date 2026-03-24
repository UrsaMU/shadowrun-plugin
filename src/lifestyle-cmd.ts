// ─── +lifestyle, +rep commands ────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import {
  lifestyleCost,
  validateLifestyle,
  LIFESTYLE_TIERS,
  clampRep,
  type LifestyleTier,
} from "./sr4/reputation.ts";

// ── +lifestyle ────────────────────────────────────────────────────────────────

addCmd({
  name: "+lifestyle",
  pattern: /^\+lifestyle(?:\/(set|pay|view))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+lifestyle[/<switch>] [<args>]  — View or manage your lifestyle.

Switches:
  /set <tier>          Change your lifestyle tier (street/squatter/low/middle/high/luxury).
  /pay                 Deduct this month's lifestyle cost from your nuyen.
  /view <player>       [Staff] View another player's lifestyle.

Examples:
  +lifestyle               Show your current lifestyle and monthly cost.
  +lifestyle/set middle    Switch to Middle lifestyle (¥2,000/month).
  +lifestyle/pay           Pay this month's rent.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":     return await showLifestyle(u, u.me.id);
      case "set":  return await setLifestyle(u, raw);
      case "pay":  return await payLifestyle(u);
      case "view": return await viewLifestyle(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help lifestyle%cn.`);
    }
  },
});

async function showLifestyle(u: IUrsamuSDK, playerId: string): Promise<void> {
  const char = await getChar(playerId);
  if (!char) { u.send("No character sheet."); return; }

  const tier = (char.lifestyle ?? "low") as LifestyleTier;
  const cost = lifestyleCost(tier);
  u.send(
    `%chLifestyle:%cn ${capitalize(tier)}  |  Monthly cost: %ch¥${cost.toLocaleString()}%cn  |  Nuyen: %ch¥${(char.nuyen ?? 0).toLocaleString()}%cn`,
  );
}

async function setLifestyle(u: IUrsamuSDK, raw: string): Promise<void> {
  const tier = raw.toLowerCase();
  const err  = validateLifestyle(tier);
  if (err) { u.send(err); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

  const cost = lifestyleCost(tier as LifestyleTier);
  await saveChar({ ...char, lifestyle: tier as LifestyleTier });
  u.send(`Lifestyle set to %ch${capitalize(tier)}%cn (¥${cost.toLocaleString()}/month).`);
}

async function payLifestyle(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

  const tier = (char.lifestyle ?? "low") as LifestyleTier;
  const cost = lifestyleCost(tier);

  if ((char.nuyen ?? 0) < cost) {
    u.send(
      `Insufficient nuyen. %ch${capitalize(tier)}%cn costs ¥${cost.toLocaleString()}/month ` +
      `(you have ¥${(char.nuyen ?? 0).toLocaleString()}).`,
    );
    return;
  }

  const nuyenLog = [
    ...(char.nuyenLog ?? []),
    { timestamp: Date.now(), delta: -cost, counterparty: "Lifestyle", reason: `${capitalize(tier)} lifestyle monthly cost` },
  ];
  await saveChar({ ...char, nuyen: char.nuyen - cost, nuyenLog });
  u.send(`Paid ¥${cost.toLocaleString()} for %ch${capitalize(tier)}%cn lifestyle. Remaining: ¥${(char.nuyen - cost).toLocaleString()}.`);
}

async function viewLifestyle(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can view other players' lifestyle."); return; }
  if (!raw) { u.send("Usage: %ch+lifestyle/view <player>%cn"); return; }

  const target = await u.util.target(u.me, raw, true);
  if (!target) { u.send(`Player "${raw}" not found.`); return; }

  await showLifestyle(u, target.id);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── +rep ──────────────────────────────────────────────────────────────────────

addCmd({
  name: "+rep",
  pattern: /^\+rep(?:\/(set|add))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+rep[/<switch>] [<args>]  — View or adjust reputation stats.

Switches:
  /set <field>=<value>   [Staff] Set streetcred, notoriety, or public to a value.
  /add <field>=<delta>   [Staff] Add (or subtract) from a reputation field.

Fields: streetcred, notoriety, public

Examples:
  +rep                            View your reputation stats.
  +rep/set streetcred=5           [Staff] Set Street Cred to 5.
  +rep/add notoriety=1            [Staff] Add 1 Notoriety.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":    return await showRep(u);
      case "set": return await adjustRep(u, raw, false);
      case "add": return await adjustRep(u, raw, true);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help rep%cn.`);
    }
  },
});

async function showRep(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }
  const sc  = char.streetCred      ?? 0;
  const not = char.notoriety       ?? 0;
  const pa  = char.publicAwareness ?? 0;
  u.send(
    `%chReputation:%cn  Street Cred: %ch${sc}%cn  |  Notoriety: %ch${not}%cn  |  Public Awareness: %ch${pa}%cn`,
  );
}

async function adjustRep(u: IUrsamuSDK, raw: string, isAdd: boolean): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can adjust reputation."); return; }

  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: %ch+rep/set <field>=<value>%cn  (fields: streetcred, notoriety, public)");
    return;
  }

  const field = raw.slice(0, eqIdx).trim().toLowerCase();
  const val   = parseInt(raw.slice(eqIdx + 1).trim(), 10);

  if (isNaN(val)) { u.send("Value must be an integer."); return; }

  const fieldMap: Record<string, keyof { streetCred: number; notoriety: number; publicAwareness: number }> = {
    streetcred: "streetCred",
    notoriety:  "notoriety",
    public:     "publicAwareness",
  };
  const key = fieldMap[field];
  if (!key) {
    u.send("Unknown field. Use: streetcred, notoriety, or public.");
    return;
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const current = (char[key] as number) ?? 0;
  const newVal  = clampRep(isAdd ? current + val : val);
  await saveChar({ ...char, [key]: newVal });
  u.send(`%ch${field}%cn set to %ch${newVal}%cn.`);
}

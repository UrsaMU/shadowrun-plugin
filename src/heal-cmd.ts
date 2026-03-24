// ─── +heal command ─────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { physBoxes, stunBoxes, validateDamageInput } from "./sr4/dice.ts";
import { rollPool } from "./sr4/dice.ts";
import { stunRestTick, firstAidPool, longCarePool, applyHeal } from "./sr4/healing.ts";

addCmd({
  name: "+heal",
  pattern: /^\+heal(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+heal[/<switch>] [<args>]  — Manage healing for your character.

Switches:
  /rest               Apply one stun healing tick (attesting to adequate rest).
  /firstaid           Roll First Aid + Logic vs physical damage (once per wound).
  /longcare           Roll Medicine + Logic vs physical damage (repeatable).
  /apply <type>=<n>   [Staff] Directly heal N boxes (stun or physical).
  /reset              [Staff] Clear both condition monitors.

  Stun heals 1 box per max(1, 6−Body) hours of rest.
  First Aid can only be applied once until new physical damage is taken.
  Long-term care has no per-wound limit.

Examples:
  +heal               Show your current condition monitors.
  +heal/rest          Heal 1 stun box (you attest to adequate rest).
  +heal/firstaid      Roll First Aid + Logic.
  +heal/longcare      Roll Medicine + Logic.
  +heal/apply stun=3  [Staff] Heal 3 stun boxes.`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":          return await showHeal(u);
      case "rest":      return await healRest(u);
      case "firstaid":  return await healFirstAid(u);
      case "longcare":  return await healLongCare(u);
      case "apply":     return await healApply(u, raw);
      case "reset":     return await healReset(u);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help heal%cn.`);
    }
  },
});

// ── handlers ──────────────────────────────────────────────────────────────────

async function showHeal(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Your character is not yet approved."); return; }
  u.send(formatMonitors(char));
}

async function healRest(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Your character is not yet approved."); return; }

  if (char.stunDmg <= 0) {
    u.send("You have no stun damage to heal.");
    return;
  }

  const body = char.attrs["Body"] ?? 1;
  const { boxes, hoursPerBox } = stunRestTick(body);
  const { healed } = applyHeal(char, "stun", boxes);
  await saveChar(char);
  u.send(
    `You rest for ${hoursPerBox} hour(s) and recover %ch${healed}%cn stun box(es). ` +
    `(You attest to adequate rest.)%r` +
    formatMonitors(char),
  );
}

async function healFirstAid(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Your character is not yet approved."); return; }

  if (char.physicalDmg <= 0) {
    u.send("You have no physical damage to treat.");
    return;
  }
  if (char.firstAidApplied) {
    u.send("First aid has already been applied to your current wounds. Take new damage before applying again.");
    return;
  }

  const pool = firstAidPool(char);
  if (pool < 1) {
    u.send("You have no First Aid skill and no Logic to roll. Pool is 0.");
    return;
  }

  const result = rollPool(pool);
  const { healed } = applyHeal(char, "physical", result.hits);
  char.firstAidApplied = true;
  await saveChar(char);

  const hitStr = `${result.hits} hit(s)`;
  const healStr = healed > 0 ? `Healed %ch${healed}%cn physical box(es).` : "No boxes healed.";
  u.send(
    `First Aid + Logic (${pool} dice): ${hitStr}. ${healStr}%r` +
    formatMonitors(char),
  );
}

async function healLongCare(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Your character is not yet approved."); return; }

  if (char.physicalDmg <= 0) {
    u.send("You have no physical damage to treat.");
    return;
  }

  const pool = longCarePool(char);
  if (pool < 1) {
    u.send("You have no Medicine skill and no Logic to roll. Pool is 0.");
    return;
  }

  const result = rollPool(pool);
  const { healed } = applyHeal(char, "physical", result.hits);
  await saveChar(char);

  const hitStr  = `${result.hits} hit(s)`;
  const healStr = healed > 0 ? `Healed %ch${healed}%cn physical box(es).` : "No boxes healed.";
  u.send(
    `Medicine + Logic (${pool} dice): ${hitStr}. ${healStr}%r` +
    formatMonitors(char),
  );
}

async function healApply(u: IUrsamuSDK, raw: string): Promise<void> {
  if (!checkAdmin(u)) { u.send("Permission denied."); return; }

  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +heal/apply stun=<boxes>  or  +heal/apply physical=<boxes>"); return; }
  const typeStr = raw.slice(0, eqIdx).trim().toLowerCase();
  const boxes   = parseInt(raw.slice(eqIdx + 1).trim(), 10);

  if (typeStr !== "stun" && typeStr !== "physical") {
    u.send("Type must be \"stun\" or \"physical\"."); return;
  }
  const boxErr = validateDamageInput(boxes);
  if (boxErr) { u.send(boxErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  const { healed } = applyHeal(char, typeStr, boxes);
  await saveChar(char);
  u.send(`Healed %ch${healed}%cn ${typeStr} box(es).%r${formatMonitors(char)}`);
}

async function healReset(u: IUrsamuSDK): Promise<void> {
  if (!checkAdmin(u)) { u.send("Permission denied."); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  char.physicalDmg    = 0;
  char.stunDmg        = 0;
  char.firstAidApplied = false;
  await saveChar(char);
  u.send("Condition monitors cleared.%r" + formatMonitors(char));
}

// ── helpers ───────────────────────────────────────────────────────────────────

function checkAdmin(u: IUrsamuSDK): boolean {
  return u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
}

function formatMonitors(char: { physicalDmg: number; stunDmg: number; attrs: Record<string, number> }): string {
  const body    = char.attrs["Body"]      ?? 1;
  const will    = char.attrs["Willpower"] ?? 1;
  const physMax = physBoxes(body);
  const stunMax = stunBoxes(will);
  const physBar = dmgBar(char.physicalDmg, physMax);
  const stunBar = dmgBar(char.stunDmg, stunMax);
  const physKo  = char.physicalDmg >= physMax ? " %cr%chINCAPACITATED%cn" : "";
  const stunKo  = char.stunDmg >= stunMax ? " %cy%chKNOCKED OUT%cn" : "";
  return [
    `%ch  CONDITION MONITORS%cn`,
    `  Physical: ${physBar} (${char.physicalDmg}/${physMax})${physKo}`,
    `  Stun:     ${stunBar} (${char.stunDmg}/${stunMax})${stunKo}`,
  ].join("%r");
}

function dmgBar(filled: number, total: number): string {
  return Array.from({ length: total }, (_, i) => i < filled ? "%cr[X]%cn" : "[ ]").join("");
}

// ─── +karma command ────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import { awardKarma } from "./chargen/karma-ops.ts";
import { resolveSkill } from "./sr4/skills.ts";
import { resolveSkillGroup, skillsInGroup } from "./sr4/skillgroups.ts";
import {
  skillAdvanceCost, attrAdvanceCost, skillGroupAdvanceCost, SPEC_COST,
  MAX_KARMA_AWARD, MAX_KARMA_REASON_LEN,
  validateKarmaAdvanceSkill, validateKarmaAdvanceAttr,
  validateKarmaAdvanceSpec, validateKarmaAdvanceSkillGroup,
} from "./sr4/karma.ts";
import type { IKarmaLogEntry } from "./types.ts";

addCmd({
  name: "+karma",
  pattern: /^\+karma(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+karma[/<switch>] [<args>]  — View and spend karma for advancement.

Switches:
  /log [<player>]                     Show full karma log (staff: any player).
  /award <player>=<amount> <reason>   [Staff] Award karma to a player.
  /spend <amount>=<reason>            Free-spend karma (non-advancement).
  /advance/skill <Skill>=<newRating>  Raise an active skill rating.
  /advance/attr <Attr>=<newRating>    Raise an attribute.
  /advance/spec <Skill>:<Spec>        Buy a skill specialization (2 karma).
  /advance/skillgroup <Group>=<n>     Raise an intact skill group.

  Advancement costs (SR4A pp. 148–149):
    Skill +1 = newRating × 2 karma    Attribute +1 = newRating × 5 karma
    Specialization = 2 karma          Skill group +1 = newRating × 5 × skills karma

Examples:
  +karma                              View your karma pool and recent log.
  +karma/advance/skill Pistols=4      Raise Pistols to rating 4.
  +karma/advance/attr Agility=5       Raise Agility to 5.
  +karma/advance/spec Pistols:Semiautomatics  Buy a Pistols specialization.
  +karma/award Alice=5 Completed run  Award Alice 5 karma.`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    if (sw === "" || sw === "log")               return await showKarma(u, sw, raw);
    if (sw === "award")                          return await awardCmd(u, raw);
    if (sw === "spend")                          return await spendCmd(u, raw);
    if (sw === "advance/skill")                  return await advanceSkill(u, raw);
    if (sw === "advance/attr")                   return await advanceAttr(u, raw);
    if (sw === "advance/spec")                   return await advanceSpec(u, raw);
    if (sw === "advance/skillgroup")             return await advanceSkillGroup(u, raw);
    u.send(`Unknown switch "/${sw}". See %ch+help karma%cn.`);
  },
});

// ── handlers ──────────────────────────────────────────────────────────────────

async function showKarma(u: IUrsamuSDK, sw: string, raw: string): Promise<void> {
  const isAdmin = checkAdmin(u);
  let playerId = u.me.id;
  let label    = u.me.name ?? "You";

  if (sw === "log" && raw) {
    if (!isAdmin) { u.send("Permission denied."); return; }
    const target = await u.util.target(u.me, raw, true);
    if (!target) { u.send(`Player "${raw}" not found.`); return; }
    playerId = target.id;
    label    = target.name ?? raw;
  }

  const char = await getChar(playerId);
  if (!char) { u.send(`${label} has no character sheet.`); return; }

  const all      = char.karmaLog;
  const entries  = sw === "log" ? all : all.slice(-10);
  const W        = 78;
  const hr       = "=".repeat(W);
  const lines    = [
    `%ch${hr}%cn`,
    `%ch  KARMA: ${label.toUpperCase()}%cn`,
    `%ch${hr}%cn`,
    `  Available: %ch${char.karmaAvailable}%cn   Total Earned: %ch${char.karmaTotal}%cn`,
    `%ch${"-".repeat(W)}%cn`,
  ];

  if (entries.length === 0) {
    lines.push("  (no karma history)");
  } else {
    if (sw !== "log" && all.length > 10) {
      lines.push(`  (showing last 10 of ${all.length}; use +karma/log for full history)`);
    }
    for (const e of entries) {
      const sign  = e.delta >= 0 ? `%cg+${e.delta}%cn` : `%cr${e.delta}%cn`;
      const adv   = e.advancement ? ` [${e.advancement.type}: ${e.advancement.target}]` : "";
      const by    = e.awardedBy ? ` (by ${e.awardedBy})` : "";
      const date  = new Date(e.timestamp).toISOString().slice(0, 10);
      lines.push(`  ${date}  ${sign.padEnd(12)}  ${e.reason}${adv}${by}`);
    }
  }

  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

async function awardCmd(u: IUrsamuSDK, raw: string): Promise<void> {
  if (!checkAdmin(u)) { u.send("Permission denied."); return; }

  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +karma/award <player>=<amount> <reason>"); return; }
  const playerName = raw.slice(0, eqIdx).trim();
  const rest       = raw.slice(eqIdx + 1).trim();
  const spIdx      = rest.indexOf(" ");
  if (spIdx === -1) { u.send("Usage: +karma/award <player>=<amount> <reason>"); return; }
  const amount = parseInt(rest.slice(0, spIdx), 10);
  const reason = rest.slice(spIdx + 1).trim().slice(0, MAX_KARMA_REASON_LEN);

  if (isNaN(amount) || amount < 1 || amount > MAX_KARMA_AWARD) {
    u.send(`Amount must be 1–${MAX_KARMA_AWARD}.`); return;
  }
  if (!reason) { u.send("Reason cannot be empty."); return; }

  const target = await u.util.target(u.me, playerName, true);
  if (!target) { u.send(`Player "${playerName}" not found.`); return; }
  const char = await getChar(target.id);
  if (!char) { u.send(`${target.name ?? playerName} has no character sheet.`); return; }
  if (char.chargenState !== "approved") {
    u.send(`${target.name ?? playerName}'s character is not yet approved.`); return;
  }

  await awardKarma(char, amount, reason, u.me.name ?? "Staff");
  u.send(`Awarded %ch${amount}%cn karma to %ch${target.name ?? playerName}%cn. New pool: ${char.karmaAvailable}.`);
  u.send(`%ch${u.me.name ?? "Staff"}%cn has awarded you %ch${amount}%cn karma. (${reason})`, target.id);
}

async function spendCmd(u: IUrsamuSDK, raw: string): Promise<void> {
  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +karma/spend <amount>=<reason>"); return; }
  const amount = parseInt(raw.slice(0, eqIdx).trim(), 10);
  const reason = raw.slice(eqIdx + 1).trim().slice(0, MAX_KARMA_REASON_LEN);

  if (isNaN(amount) || amount < 1) { u.send("Amount must be a positive integer."); return; }
  if (!reason) { u.send("Reason cannot be empty."); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Your character is not yet approved."); return; }
  if (char.karmaAvailable < amount) {
    u.send(`Not enough karma. You have ${char.karmaAvailable}, need ${amount}.`); return;
  }

  await awardKarma(char, -amount, reason);
  u.send(`Spent %ch${amount}%cn karma. (${reason})  Remaining: %ch${char.karmaAvailable}%cn.`);
}

async function advanceSkill(u: IUrsamuSDK, raw: string): Promise<void> {
  const { name: input, rating: newRating } = parseNameRating(raw);
  if (!input || newRating === null) { u.send("Usage: +karma/advance/skill <Skill>=<newRating>"); return; }

  const skillName = resolveSkill(input);
  if (!skillName) { u.send(`Unknown skill "${input}". Check the SR4 skill list.`); return; }

  const char = await getApprovedChar(u);
  if (!char) return;

  const err = validateKarmaAdvanceSkill(char, skillName, newRating);
  if (err) { u.send(err); return; }

  const fromRating = char.skills[skillName]?.rating ?? 0;
  char.skills[skillName] = { ...(char.skills[skillName] ?? {}), rating: newRating };
  const cost = skillAdvanceCost(fromRating, newRating);
  await awardKarma(char, -cost, `Advanced ${skillName} ${fromRating}→${newRating}`, undefined, {
    type: "skill", target: skillName, fromRating, toRating: newRating,
  });
  u.send(`%ch${skillName}%cn raised to %ch${newRating}%cn. (−${cost} karma)  Remaining: %ch${char.karmaAvailable}%cn.`);
}

async function advanceAttr(u: IUrsamuSDK, raw: string): Promise<void> {
  const { name: attrName, rating: newRating } = parseNameRating(raw);
  if (!attrName || newRating === null) { u.send("Usage: +karma/advance/attr <Attr>=<newRating>"); return; }

  const char = await getApprovedChar(u);
  if (!char) return;

  const err = validateKarmaAdvanceAttr(char, attrName, newRating);
  if (err) { u.send(err); return; }

  const fromRating = char.attrs[attrName] ?? 0;
  char.attrs[attrName] = newRating;
  const cost = attrAdvanceCost(fromRating, newRating);
  await awardKarma(char, -cost, `Advanced ${attrName} ${fromRating}→${newRating}`, undefined, {
    type: "attr", target: attrName, fromRating, toRating: newRating,
  });
  u.send(`%ch${attrName}%cn raised to %ch${newRating}%cn. (−${cost} karma)  Remaining: %ch${char.karmaAvailable}%cn.`);
}

async function advanceSpec(u: IUrsamuSDK, raw: string): Promise<void> {
  const colonIdx = raw.indexOf(":");
  if (colonIdx === -1) { u.send("Usage: +karma/advance/spec <Skill>:<Specialization>"); return; }
  const input    = raw.slice(0, colonIdx).trim();
  const specName = raw.slice(colonIdx + 1).trim();

  const skillName = resolveSkill(input);
  if (!skillName) { u.send(`Unknown skill "${input}".`); return; }

  const char = await getApprovedChar(u);
  if (!char) return;

  const err = validateKarmaAdvanceSpec(char, skillName, specName);
  if (err) { u.send(err); return; }

  const fromRating = char.skills[skillName].rating;
  char.skills[skillName] = { ...char.skills[skillName], spec: specName };
  await awardKarma(char, -SPEC_COST, `Specialization: ${skillName} (${specName})`, undefined, {
    type: "spec", target: `${skillName}:${specName}`, fromRating, toRating: fromRating,
  });
  u.send(`Specialization %ch${specName}%cn added to ${skillName}. (−${SPEC_COST} karma)  Remaining: %ch${char.karmaAvailable}%cn.`);
}

async function advanceSkillGroup(u: IUrsamuSDK, raw: string): Promise<void> {
  const { name: input, rating: newRating } = parseNameRating(raw);
  if (!input || newRating === null) { u.send("Usage: +karma/advance/skillgroup <Group>=<newRating>"); return; }

  const groupName = resolveSkillGroup(input);
  if (!groupName) { u.send(`Unknown skill group "${input}". Use +karma/advance/skill for individual skills.`); return; }

  const skills = skillsInGroup(groupName);
  const char   = await getApprovedChar(u);
  if (!char) return;

  const err = validateKarmaAdvanceSkillGroup(char, groupName, skills, newRating);
  if (err) { u.send(err); return; }

  const fromRating = char.skills[skills[0]]?.rating ?? 0;
  const cost       = skillGroupAdvanceCost(fromRating, newRating, skills.length);
  for (const s of skills) {
    char.skills[s] = { ...(char.skills[s] ?? {}), rating: newRating };
  }
  await awardKarma(char, -cost, `Advanced ${groupName} group ${fromRating}→${newRating}`, undefined, {
    type: "skillgroup", target: groupName, fromRating, toRating: newRating,
  });
  u.send(`%ch${groupName}%cn group raised to %ch${newRating}%cn (${skills.length} skills). (−${cost} karma)  Remaining: %ch${char.karmaAvailable}%cn.`);
}

// ── helpers ───────────────────────────────────────────────────────────────────

function checkAdmin(u: IUrsamuSDK): boolean {
  return u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
}

async function getApprovedChar(u: IUrsamuSDK) {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return null; }
  if (char.chargenState !== "approved") { u.send("Your character is not yet approved."); return null; }
  return char;
}

function parseNameRating(raw: string): { name: string; rating: number | null } {
  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) return { name: "", rating: null };
  const name   = raw.slice(0, eqIdx).trim();
  const rating = parseInt(raw.slice(eqIdx + 1).trim(), 10);
  return { name, rating: isNaN(rating) ? null : rating };
}

/** Format the karma log for display (exported for tests). */
export function formatKarmaEntry(e: IKarmaLogEntry): string {
  const sign = e.delta >= 0 ? `+${e.delta}` : `${e.delta}`;
  const adv  = e.advancement ? ` [${e.advancement.type}: ${e.advancement.target}]` : "";
  const by   = e.awardedBy ? ` (by ${e.awardedBy})` : "";
  return `${sign}  ${e.reason}${adv}${by}`;
}

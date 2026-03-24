// ─── +knowledge, +language commands ──────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import {
  KNOWLEDGE_CATEGORIES,
  validateKnowledgeName,
  validateKnowledgeRating,
  validateKnowledgeCategory,
  knowledgeAdvanceCost,
  languagesBP,
  LANGUAGE_SKILL_BP,
} from "./sr4/knowledge.ts";

// ── +knowledge ────────────────────────────────────────────────────────────────

addCmd({
  name: "+knowledge",
  pattern: /^\+knowledge(?:\/(add|remove|list|advance))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+knowledge[/<switch>] [<args>]  — Manage your knowledge skills.

Switches:
  /add <Name>=<rating>/<category>   Add a knowledge skill.
  /remove <Name>                    Remove a knowledge skill.
  /advance <Name>                   Spend karma to raise a knowledge skill by 1.
  /list                             List your knowledge skills.

Categories: academic, street, professional, interest

Examples:
  +knowledge/add Corporate Law=4/academic      Add Corporate Law (rating 4, academic).
  +knowledge/add Sprawl Rumors=3/street        Add Sprawl Rumors (street knowledge).
  +knowledge/advance Corporate Law             Spend 5 karma to raise Corporate Law 4→5.
  +knowledge/remove Sprawl Rumors              Remove a knowledge skill.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":
      case "list":    return await listKnowledge(u);
      case "add":     return await addKnowledge(u, raw);
      case "remove":  return await removeKnowledge(u, raw);
      case "advance": return await advanceKnowledge(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help knowledge%cn.`);
    }
  },
});

async function listKnowledge(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const skills = Object.entries(char.knowledgeSkills ?? {});
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [`%ch${hr}%cn`, `%ch  KNOWLEDGE SKILLS%cn`, `%ch${hr}%cn`];

  if (skills.length === 0) {
    lines.push("  (none)");
  } else {
    lines.push(`  ${"Name".padEnd(36)} ${"Rtg".padEnd(4)} Category`);
    lines.push(div);
    for (const [name, s] of skills.sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`  ${name.padEnd(36)} ${String(s.rating).padEnd(4)} ${s.category}`);
    }
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

async function addKnowledge(u: IUrsamuSDK, raw: string): Promise<void> {
  // Format: <Name>=<rating>/<category>
  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: %ch+knowledge/add <Name>=<rating>/<category>%cn");
    return;
  }
  const name     = raw.slice(0, eqIdx).trim();
  const rest     = raw.slice(eqIdx + 1).trim();
  const slashIdx = rest.lastIndexOf("/");

  if (slashIdx === -1) {
    u.send("Usage: %ch+knowledge/add <Name>=<rating>/<category>%cn");
    return;
  }

  const ratingStr  = rest.slice(0, slashIdx).trim();
  const category   = rest.slice(slashIdx + 1).trim().toLowerCase();
  const rating     = parseInt(ratingStr, 10);

  const nameErr = validateKnowledgeName(name);
  if (nameErr) { u.send(nameErr); return; }
  const ratingErr = validateKnowledgeRating(rating);
  if (ratingErr) { u.send(ratingErr); return; }
  const catErr = validateKnowledgeCategory(category);
  if (catErr) { u.send(catErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const existing = char.knowledgeSkills ?? {};
  if (existing[name]) {
    u.send(`Knowledge skill "%ch${name}%cn" already exists. Use %ch+knowledge/advance%cn to raise it.`);
    return;
  }

  await saveChar({
    ...char,
    knowledgeSkills: { ...existing, [name]: { rating, category: category as never } },
  });
  u.send(`Knowledge skill %ch${name}%cn (${category}, rating ${rating}) added.`);
}

async function removeKnowledge(u: IUrsamuSDK, raw: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const existing = { ...(char.knowledgeSkills ?? {}) };
  if (!existing[raw]) {
    u.send(`No knowledge skill named "%ch${raw}%cn" found.`);
    return;
  }
  delete existing[raw];
  await saveChar({ ...char, knowledgeSkills: existing });
  u.send(`Knowledge skill %ch${raw}%cn removed.`);
}

async function advanceKnowledge(u: IUrsamuSDK, raw: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

  const skill = (char.knowledgeSkills ?? {})[raw];
  if (!skill) {
    u.send(`No knowledge skill named "%ch${raw}%cn" found.`);
    return;
  }

  const newRating = skill.rating + 1;
  const cost      = knowledgeAdvanceCost(newRating);

  if ((char.karmaAvailable ?? 0) < cost) {
    u.send(`Insufficient karma. Raising to ${newRating} costs %ch${cost}%cn karma (you have %ch${char.karmaAvailable}%cn).`);
    return;
  }

  const karmaLog = [
    ...(char.karmaLog ?? []),
    { timestamp: Date.now(), delta: -cost, reason: `Knowledge: ${raw} ${skill.rating}→${newRating}` },
  ];
  await saveChar({
    ...char,
    knowledgeSkills: { ...char.knowledgeSkills, [raw]: { ...skill, rating: newRating } },
    karmaAvailable: char.karmaAvailable - cost,
    karmaLog,
  });
  u.send(`%ch${raw}%cn advanced from ${skill.rating} to %ch${newRating}%cn (${cost} karma spent).`);
}

// ── +language ─────────────────────────────────────────────────────────────────

addCmd({
  name: "+language",
  pattern: /^\+language(?:\/(add|remove|list|advance))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+language[/<switch>] [<args>]  — Manage your language skills.

Switches:
  /add <Language>=<rating>[/native]   Add a language (native is free and infinite rating).
  /remove <Language>                  Remove a language.
  /advance <Language>                 Spend karma to raise a language by 1.
  /list                               List your languages.

Examples:
  +language/add English=6/native   Add English as native language (free).
  +language/add Japanese=3         Add Japanese (costs 6 BP during chargen).
  +language/advance Japanese       Spend 4 karma to raise Japanese 3→4.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":
      case "list":    return await listLanguages(u);
      case "add":     return await addLanguage(u, raw);
      case "remove":  return await removeLanguage(u, raw);
      case "advance": return await advanceLanguage(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help language%cn.`);
    }
  },
});

async function listLanguages(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const langs = Object.entries(char.languages ?? {});
  const bpUsed = languagesBP(char.languages ?? {});
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [`%ch${hr}%cn`, `%ch  LANGUAGES%cn (${bpUsed} BP)`, `%ch${hr}%cn`];

  if (langs.length === 0) {
    lines.push("  (none)");
  } else {
    lines.push(`  ${"Language".padEnd(36)} ${"Rtg".padEnd(4)} Notes`);
    lines.push(div);
    for (const [name, l] of langs.sort(([a], [b]) => a.localeCompare(b))) {
      const tag = l.native ? "%cy[native]%cn" : `${l.rating * LANGUAGE_SKILL_BP} BP`;
      lines.push(`  ${name.padEnd(36)} ${l.native ? "∞".padEnd(4) : String(l.rating).padEnd(4)} ${tag}`);
    }
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

async function addLanguage(u: IUrsamuSDK, raw: string): Promise<void> {
  // Format: <Language>=<rating>[/native]
  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: %ch+language/add <Language>=<rating>[/native]%cn");
    return;
  }
  const lang   = raw.slice(0, eqIdx).trim();
  const rest   = raw.slice(eqIdx + 1).trim().toLowerCase();
  const parts  = rest.split("/");
  const isNative = parts.includes("native");
  const rating   = isNative ? 6 : parseInt(parts[0], 10);

  const nameErr = validateKnowledgeName(lang);
  if (nameErr) { u.send(nameErr); return; }
  if (!isNative) {
    const ratingErr = validateKnowledgeRating(rating);
    if (ratingErr) { u.send(ratingErr); return; }
  }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const existing = char.languages ?? {};
  if (existing[lang]) {
    u.send(`Language "%ch${lang}%cn" already exists. Use %ch+language/advance%cn to raise it.`);
    return;
  }

  await saveChar({
    ...char,
    languages: { ...existing, [lang]: { rating, native: isNative || undefined } },
  });
  const bpCost = isNative ? 0 : rating * LANGUAGE_SKILL_BP;
  u.send(`Language %ch${lang}%cn added${isNative ? " (native, free)" : ` (rating ${rating}, ${bpCost} BP)`}.`);
}

async function removeLanguage(u: IUrsamuSDK, raw: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  const existing = { ...(char.languages ?? {}) };
  if (!existing[raw]) {
    u.send(`No language named "%ch${raw}%cn" found.`);
    return;
  }
  delete existing[raw];
  await saveChar({ ...char, languages: existing });
  u.send(`Language %ch${raw}%cn removed.`);
}

async function advanceLanguage(u: IUrsamuSDK, raw: string): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }
  if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

  const lang = (char.languages ?? {})[raw];
  if (!lang) {
    u.send(`No language named "%ch${raw}%cn" found.`);
    return;
  }
  if (lang.native) {
    u.send(`Native languages cannot be advanced (already at native fluency).`);
    return;
  }

  const newRating = lang.rating + 1;
  const cost      = knowledgeAdvanceCost(newRating);

  if ((char.karmaAvailable ?? 0) < cost) {
    u.send(`Insufficient karma. Raising to ${newRating} costs %ch${cost}%cn karma (you have %ch${char.karmaAvailable}%cn).`);
    return;
  }

  const karmaLog = [
    ...(char.karmaLog ?? []),
    { timestamp: Date.now(), delta: -cost, reason: `Language: ${raw} ${lang.rating}→${newRating}` },
  ];
  await saveChar({
    ...char,
    languages: { ...char.languages, [raw]: { ...lang, rating: newRating } },
    karmaAvailable: char.karmaAvailable - cost,
    karmaLog,
  });
  u.send(`%ch${raw}%cn advanced from ${lang.rating} to %ch${newRating}%cn (${cost} karma spent).`);
}

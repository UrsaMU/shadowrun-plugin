// ─── +matrix command ───────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import type { ICommlink } from "./types.ts";
import { getChar, saveChar } from "./db.ts";
import { personaCmBoxes, PROGRAM_LIST, lookupProgram, validateCommlink } from "./sr4/matrix.ts";

addCmd({
  name: "+matrix",
  pattern: /^\+matrix(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+matrix[/<switch>] [<args>]  — View or manage your commlink and Matrix status.

Switches:
  /setup <model>=<F>/<R>/<Sig>/<Sys>  Staff: set commlink stats (Firewall/Response/Signal/System).
  /program/load <name>                Load a program (up to Response active at once).
  /program/unload <name>              Unload a running program.
  /programs                           Show the program catalogue.

Examples:
  +matrix                                  View your commlink and active programs.
  +matrix/setup Renraku Kraftwerk=4/4/4/4  Set commlink stats (staff action).
  +matrix/program/load Exploit             Load the Exploit program.
  +matrix/program/unload Stealth           Unload Stealth.
  +matrix/programs                         Browse available programs.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":               return await showMatrix(u);
      case "programs":       return showProgramCatalogue(u);
      case "program/load":   return await loadProgram(u, raw);
      case "program/unload": return await unloadProgram(u, raw);
      case "setup":          return await setupCommlink(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help matrix%cn.`);
    }
  },
});

async function showMatrix(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [`%ch${hr}%cn`, `%ch  MATRIX%cn`, `%ch${hr}%cn`];

  if (!char.commlink) {
    lines.push("  No commlink configured. (Staff: use %ch+matrix/setup%cn)");
  } else {
    const cl     = char.commlink;
    const sys    = cl.system;
    const cmMax  = personaCmBoxes(sys);
    const dmg    = char.matrixDmg ?? 0;

    lines.push(
      `  Commlink: %ch${cl.model}%cn`,
      `  Firewall: %ch${cl.firewall}%cn   Response: %ch${cl.response}%cn   Signal: %ch${cl.signal}%cn   System: %ch${cl.system}%cn`,
      `  Persona CM: ${dmgBar(dmg, cmMax)} (${dmg}/${cmMax})`,
      div,
      `%ch  ACTIVE PROGRAMS (${cl.programs.length}/${cl.response})%cn`,
    );

    if (cl.programs.length === 0) {
      lines.push("  (none loaded)");
    } else {
      for (const prog of cl.programs) {
        const entry = lookupProgram(prog);
        lines.push(`  %ch${prog.padEnd(16)}%cn  ${entry?.effect ?? ""}`);
      }
    }
  }

  // Resonance / Technomancer section
  if (char.resonance !== undefined) {
    lines.push(div, `%ch  TECHNOMANCER%cn`);
    lines.push(`  Resonance: %ch${char.resonance}%cn`);
    const forms = char.complexForms ?? [];
    if (forms.length > 0) {
      lines.push(`  Complex Forms: ${forms.map((f) => `%ch${f.name}%cn (${f.rating})`).join(", ")}`);
    }
  }

  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

function showProgramCatalogue(u: IUrsamuSDK): void {
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`, `%ch  PROGRAM CATALOGUE%cn`, `%ch${hr}%cn`,
    `  ${"Name".padEnd(16)} ${"Cat".padEnd(12)} Effect`,
    div,
  ];
  for (const p of PROGRAM_LIST) {
    lines.push(`  ${p.name.padEnd(16)} ${p.category.padEnd(12)} ${p.effect}`);
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

async function loadProgram(u: IUrsamuSDK, progName: string): Promise<void> {
  if (!progName) { u.send("Usage: %ch+matrix/program/load <name>%cn"); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }
  if (!char.commlink) { u.send("No commlink configured."); return; }

  const entry = lookupProgram(progName);
  if (!entry) {
    u.send(`Program "${progName}" not found. Use %ch+matrix/programs%cn.`);
    return;
  }

  if (char.commlink.programs.includes(entry.name)) {
    u.send(`${entry.name} is already loaded.`);
    return;
  }

  if (char.commlink.programs.length >= char.commlink.response) {
    u.send(
      `Cannot load more programs — Response (${char.commlink.response}) limit reached.`,
    );
    return;
  }

  const updated = {
    ...char,
    commlink: { ...char.commlink, programs: [...char.commlink.programs, entry.name] },
  };
  await saveChar(updated);
  u.send(`%ch${entry.name}%cn loaded. (${updated.commlink!.programs.length}/${char.commlink.response} programs active)`);
}

async function unloadProgram(u: IUrsamuSDK, progName: string): Promise<void> {
  if (!progName) { u.send("Usage: %ch+matrix/program/unload <name>%cn"); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }
  if (!char.commlink) { u.send("No commlink configured."); return; }

  const idx = char.commlink.programs.findIndex(
    (p) => p.toLowerCase() === progName.toLowerCase(),
  );
  if (idx === -1) {
    u.send(`${progName} is not currently loaded.`);
    return;
  }

  const programs = char.commlink.programs.filter((_, i) => i !== idx);
  await saveChar({ ...char, commlink: { ...char.commlink, programs } });
  u.send(`%ch${char.commlink.programs[idx]}%cn unloaded.`);
}

async function setupCommlink(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Only staff can configure commlinks."); return; }

  // Format: "Model Name=F/R/Sig/Sys"
  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) {
    u.send("Usage: %ch+matrix/setup <Model>=<F>/<R>/<Sig>/<Sys>%cn  (e.g. Renraku=4/4/4/4)");
    return;
  }

  const model   = raw.slice(0, eqIdx).trim();
  const statStr = raw.slice(eqIdx + 1).trim();
  const parts   = statStr.split("/").map((s) => parseInt(s.trim(), 10));

  if (parts.length !== 4 || parts.some(isNaN)) {
    u.send("Stats must be four integers: %ch<Firewall>/<Response>/<Signal>/<System>%cn");
    return;
  }

  const [firewall, response, signal, system] = parts;
  const cl: ICommlink = { model, firewall, response, signal, system, programs: [] };

  const err = validateCommlink(cl);
  if (err) { u.send(`%cr${err}%cn`); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("No character sheet."); return; }

  await saveChar({ ...char, commlink: cl });
  u.send(
    `Commlink set: %ch${model}%cn — Firewall ${firewall} / Response ${response} / Signal ${signal} / System ${system}`,
  );
}

function dmgBar(filled: number, total: number): string {
  return Array.from({ length: total }, (_, i) =>
    i < filled ? "%cr[X]%cn" : "[ ]",
  ).join("");
}

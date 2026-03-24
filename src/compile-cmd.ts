// ─── +compile and +thread commands (Technomancer) ─────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import { SPRITE_TYPES, calcFadingDv, spriteCmBoxes, COMPLEX_FORM_LIST } from "./sr4/matrix.ts";
import { appendRollLog } from "./rolllog-db.ts";

const MAX_FORCE = 12;

// ── +compile ───────────────────────────────────────────────────────────────────

addCmd({
  name: "+compile",
  pattern: /^\+compile(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+compile[/<switch>] <sprite>=<force>  — Compile a sprite (Technomancer only).

  Pool: Compiling + Resonance.
  Net hits over Force = tasks owed.
  Fading: max(ceil(Force/2), 2) Stun; Physical if Force > Resonance.

Switches:
  /list    Show available sprite types.

Sprite types: Courier, Crack, Data, Fault, Machine

Examples:
  +compile Fault=6     Compile a Fault sprite at Force 6.
  +compile Data=4      Compile a Data sprite at Force 4.
  +compile/list        Show all sprite types.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    if (sw === "list") {
      u.send(`%chSprite types:%cn ${SPRITE_TYPES.join(", ")}`);
      return;
    }
    if (sw) {
      u.send(`Unknown switch "/${sw}". See %ch+help compile%cn.`);
      return;
    }

    const eqIdx = raw.indexOf("=");
    if (eqIdx === -1) { u.send("Usage: %ch+compile <sprite>=<force>%cn"); return; }

    const spriteName = raw.slice(0, eqIdx).trim();
    const force      = parseInt(raw.slice(eqIdx + 1).trim(), 10);

    if (!SPRITE_TYPES.includes(spriteName as typeof SPRITE_TYPES[number])) {
      u.send(`Unknown sprite type "${spriteName}". Types: ${SPRITE_TYPES.join(", ")}`);
      return;
    }

    if (isNaN(force) || force < 1 || force > MAX_FORCE) {
      u.send(`Force must be 1–${MAX_FORCE}.`);
      return;
    }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const resonance = char.resonance;
    if (resonance === undefined) {
      u.send("Only Technomancers have a Resonance attribute.");
      return;
    }

    const compSkill = char.skills["Compiling"]?.rating ?? 0;
    const pool      = compSkill + resonance;
    const result    = rollPool(pool);

    const tasks      = Math.max(0, result.hits - force);
    const cmBoxes    = spriteCmBoxes(force);
    const { dv: fadeDv, type: fadeType } = calcFadingDv(force, resonance);

    const name = u.util.displayName(u.me, u.me);
    const taskLine = tasks > 0
      ? `%ch${spriteName} sprite compiled%cn — ${tasks} task${tasks !== 1 ? "s" : ""} owed. CM: ${cmBoxes} boxes.`
      : `%crCompiling failed%cn (${result.hits} hits < Force ${force} threshold).`;

    const msg = [
      `%ch${name}%cn compiles a ${spriteName} sprite (Force ${force}):`,
      `  Pool: %ch${pool}%cn (Compiling ${compSkill} + Resonance ${resonance})`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${taskLine}`,
      `  Fading: %ch${fadeDv}%cn ${fadeType === "physical" ? "Physical" : "Stun"}`,
    ].join("%r");

    u.send(msg);
    u.here.broadcast(`${name} compiles a ${spriteName} sprite.`);

    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
    }).catch(() => {});
  },
});

// ── +thread ────────────────────────────────────────────────────────────────────

addCmd({
  name: "+thread",
  pattern: /^\+thread(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+thread[/<switch>] <form>=<force>  — Thread a complex form (Technomancer only).

  Pool: Threading + Resonance.
  Each net hit sustains the form; Fading after threading.

Switches:
  /list    Show available complex forms.

Examples:
  +thread Resonance Spike=6   Thread Resonance Spike at Force 6.
  +thread/list                Browse all complex forms.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    if (sw === "list") {
      const lines = [
        "%ch  Complex Forms:%cn",
        ...COMPLEX_FORM_LIST.map((f) => `  %ch${f.name}%cn — ${f.description}`),
      ];
      u.send(lines.join("%r"));
      return;
    }
    if (sw) {
      u.send(`Unknown switch "/${sw}". See %ch+help thread%cn.`);
      return;
    }

    const eqIdx = raw.indexOf("=");
    if (eqIdx === -1) { u.send("Usage: %ch+thread <form>=<force>%cn"); return; }

    const formName = raw.slice(0, eqIdx).trim();
    const force    = parseInt(raw.slice(eqIdx + 1).trim(), 10);

    const formEntry = COMPLEX_FORM_LIST.find(
      (f) => f.name.toLowerCase() === formName.toLowerCase(),
    );
    if (!formEntry) {
      u.send(`Unknown complex form "${formName}". Use %ch+thread/list%cn.`);
      return;
    }

    if (isNaN(force) || force < 1 || force > MAX_FORCE) {
      u.send(`Force must be 1–${MAX_FORCE}.`);
      return;
    }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const resonance = char.resonance;
    if (resonance === undefined) {
      u.send("Only Technomancers can thread complex forms.");
      return;
    }

    const threadSkill = char.skills["Threading"]?.rating ?? 0;
    const pool        = threadSkill + resonance;
    const result      = rollPool(pool);

    const { dv: fadeDv, type: fadeType } = calcFadingDv(force, resonance);
    const name = u.util.displayName(u.me, u.me);

    const msg = [
      `%ch${name}%cn threads %ch${formEntry.name}%cn (Force ${force}):`,
      `  Pool: %ch${pool}%cn (Threading ${threadSkill} + Resonance ${resonance})`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${formEntry.description}`,
      `  Fading: %ch${fadeDv}%cn ${fadeType === "physical" ? "Physical" : "Stun"}`,
    ].join("%r");

    u.send(msg);
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
    }).catch(() => {});
  },
});

// ─── +initiate, +submerse commands ────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import {
  initiationCost,
  magicCap,
  resonanceCap,
  METAMAGIC_LIST,
  ECHO_LIST,
  lookupMetamagic,
  lookupEcho,
} from "./sr4/initiation.ts";
import { isAwakened, isAdept } from "./sr4/adept.ts";

// ── +initiate ─────────────────────────────────────────────────────────────────

addCmd({
  name: "+initiate",
  pattern: /^\+initiate(?:\/(list))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+initiate [/list] [<metamagic>]  — Advance initiation grade or view metamagics.

Switches:
  /list    Show all available metamagics.

  With no args: display your current initiation grade, karma cost, and known metamagics.
  With <metamagic>: pay karma to advance grade and learn the named metamagic.

Examples:
  +initiate                    Show current grade and known metamagics.
  +initiate/list               List all metamagics.
  +initiate Centering          Advance to next grade, learn Centering.`,

  exec: async (u: IUrsamuSDK) => {
    const sw   = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw  = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    if (sw === "list") {
      return showMetamagicList(u);
    }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    if (!isAwakened(char.qualities) && !isAdept(char.qualities)) {
      u.send("Only Awakened characters (Magician, Mystic Adept, or Adept) can initiate.");
      return;
    }

    if (raw === "") {
      return showInitiateStatus(u, char);
    }

    // Advance grade + learn metamagic
    const entry = lookupMetamagic(raw);
    if (!entry) {
      u.send(`Unknown metamagic "%ch${raw}%cn". See %ch+initiate/list%cn.`);
      return;
    }

    if (char.metamagics.includes(entry.name)) {
      u.send(`You already know %ch${entry.name}%cn.`);
      return;
    }

    const newGrade = (char.initiationGrade ?? 0) + 1;
    const cost     = initiationCost(newGrade);

    if ((char.karmaAvailable ?? 0) < cost) {
      u.send(`Insufficient karma. Grade ${newGrade} costs %ch${cost}%cn karma (you have %ch${char.karmaAvailable}%cn).`);
      return;
    }

    const karmaLog = [
      ...(char.karmaLog ?? []),
      {
        timestamp: Date.now(),
        delta:     -cost,
        reason:    `Initiation Grade ${newGrade} — ${entry.name}`,
      },
    ];

    await saveChar({
      ...char,
      initiationGrade:  newGrade,
      metamagics:       [...char.metamagics, entry.name],
      karmaAvailable:   char.karmaAvailable - cost,
      karmaTotal:       char.karmaTotal,
      karmaLog,
    });

    const newCap = magicCap(newGrade);
    u.send(
      `%chInitiation Grade ${newGrade}%cn achieved. Learned: %ch${entry.name}%cn.%r` +
      `  Magic attribute cap raised to %ch${newCap}%cn. Karma spent: %ch${cost}%cn.`,
    );
  },
});

function showInitiateStatus(u: IUrsamuSDK, char: ReturnType<typeof Object.assign>): void {
  const grade   = char.initiationGrade ?? 0;
  const newGrade = grade + 1;
  const cost     = initiationCost(newGrade);
  const cap      = magicCap(grade);
  const W        = 78;
  const hr       = "=".repeat(W);
  const div      = "-".repeat(W);
  const lines    = [
    `%ch${hr}%cn`,
    `%ch  INITIATION%cn`,
    `%ch${hr}%cn`,
    `  Grade: %ch${grade}%cn   Magic cap: %ch${cap}%cn   Next grade cost: %ch${cost}%cn karma`,
    div,
  ];

  const learned = char.metamagics ?? [];
  if (learned.length === 0) {
    lines.push("  No metamagics learned.");
  } else {
    for (const m of learned) {
      const entry = lookupMetamagic(m);
      lines.push(`  %ch${m}%cn — ${entry?.description ?? ""}`);
    }
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

function showMetamagicList(u: IUrsamuSDK): void {
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  METAMAGICS%cn`,
    `%ch${hr}%cn`,
    `  ${`Name`.padEnd(16)} Description`,
    div,
  ];
  for (const m of METAMAGIC_LIST) {
    lines.push(`  ${m.name.padEnd(16)} ${m.description}`);
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

// ── +submerse ─────────────────────────────────────────────────────────────────

addCmd({
  name: "+submerse",
  pattern: /^\+submerse(?:\/(list))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+submerse [/list] [<echo>]  — Advance submersion grade or view Echoes.

Switches:
  /list    Show all available Echoes.

  With no args: display your current submersion grade, karma cost, and known Echoes.
  With <echo>: pay karma to advance grade and learn the named Echo.

Examples:
  +submerse                    Show current grade and known Echoes.
  +submerse/list               List all Echoes.
  +submerse Stability          Advance to next grade, learn Stability.`,

  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    if (sw === "list") {
      return showEchoList(u);
    }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    if (!char.resonance) {
      u.send("Only Technomancers (with Resonance attribute) can submerge.");
      return;
    }

    if (raw === "") {
      return showSubmerseStatus(u, char);
    }

    const entry = lookupEcho(raw);
    if (!entry) {
      u.send(`Unknown Echo "%ch${raw}%cn". See %ch+submerse/list%cn.`);
      return;
    }

    if (char.metamagics.includes(entry.name)) {
      u.send(`You already know %ch${entry.name}%cn.`);
      return;
    }

    const newGrade = (char.submersionGrade ?? 0) + 1;
    const cost     = initiationCost(newGrade);

    if ((char.karmaAvailable ?? 0) < cost) {
      u.send(`Insufficient karma. Grade ${newGrade} costs %ch${cost}%cn karma (you have %ch${char.karmaAvailable}%cn).`);
      return;
    }

    const karmaLog = [
      ...(char.karmaLog ?? []),
      {
        timestamp: Date.now(),
        delta:     -cost,
        reason:    `Submersion Grade ${newGrade} — ${entry.name}`,
      },
    ];

    await saveChar({
      ...char,
      submersionGrade:  newGrade,
      metamagics:       [...char.metamagics, entry.name],
      karmaAvailable:   char.karmaAvailable - cost,
      karmaTotal:       char.karmaTotal,
      karmaLog,
    });

    const newCap = resonanceCap(newGrade);
    u.send(
      `%chSubmersion Grade ${newGrade}%cn achieved. Learned: %ch${entry.name}%cn.%r` +
      `  Resonance attribute cap raised to %ch${newCap}%cn. Karma spent: %ch${cost}%cn.`,
    );
  },
});

function showSubmerseStatus(u: IUrsamuSDK, char: ReturnType<typeof Object.assign>): void {
  const grade    = char.submersionGrade ?? 0;
  const newGrade = grade + 1;
  const cost     = initiationCost(newGrade);
  const cap      = resonanceCap(grade);
  const W        = 78;
  const hr       = "=".repeat(W);
  const div      = "-".repeat(W);
  const lines    = [
    `%ch${hr}%cn`,
    `%ch  SUBMERSION%cn`,
    `%ch${hr}%cn`,
    `  Grade: %ch${grade}%cn   Resonance cap: %ch${cap}%cn   Next grade cost: %ch${cost}%cn karma`,
    div,
  ];

  const learned = char.metamagics ?? [];
  const echoes  = learned.filter((m: string) => ECHO_LIST.some((e) => e.name === m));
  if (echoes.length === 0) {
    lines.push("  No Echoes learned.");
  } else {
    for (const name of echoes) {
      const entry = lookupEcho(name);
      lines.push(`  %ch${name}%cn — ${entry?.description ?? ""}`);
    }
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

function showEchoList(u: IUrsamuSDK): void {
  const W   = 78;
  const hr  = "=".repeat(W);
  const div = "-".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  ECHOES%cn`,
    `%ch${hr}%cn`,
    `  ${`Name`.padEnd(20)} Description`,
    div,
  ];
  for (const e of ECHO_LIST) {
    lines.push(`  ${e.name.padEnd(20)} ${e.description}`);
  }
  lines.push(`%ch${hr}%cn`);
  u.send(lines.join("%r"));
}

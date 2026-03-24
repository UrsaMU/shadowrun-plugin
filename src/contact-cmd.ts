// ─── +contact command ──────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { validateContact, contactBP, contactsBP } from "./sr4/contacts.ts";
import type { ICharContact } from "./types.ts";
import { calcBP, BP_TOTAL } from "./chargen/bp.ts";

addCmd({
  name: "+contact",
  pattern: /^\+contact(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+contact[/<switch>] [<args>]  — Manage your NPC contacts.

Switches:
  /add <Name>=<Conn>/<Loy>    Add a contact (costs BP in chargen).
  /edit <Name>=<Conn>/<Loy>   Update an existing contact's ratings.
  /remove <Name>               Remove a contact.
  /view <player>               [Staff] View another player's contacts.

  Connection 1–12, Loyalty 1–6.
  During chargen, each contact costs (Connection + Loyalty) BP.
  Post-approval, contacts are free.

Examples:
  +contact                     List your contacts.
  +contact/add Fixer Mike=8/4  Add a Connection 8, Loyalty 4 fixer.
  +contact/edit Fixer Mike=8/5 Raise Mike's loyalty to 5.
  +contact/remove Fixer Mike   Remove Mike from your contacts.
  +contact/view Alice          View Alice's contacts (staff only).`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":       return await listContacts(u);
      case "add":    return await addContact(u, raw);
      case "edit":   return await editContact(u, raw);
      case "remove": return await removeContact(u, raw);
      case "view":   return await viewContacts(u, raw);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help contact%cn.`);
    }
  },
});

// ── handlers ──────────────────────────────────────────────────────────────────

async function listContacts(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet. Use +chargen to create one."); return; }
  u.send(formatContactList(char.contacts, u.me.name ?? "You"));
}

async function addContact(u: IUrsamuSDK, raw: string): Promise<void> {
  const parsed = parseContactArg(raw);
  if (!parsed) { u.send("Usage: +contact/add <Name>=<Connection>/<Loyalty>"); return; }

  const valErr = validateContact(parsed.name, parsed.connection, parsed.loyalty);
  if (valErr) { u.send(valErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet. Use +chargen to create one."); return; }
  if (char.chargenState === "submitted") {
    u.send("Your character is submitted for review. Ask staff to reset if you need changes.");
    return;
  }

  // Duplicate name check (case-insensitive)
  if (findContactIdx(char.contacts, parsed.name) !== -1) {
    u.send(`You already have a contact named "%ch${parsed.name}%cn". Use +contact/edit to update.`);
    return;
  }

  const newContact: ICharContact = { name: parsed.name, connection: parsed.connection, loyalty: parsed.loyalty };

  // BP enforcement in draft state
  if (char.chargenState === "draft") {
    char.contacts.push(newContact);
    const newBP = calcBP(char);
    if (newBP > BP_TOTAL) {
      char.contacts.pop(); // rollback
      u.send(`Not enough BP. Adding ${parsed.name} (${contactBP(newContact)} BP) would total ${newBP}/${BP_TOTAL}.`);
      return;
    }
    await saveChar(char);
    u.send(`%ch${parsed.name}%cn added (Conn %ch${parsed.connection}%cn / Loy %ch${parsed.loyalty}%cn). BP: ${newBP}/${BP_TOTAL}.`);
  } else {
    // Approved — free to add
    char.contacts.push(newContact);
    await saveChar(char);
    u.send(`%ch${parsed.name}%cn added (Conn %ch${parsed.connection}%cn / Loy %ch${parsed.loyalty}%cn).`);
  }
}

async function editContact(u: IUrsamuSDK, raw: string): Promise<void> {
  const parsed = parseContactArg(raw);
  if (!parsed) { u.send("Usage: +contact/edit <Name>=<Connection>/<Loyalty>"); return; }

  const valErr = validateContact(parsed.name, parsed.connection, parsed.loyalty);
  if (valErr) { u.send(valErr); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState === "submitted") {
    u.send("Your character is submitted for review. Ask staff to reset if you need changes.");
    return;
  }

  const idx = findContactIdx(char.contacts, parsed.name);
  if (idx === -1) {
    u.send(`No contact named "%ch${parsed.name}%cn" found. Use +contact/add to add them.`);
    return;
  }

  const prev = { ...char.contacts[idx] };
  char.contacts[idx] = { name: prev.name, connection: parsed.connection, loyalty: parsed.loyalty };

  if (char.chargenState === "draft") {
    const newBP = calcBP(char);
    if (newBP > BP_TOTAL) {
      char.contacts[idx] = prev; // rollback
      u.send(`Not enough BP. That edit would bring the total to ${newBP}/${BP_TOTAL}.`);
      return;
    }
  }

  await saveChar(char);
  const bpSuffix = char.chargenState === "draft" ? `  BP: ${calcBP(char)}/${BP_TOTAL}.` : "";
  u.send(`%ch${prev.name}%cn updated to Conn %ch${parsed.connection}%cn / Loy %ch${parsed.loyalty}%cn.${bpSuffix}`);
}

async function removeContact(u: IUrsamuSDK, raw: string): Promise<void> {
  const name = raw.trim();
  if (!name) { u.send("Usage: +contact/remove <Name>"); return; }

  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }
  if (char.chargenState === "submitted") {
    u.send("Your character is submitted for review. Ask staff to reset if you need changes.");
    return;
  }

  const idx = findContactIdx(char.contacts, name);
  if (idx === -1) {
    u.send(`No contact named "%ch${name}%cn" found.`);
    return;
  }

  const removed = char.contacts.splice(idx, 1)[0];
  await saveChar(char);
  const bpSuffix = char.chargenState === "draft"
    ? `  (${contactBP(removed)} BP returned)  Total BP: ${calcBP(char)}/${BP_TOTAL}.`
    : "";
  u.send(`%ch${removed.name}%cn removed.${bpSuffix}`);
}

async function viewContacts(u: IUrsamuSDK, raw: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Permission denied."); return; }

  const playerName = raw.trim();
  if (!playerName) { u.send("Usage: +contact/view <player>"); return; }

  const target = await u.util.target(u.me, playerName, true);
  if (!target) { u.send(`Player "${playerName}" not found.`); return; }

  const char = await getChar(target.id);
  if (!char) { u.send(`${target.name ?? playerName} has no character sheet.`); return; }

  u.send(formatContactList(char.contacts, target.name ?? playerName));
}

// ── helpers ───────────────────────────────────────────────────────────────────

/** Parse "Name of Contact=3/4" → { name, connection, loyalty }. */
function parseContactArg(
  raw: string,
): { name: string; connection: number; loyalty: number } | null {
  const eqIdx = raw.lastIndexOf("=");
  if (eqIdx === -1) return null;
  const name = raw.slice(0, eqIdx).trim();
  const rest = raw.slice(eqIdx + 1).trim();
  const slashIdx = rest.indexOf("/");
  if (slashIdx === -1) return null;
  const connection = parseInt(rest.slice(0, slashIdx).trim(), 10);
  const loyalty    = parseInt(rest.slice(slashIdx + 1).trim(), 10);
  return { name, connection, loyalty };
}

/** Case-insensitive index search. Returns -1 if not found. */
function findContactIdx(contacts: ICharContact[], name: string): number {
  const lower = name.toLowerCase();
  return contacts.findIndex((c) => c.name.toLowerCase() === lower);
}

function formatContactList(contacts: ICharContact[], owner: string): string {
  const W  = 78;
  const hr = "=".repeat(W);
  const lines = [
    `%ch${hr}%cn`,
    `%ch  CONTACTS: ${owner.toUpperCase()}%cn`,
    `%ch${hr}%cn`,
  ];

  if (contacts.length === 0) {
    lines.push("  (no contacts)");
  } else {
    lines.push(`  ${"Name".padEnd(30)} ${"Conn".padEnd(6)} ${"Loy".padEnd(6)} BP`);
    lines.push("  " + "-".repeat(W - 2));
    for (const c of contacts) {
      lines.push(
        `  ${c.name.padEnd(30)} %ch${String(c.connection).padEnd(6)}%cn ${String(c.loyalty).padEnd(6)} ${contactBP(c)}`,
      );
    }
    lines.push("  " + "-".repeat(W - 2));
    lines.push(`  ${contacts.length} contact(s) — ${contactsBP(contacts)} BP total`);
  }

  lines.push(`%ch${hr}%cn`);
  return lines.join("%r");
}

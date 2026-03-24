// ─── +pay command ─────────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "./db.ts";
import { validateTransfer } from "./sr4/nuyen.ts";
import type { INuyenLogEntry } from "./types.ts";

const MAX_LOG_DISPLAY = 20;

addCmd({
  name: "+pay",
  pattern: /^\+pay(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+pay[/<switch>] [<args>]  — Transfer nuyen or view transaction history.

Switches:
  /set <player>=<amount>   [Staff] Set a player's nuyen directly.
  /log                     Show your last ${MAX_LOG_DISPLAY} transactions.

  Without a switch: transfer nuyen to another player.
  Format: +pay <player>=<amount> [<reason>]

Examples:
  +pay Fixer Mike=500               Pay Mike 500¥.
  +pay Fixer Mike=1200 Gear split   Pay with a reason note.
  +pay/set Alice=50000              Set Alice's nuyen to 50,000¥ (staff only).
  +pay/log                          Show your nuyen log.`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const raw = u.util.stripSubs(u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":    return await transferNuyen(u, raw);
      case "set": return await setNuyen(u, raw);
      case "log": return await showLog(u);
      default:
        u.send(`Unknown switch "/${sw}". See %ch+help pay%cn.`);
    }
  },
});

// ── transfer ──────────────────────────────────────────────────────────────────

async function transferNuyen(u: IUrsamuSDK, raw: string): Promise<void> {
  // Format: "<player>=<amount> [reason]"
  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +pay <player>=<amount> [reason]"); return; }

  const playerArg = raw.slice(0, eqIdx).trim();
  const rest      = raw.slice(eqIdx + 1).trim();

  // Split rest on first space: amount [reason]
  const spaceIdx = rest.indexOf(" ");
  const amtStr   = spaceIdx === -1 ? rest : rest.slice(0, spaceIdx);
  const reason   = spaceIdx === -1 ? undefined : rest.slice(spaceIdx + 1).trim().slice(0, 200) || undefined;
  const amount   = parseInt(amtStr, 10);

  const sender = await getChar(u.me.id);
  if (!sender) { u.send("You have no character sheet."); return; }

  const err = validateTransfer(sender.nuyen, amount);
  if (err) { u.send(err); return; }

  const target = await u.util.target(u.me, playerArg, true);
  if (!target) { u.send(`Player "${playerArg}" not found.`); return; }
  if (target.id === u.me.id) { u.send("You cannot pay yourself."); return; }

  const recipient = await getChar(target.id);
  if (!recipient) { u.send(`${target.name ?? playerArg} has no character sheet.`); return; }

  const senderName    = u.me.name ?? "Unknown";
  const recipientName = target.name ?? playerArg;
  const now           = Date.now();

  // Deduct from sender
  sender.nuyen -= amount;
  const sentEntry: INuyenLogEntry = { timestamp: now, delta: -amount, counterparty: recipientName, reason };
  sender.nuyenLog.push(sentEntry);
  await saveChar(sender);

  // Credit recipient
  recipient.nuyen += amount;
  const recvEntry: INuyenLogEntry = { timestamp: now, delta: amount, counterparty: senderName, reason };
  recipient.nuyenLog.push(recvEntry);
  await saveChar(recipient);

  u.send(`Transferred %ch${amount.toLocaleString()}¥%cn to ${recipientName}. Balance: %ch${sender.nuyen.toLocaleString()}¥%cn`);
  u.send(`%ch${senderName}%cn transferred ${amount.toLocaleString()}¥ to you.${reason ? ` (${reason})` : ""}`, target.id);
}

// ── set (admin) ───────────────────────────────────────────────────────────────

async function setNuyen(u: IUrsamuSDK, raw: string): Promise<void> {
  if (!u.me.flags.has("admin") && !u.me.flags.has("wizard") && !u.me.flags.has("superuser")) {
    u.send("Only staff can set nuyen directly.");
    return;
  }

  const eqIdx = raw.indexOf("=");
  if (eqIdx === -1) { u.send("Usage: +pay/set <player>=<amount>"); return; }

  const playerArg = raw.slice(0, eqIdx).trim();
  const amtStr    = raw.slice(eqIdx + 1).trim();
  const amount    = parseInt(amtStr, 10);

  if (!Number.isInteger(amount) || amount < 0) {
    u.send("Amount must be a non-negative integer.");
    return;
  }

  const target = await u.util.target(u.me, playerArg, true);
  if (!target) { u.send(`Player "${playerArg}" not found.`); return; }

  const char = await getChar(target.id);
  if (!char) { u.send(`${target.name ?? playerArg} has no character sheet.`); return; }

  const staffName = u.me.name ?? "Staff";
  const delta     = amount - char.nuyen;
  char.nuyen      = amount;

  const entry: INuyenLogEntry = {
    timestamp: Date.now(),
    delta,
    counterparty: "Staff",
    reason: `Set by ${staffName}`,
  };
  char.nuyenLog.push(entry);
  await saveChar(char);

  u.send(`${target.name ?? playerArg}'s nuyen set to %ch${amount.toLocaleString()}¥%cn.`);
}

// ── log ───────────────────────────────────────────────────────────────────────

async function showLog(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("You have no character sheet."); return; }

  const log = (char.nuyenLog ?? [])
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_LOG_DISPLAY);

  if (log.length === 0) {
    u.send("No nuyen transactions recorded.");
    return;
  }

  const lines = [`%ch  Nuyen Log (last ${MAX_LOG_DISPLAY})%cn  Current: %ch${char.nuyen.toLocaleString()}¥%cn`];
  for (const e of log) {
    const date    = new Date(e.timestamp).toISOString().slice(0, 10);
    const sign    = e.delta >= 0 ? "%cg+" : "%cr";
    const reset   = "%cn";
    const party   = e.counterparty ? `  [${e.counterparty}]` : "";
    const why     = e.reason ? `  ${e.reason}` : "";
    lines.push(`  ${date}  ${sign}${Math.abs(e.delta).toLocaleString()}¥${reset}${party}${why}`);
  }
  u.send(lines.join("%r"));
}

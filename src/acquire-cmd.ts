// ─── +acquire command ─────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import {
  availabilityTier,
  acquisitionThreshold,
  acquisitionPool,
  validateAvailability,
} from "./sr4/availability.ts";
import { contactAcquisitionBonus } from "./sr4/contacts.ts";
import { appendRollLog } from "./rolllog-db.ts";

addCmd({
  name: "+acquire",
  pattern: /^\+acquire\s+(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+acquire <item>=<availability>[/<contact>]  — Roll an acquisition test for an item.

  Pool: Negotiation + Charisma [+ contact Connection if named].
  Threshold: ceil(availability / 2). Interval: 1 day per roll.
  Staff adjudicates final availability and price.

Examples:
  +acquire Ares Predator IV=6              Standard pistol (avail 6, no contact).
  +acquire Lined Coat=8/Fixer             Restricted armor via Fixer contact.
  +acquire Ares Alpha=14/Fixer            Forbidden assault rifle — needs a contact.`,

  exec: async (u: IUrsamuSDK) => {
    const raw = u.util.stripSubs(u.cmd.args[0] ?? "").trim();

    // Parse: <item>=<availability>[/<contact>]
    const eqIdx = raw.lastIndexOf("=");
    if (eqIdx === -1) {
      u.send("Usage: %ch+acquire <item>=<availability>[/<contact>]%cn");
      return;
    }

    const item    = raw.slice(0, eqIdx).trim();
    const rest    = raw.slice(eqIdx + 1).trim();
    const slashIdx = rest.indexOf("/");

    const availStr    = slashIdx === -1 ? rest : rest.slice(0, slashIdx).trim();
    const contactName = slashIdx === -1 ? "" : rest.slice(slashIdx + 1).trim();
    const avail       = parseInt(availStr, 10);

    const availErr = validateAvailability(avail);
    if (availErr) { u.send(availErr); return; }
    if (!item)     { u.send("Item name cannot be empty."); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const tier      = availabilityTier(avail);
    const threshold = acquisitionThreshold(avail);

    // Resolve optional contact for bonus dice
    let contactBonus = 0;
    let contactNote  = "";
    if (contactName) {
      const contact = (char.contacts ?? []).find(
        (c) => c.name.toLowerCase() === contactName.toLowerCase(),
      );
      if (!contact) {
        u.send(`No contact named "%ch${contactName}%cn" found. Check %ch+contact%cn.`);
        return;
      }
      contactBonus = contactAcquisitionBonus(contact);
      contactNote  = ` + ${contact.name} Connection ${contact.connection}`;
    }

    const negotiation = char.skills["Negotiation"]?.rating ?? 0;
    const charisma    = char.attrs["Charisma"] ?? 1;
    const pool        = acquisitionPool(negotiation, charisma, contactBonus);
    const result      = rollPool(pool);
    const name        = u.util.displayName(u.me, u.me);

    const tierColor = tier === "standard"
      ? "%cg"
      : tier === "restricted"
      ? "%cy"
      : "%cr";

    const outcome = result.hits >= threshold
      ? `%cgSuccess%cn (${result.hits} hits ≥ threshold ${threshold}) — item sourced in one day`
      : `%cyPartial%cn (${result.hits} hits < threshold ${threshold}) — continue searching (${result.hits}/${threshold})`;

    const msg = [
      `%ch${name}%cn acquires %ch${item}%cn (Avail ${avail} — ${tierColor}${tier}%cn, threshold ${threshold}):`,
      `  Pool: %ch${pool}%cn (Negotiation ${negotiation} + Charisma ${charisma}${contactNote})`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${outcome}`,
    ].join("%r");

    u.send(msg);
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold, success: result.hits >= threshold,
    }).catch(() => {});
  },
});

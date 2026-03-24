// ─── +legwork, +favor commands ────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar } from "./db.ts";
import { rollPool } from "./sr4/dice.ts";
import {
  legworkPool,
  contactWilling,
  validateFavorRating,
  validateLegworkThreshold,
} from "./sr4/contacts.ts";
import { appendRollLog } from "./rolllog-db.ts";

// ── +legwork ──────────────────────────────────────────────────────────────────

addCmd({
  name: "+legwork",
  pattern: /^\+legwork\s+(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+legwork <contact>=<topic>/<threshold>  — Roll a legwork extended test via a contact.

  Contact provides Connection dice on top of your Charisma.
  Gather information up to the threshold over multiple rolls (each roll = 1 hour).

Examples:
  +legwork Fixer=corp security layout/4    Ask your Fixer about corp security (threshold 4).
  +legwork Street Doc=black market meds/3  Ask Street Doc about black-market meds (threshold 3).`,

  exec: async (u: IUrsamuSDK) => {
    const raw = u.util.stripSubs(u.cmd.args[0] ?? "").trim();

    // Parse: <ContactName>=<topic>/<threshold>
    const eqIdx = raw.lastIndexOf("=");
    if (eqIdx === -1) {
      u.send("Usage: %ch+legwork <contact>=<topic>/<threshold>%cn");
      return;
    }

    const contactName = raw.slice(0, eqIdx).trim();
    const rest        = raw.slice(eqIdx + 1).trim();
    const slashIdx    = rest.lastIndexOf("/");
    if (slashIdx === -1) {
      u.send("Usage: %ch+legwork <contact>=<topic>/<threshold>%cn");
      return;
    }

    const topic    = rest.slice(0, slashIdx).trim();
    const thresh   = parseInt(rest.slice(slashIdx + 1).trim(), 10);

    const threshErr = validateLegworkThreshold(thresh);
    if (threshErr) { u.send(threshErr); return; }
    if (!topic)    { u.send("Topic cannot be empty."); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const contact = (char.contacts ?? []).find(
      (c) => c.name.toLowerCase() === contactName.toLowerCase(),
    );
    if (!contact) {
      u.send(`No contact named "%ch${contactName}%cn" found. Check %ch+contact%cn.`);
      return;
    }

    const charisma = char.attrs["Charisma"] ?? 1;
    const pool     = legworkPool(charisma, contact);
    const result   = rollPool(pool);
    const name     = u.util.displayName(u.me, u.me);

    const outcome = result.hits >= thresh
      ? `%cgSuccess%cn (${result.hits} hits ≥ threshold ${thresh}) — information gathered`
      : `%cyPartial%cn (${result.hits} hits < threshold ${thresh}) — continue next hour`;

    const msg = [
      `%ch${name}%cn runs legwork via %ch${contact.name}%cn on "${topic}" (threshold ${thresh}):`,
      `  Pool: %ch${pool}%cn (Charisma ${charisma} + Connection ${contact.connection})`,
      `  Dice: [${result.dice.join(", ")}] — Hits: %ch${result.hits}%cn`,
      `  ${outcome}`,
    ].join("%r");

    u.send(msg);
    appendRollLog({
      playerId: u.me.id, playerName: name, timestamp: Date.now(),
      pool, dice: result.dice, hits: result.hits,
      glitch: result.glitch, critGlitch: result.critGlitch, edgeUsed: false,
      threshold: thresh, success: result.hits >= thresh,
    }).catch(() => {});
  },
});

// ── +favor ────────────────────────────────────────────────────────────────────

addCmd({
  name: "+favor",
  pattern: /^\+favor\s+(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+favor <contact>=<rating> <request>  — Request a favor from a contact.

  Rating 1 (minor errand) to 6 (major risk). Contact's Loyalty sets willingness ceiling.
  Staff sees the request logged and adjudicates the outcome.

Examples:
  +favor Fixer=2 safe house for one night      Minor ask — Fixer spots you a safe house.
  +favor Street Samurai=4 backup on a run      Significant ask — back-up on a run.`,

  exec: async (u: IUrsamuSDK) => {
    const raw = u.util.stripSubs(u.cmd.args[0] ?? "").trim();

    // Parse: <ContactName>=<rating> <request>
    const eqIdx = raw.indexOf("=");
    if (eqIdx === -1) {
      u.send("Usage: %ch+favor <contact>=<rating> <request>%cn");
      return;
    }

    const contactName = raw.slice(0, eqIdx).trim();
    const afterEq     = raw.slice(eqIdx + 1).trim();
    const spIdx       = afterEq.indexOf(" ");

    if (spIdx === -1) {
      u.send("Usage: %ch+favor <contact>=<rating> <request>%cn");
      return;
    }

    const rating  = parseInt(afterEq.slice(0, spIdx).trim(), 10);
    const request = afterEq.slice(spIdx + 1).trim();

    const ratingErr = validateFavorRating(rating);
    if (ratingErr) { u.send(ratingErr); return; }
    if (!request)  { u.send("Request description cannot be empty."); return; }

    const char = await getChar(u.me.id);
    if (!char) { u.send("No character sheet."); return; }
    if (char.chargenState !== "approved") { u.send("Character must be approved."); return; }

    const contact = (char.contacts ?? []).find(
      (c) => c.name.toLowerCase() === contactName.toLowerCase(),
    );
    if (!contact) {
      u.send(`No contact named "%ch${contactName}%cn" found. Check %ch+contact%cn.`);
      return;
    }

    if (!contactWilling(contact, rating)) {
      u.send(
        `%ch${contact.name}%cn (Loyalty ${contact.loyalty}) is unwilling to take a ` +
        `favor-${rating} risk. Try a lower-rated request or build your relationship.`,
      );
      return;
    }

    const name = u.util.displayName(u.me, u.me);
    u.send(
      `%ch${name}%cn requests from %ch${contact.name}%cn (Loyalty ${contact.loyalty}, ` +
      `Connection ${contact.connection}) — Favor rating %ch${rating}%cn:%r` +
      `  "${request}"%r` +
      `  %cyLogged for staff adjudication.%cn`,
    );
  },
});

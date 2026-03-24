// ─── Chargen staff actions (approve / reset) ──────────────────────────────────

import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar, chars } from "../db.ts";
import { calcBP, BP_TOTAL } from "./bp.ts";
import { jobs } from "@ursamu/jobs-plugin";

/** +chargen/approve <player> — Staff: approve character and close CGEN job. */
export async function approveChargen(u: IUrsamuSDK, arg: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Permission denied."); return; }

  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: +chargen/approve <player>"); return; }

  const target = await u.util.target(u.me, name, true);
  if (!target) { u.send(`Player "${name}" not found.`); return; }

  const char = await getChar(target.id);
  if (!char) { u.send(`${target.name} has no character sheet.`); return; }
  if (char.chargenState === "approved") { u.send(`${target.name} is already approved.`); return; }

  char.chargenState = "approved";
  await saveChar(char);

  // Close the CGEN job if one exists
  if (char.jobId) {
    const jobResults = await jobs.find({ id: char.jobId });
    const job = jobResults[0];
    if (job) {
      await jobs.update({ id: char.jobId }, {
        ...job,
        status: "closed",
        closedByName: u.me.name ?? "Staff",
        updatedAt: Date.now(),
      });
    }
  }

  u.send(`%ch%cg${target.name}%cn%ch's character approved.%cn (${calcBP(char)}/${BP_TOTAL} BP)`);
  u.send(`%ch%cgYour character has been approved!%cn Welcome to the shadows, ${target.name}. Type +sheet to view your sheet.`, target.id);
}

/** +chargen/reset <player> — Staff: return character to draft for revision. */
export async function resetChargen(u: IUrsamuSDK, arg: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Permission denied."); return; }

  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: +chargen/reset <player>"); return; }

  const target = await u.util.target(u.me, name, true);
  if (!target) { u.send(`Player "${name}" not found.`); return; }

  const char = await getChar(target.id);
  if (!char) { u.send(`${target.name} has no character sheet.`); return; }

  char.chargenState = "draft";
  await saveChar(char);

  u.send(`%ch${target.name}%cn's character reset to draft.`);
  u.send(`%ch%cyYour character has been returned to draft by staff.%cn Use +chargen to continue editing.`, target.id);
}

/** +chargen/wipe <player> — Staff: completely delete a character record. */
export async function wipeChargen(u: IUrsamuSDK, arg: string): Promise<void> {
  const isAdmin = u.me.flags.has("admin") || u.me.flags.has("wizard") || u.me.flags.has("superuser");
  if (!isAdmin) { u.send("Permission denied."); return; }

  const name = u.util.stripSubs(arg).trim();
  if (!name) { u.send("Usage: +chargen/wipe <player>"); return; }

  const target = await u.util.target(u.me, name, true);
  if (!target) { u.send(`Player "${name}" not found.`); return; }

  const char = await getChar(target.id);
  if (!char) { u.send(`${target.name} has no character sheet.`); return; }

  await chars.delete({ id: char.id });
  u.send(`%ch%cr${target.name}%cn's character sheet permanently deleted.`);
}

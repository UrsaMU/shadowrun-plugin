// ─── Chargen submit — opens CGEN job via jobs-plugin ──────────────────────────

import type { IUrsamuSDK } from "@ursamu/ursamu";
import { getChar, saveChar } from "../db.ts";
import { validateSubmit, calcBP, BP_TOTAL } from "./bp.ts";

// Loose import — if jobs-plugin is not installed this will throw at module load,
// which is intentional: the CGEN workflow requires the jobs system.
import { jobs, getNextJobNumber } from "@ursamu/jobs-plugin";

/** +chargen/submit — Validate draft and open a CGEN job for staff review. */
export async function submitChargen(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) { u.send("No character in progress. Use +chargen/metatype to start."); return; }
  if (char.chargenState === "submitted") {
    u.send("Your character is already submitted and awaiting staff review.");
    return;
  }
  if (char.chargenState === "approved") {
    u.send("Your character is already approved! Type +sheet to view it.");
    return;
  }

  const errors = validateSubmit(char);
  if (errors.length > 0) {
    u.send(`%ch%crCharacter sheet has errors:%cn%r` + errors.map((e) => `  • ${e}`).join("%r"));
    return;
  }

  const jobNum = await getNextJobNumber();
  const jobId  = `job-${jobNum}`;
  const bp     = calcBP(char);

  const summary = [
    `Metatype: ${char.metatype}  (${bp}/${BP_TOTAL} BP)`,
    `Skills:   ${Object.keys(char.skills).length} active skill(s)`,
    `Qualities: ${char.qualities.filter((q) => q.type === "positive").length} positive, ${char.qualities.filter((q) => q.type === "negative").length} negative`,
    `Nuyen:    ${char.nuyen.toLocaleString()}¥`,
  ].join("\n");

  await jobs.create({
    id: jobId,
    number: jobNum,
    title: `Chargen: ${char.playerName}`,
    bucket: "CGEN",
    status: "new",
    submittedBy: `#${char.playerId}`,
    submitterName: char.playerName,
    description: `Character generation submission.\n\n${summary}\n\nPlease review with +sheet ${char.playerName} and approve with +chargen/approve ${char.playerName}.`,
    comments: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  char.chargenState = "submitted";
  char.jobId = jobId;
  await saveChar(char);

  u.send(`%ch%cgChargen submitted!%cn Job #${jobNum} opened for staff review. You will be notified when approved.`);
}

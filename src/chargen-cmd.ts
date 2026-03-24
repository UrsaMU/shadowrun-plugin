// ─── +chargen command ─────────────────────────────────────────────────────────

import { addCmd } from "@ursamu/ursamu";
import type { IUrsamuSDK } from "@ursamu/ursamu";
import { formatDraft, newCharPrompt } from "./chargen/display.ts";
import { setMetatype, setAttr, setSkill } from "./chargen/attrs.ts";
import { addQuality, removeQuality, setResources } from "./chargen/qualities.ts";
import { submitChargen } from "./chargen/submit.ts";
import { approveChargen, resetChargen, wipeChargen } from "./chargen/staff.ts";
import { setTradition, addSpell, removeSpell } from "./chargen/magic.ts";
import { addAdeptPower, removeAdeptPower } from "./chargen/adept.ts";
import { getChar } from "./db.ts";

addCmd({
  name: "+chargen",
  pattern: /^\+chargen(?:\/(\S+))?\s*(.*)/i,
  lock: "connected",
  category: "Shadowrun",
  help: `+chargen[/<switch>] [<arg>]  — Shadowrun character generation.

Switches:
  /metatype <type>            Set metatype (Human, Elf, Dwarf, Ork, Troll).
  /attr <Attr>=<value>        Purchase an attribute to the given value.
  /skill <Skill>=<N>[:<Spec>] Purchase an active skill, optionally with spec.
  /quality <Quality>          Add a positive or negative quality.
  /quality/remove <Quality>   Remove a quality from your draft.
  /resources <nuyen>          Set starting nuyen (multiples of 5,000¥).
  /tradition <type>           Set magical tradition (requires Magician quality).
  /spell <Name>               Add a known spell (3 BP each; requires tradition).
  /spell/remove <Name>        Remove a spell from your draft.
  /submit                     Submit character for staff approval.
  /approve <player>           [Staff] Approve a character.
  /reset <player>             [Staff] Return a character to draft.
  /wipe <player>              [Staff] Permanently delete a character record.

Examples:
  +chargen                              View your current draft and BP totals.
  +chargen/metatype Elf                 Set metatype to Elf (30 BP).
  +chargen/attr Agility=5               Set Agility to 5.
  +chargen/skill Pistols=4:Semi-Auto    Buy Pistols 4 with Semi-Auto spec.
  +chargen/quality Lucky                Add the Lucky quality (20 BP).
  +chargen/quality/remove Lucky         Remove Lucky from draft.
  +chargen/resources 50000              Set 50,000¥ starting nuyen (10 BP).
  +chargen/tradition Hermetic           Set Hermetic tradition.
  +chargen/spell Manabolt               Add Manabolt (3 BP).
  +chargen/spell/remove Manabolt        Remove Manabolt from draft.
  +chargen/submit                       Submit draft for staff approval.`,
  exec: async (u: IUrsamuSDK) => {
    const sw  = (u.cmd.args[0] ?? "").toLowerCase().trim();
    const arg = (u.cmd.args[1] ?? "").trim();

    switch (sw) {
      case "":               return displayChargen(u);
      case "metatype":       return setMetatype(u, arg);
      case "attr":           return setAttr(u, arg);
      case "skill":          return setSkill(u, arg);
      case "quality":        return addQuality(u, arg);
      case "quality/remove": return removeQuality(u, arg);
      case "resources":      return setResources(u, arg);
      case "tradition":      return setTradition(u, arg);
      case "spell":          return addSpell(u, arg);
      case "spell/remove":   return removeSpell(u, arg);
      case "power":          return addAdeptPower(u, arg);
      case "power/remove":   return removeAdeptPower(u, arg);
      case "submit":         return submitChargen(u);
      case "approve":        return approveChargen(u, arg);
      case "reset":          return resetChargen(u, arg);
      case "wipe":           return wipeChargen(u, arg);
      default:
        u.send(`Unknown switch "/${sw}". Type +help +chargen for options.`);
    }
  },
});

async function displayChargen(u: IUrsamuSDK): Promise<void> {
  const char = await getChar(u.me.id);
  if (!char) {
    u.send(newCharPrompt());
    return;
  }
  u.send(formatDraft(char));
}

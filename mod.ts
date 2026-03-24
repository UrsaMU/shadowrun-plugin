/**
 * @module @ursamu/shadowrun-plugin
 * @description Shadowrun 4th Edition 20th Anniversary plugin for UrsaMU.
 *
 * Provides: +chargen, +sheet, +roll, +damage commands.
 * Requires: @ursamu/jobs-plugin (for CGEN chargen approval workflow).
 *
 * Install by placing in src/plugins/shadowrun/ or via plugin manifest.
 * The "CGEN" job bucket is registered automatically on init.
 */

export type { IShadowrunChar, ICharSkill, ICharQuality, ChargenState, CharAttr } from "./src/types.ts";
export { chars, getChar, saveChar } from "./src/db.ts";
export { METATYPES, getMetatype, racialBaseAttrs } from "./src/sr4/metatypes.ts";
export { ACTIVE_SKILLS, resolveSkill } from "./src/sr4/skills.ts";
export { QUALITIES, resolveQuality } from "./src/sr4/qualities.ts";
export { rollPool, rollEdge, summarize, physBoxes, stunBoxes } from "./src/sr4/dice.ts";
export { calcBP, validateSubmit } from "./src/chargen/bp.ts";
export { default } from "./src/index.ts";

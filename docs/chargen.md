# Character Generation

> SR4A 400 Build Point system. Draft a character, submit for staff review,
> and receive approval before entering play.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+chargen` | `+chargen[/<switch>] [<arg>]` | connected | Character generation (400 BP) |
| `+sheet` | `+sheet [<player>]` | connected | View character sheet |

## +chargen switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/metatype` | `Human\|Elf\|Dwarf\|Ork\|Troll` | Set metatype (applies racial attribute adjustments) |
| `/attr` | `<Attr>=<value>` | Purchase an attribute (cost: 10 BP per point above racial minimum) |
| `/skill` | `<Skill>=<N>[:<Spec>]` | Purchase an active skill + optional specialization |
| `/quality` | `<Quality>` | Add a positive or negative quality |
| `/quality/remove` | `<Quality>` | Remove a quality from your current draft |
| `/resources` | `<nuyen>` | Set starting nuyen (must be a multiple of 5,000¥) |
| `/tradition` | `<type>` | Set magical tradition (requires Magician quality) |
| `/spell` | `<Name>` | Add a known spell (3 BP each; requires Magician quality) |
| `/spell/remove` | `<Name>` | Remove a spell from your draft |
| `/submit` | — | Submit the draft for staff review (opens a CGEN job) |
| `/approve` | `<player>` | **[Staff]** Approve the character and move to active |
| `/reset` | `<player>` | **[Staff]** Return the character to draft status |
| `/wipe` | `<player>` | **[Staff]** Delete the character record entirely |

## BP Cost Table (SR4A p. 85)

| Item | BP Cost |
|------|---------|
| Metatype | 0–40 BP (racial adjustment; Humans 0, Trolls 40) |
| Attribute +1 above racial minimum | 10 BP each |
| Active skill rank | 4 BP each |
| Skill specialization | +2 BP |
| Positive quality | Listed BP value (35 BP cap total) |
| Negative quality | −Listed BP value (35 BP max refund) |
| 5,000¥ starting nuyen | 1 BP (max 250,000¥ / 50 BP) |
| Known spell | 3 BP each |
| Native language | Free |
| Additional language rank | 2 BP per rating point |

## Metatypes

| Metatype | Extra BP | Racial Attribute Adjustments |
|----------|----------|------------------------------|
| Human | 0 | None |
| Elf | 30 | AGI+1, CHA+2 |
| Dwarf | 25 | BOD+2, STR+2, WIL+1; low-light vision |
| Ork | 20 | BOD+3, STR+2 |
| Troll | 40 | BOD+4, AGI−1, STR+4, CHA−2; natural armor +1 |

## Qualities

Positive qualities cost BP; negative qualities refund BP. Total positive
quality spend and total negative quality refund are each capped at **35 BP**.

Use `+chargen` (no switch) to see your current draft with remaining BP.

## Magical Characters

1. Purchase the **Magician** quality first.
2. Set tradition with `/tradition hermetic` or `/tradition shaman`.
3. Add spells with `/spell <Name>` (3 BP each).
4. Magic attribute is set with `/attr Magic=<N>` like any other attribute.

## Technomancers

Purchase the **Technomancer** quality. No tradition required. Use
`/attr Resonance=<N>` instead of Magic.

## Jobs Integration

When you run `+chargen/submit`, a job is automatically opened in the **CGEN**
bucket. Staff can review your sheet with `+sheet <player>` and approve with
`+chargen/approve <player>`. The CGEN job closes automatically on approval.

## Examples

```
+chargen/metatype Elf          Set metatype to Elf (costs 30 BP)
+chargen/attr Body=4           Purchase Body 4
+chargen/skill Pistols=4       Buy Pistols at rank 4
+chargen/skill Pistols=4:Colts Buy Pistols 4 with Colts specialization
+chargen/quality Analytical Mind
+chargen/quality Allergy (Common, Mild)
+chargen/resources 50000       Set starting nuyen to 50,000¥
+chargen/tradition hermetic    Set hermetic mage tradition
+chargen/spell Fireball        Add Fireball to spell list
+chargen/submit                Submit for staff review
+chargen/approve Alice         [Staff] Approve Alice's character
```

# Vehicles & Drones

> Vehicle management, rigging, pilot tests, and gunnery for SR4A.

## Commands

| Command | Syntax | Lock | Description |
|---------|--------|------|-------------|
| `+vehicle` | `+vehicle[/<switch>] [<args>]` | connected | View and manage vehicles |
| `+pilot` | `+pilot <threshold>` | connected | Roll a pilot test |
| `+gunnery` | `+gunnery <threshold>` | connected | Roll a gunnery test |

---

## Vehicles

Vehicle records are created and maintained by staff. Players can view their
registered vehicles and their damage status.

### +vehicle switches

| Switch | Arg | Description |
|--------|-----|-------------|
| `/catalogue` | — | Browse the full vehicle catalogue |
| `/add` | `<Name>=<type>` | **[Staff]** Register a vehicle to a player |
| `/remove` | `<Name>` | **[Staff]** Remove a vehicle record |
| `/damage` | `<Name>=<n>` | **[Staff]** Apply physical damage boxes (range: −50..50) |

```
+vehicle                   List your registered vehicles
+vehicle/catalogue         Browse all vehicles in the catalogue
+vehicle/add Yamaha Rapier=motorcycle    [Staff] Register a bike
+vehicle/remove Yamaha Rapier           [Staff] Remove it
+vehicle/damage Yamaha Rapier=3         [Staff] Apply 3 damage boxes
```

---

## Pilot Tests

`+pilot` reads your Pilot skill + relevant attribute from the sheet and rolls
against the given threshold.

Threshold range: **1–20** (values outside this range are rejected).

```
+pilot 3     Roll Pilot (reads your sheet) vs threshold 3
+pilot 5     Roll Pilot vs threshold 5
```

---

## Gunnery Tests

`+gunnery` reads your Gunnery skill + relevant attribute and rolls against
the given threshold.

Threshold range: **1–20**.

```
+gunnery 3   Roll Gunnery vs threshold 3
+gunnery 6   Roll Gunnery vs threshold 6
```

---

## Rigger Notes

Full rigger control (jumping in, VR bonuses, drone autonomy) is not yet
automated. Staff can manually adjust dice pools and track drone damage via
`+vehicle/damage`. AR rigging modifications are on the roadmap.

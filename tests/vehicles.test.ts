// ─── Vehicle pure function tests (SR4A pp. 286–328) ────────────────────────────

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import {
  VEHICLE_CATALOGUE,
  lookupVehicle,
  vehicleCmBoxes,
  pilotPool,
  gunneryPool,
  hasControlRig,
  vehicleResistPool,
} from "../src/sr4/vehicles.ts";
import type { IVehicle } from "../src/types.ts";
import { mockChar } from "./helpers/mockU.ts";

// ── vehicleCmBoxes() ──────────────────────────────────────────────────────────

describe("vehicleCmBoxes()", () => {
  it("Body 1 → ceil(0.5)+8 = 9",   () => assertEquals(vehicleCmBoxes(1),  9));
  it("Body 2 → ceil(1)+8 = 9",     () => assertEquals(vehicleCmBoxes(2),  9));
  it("Body 3 → ceil(1.5)+8 = 10",  () => assertEquals(vehicleCmBoxes(3), 10));
  it("Body 8 → 4+8 = 12",          () => assertEquals(vehicleCmBoxes(8), 12));
  it("Body 16 → 8+8 = 16",         () => assertEquals(vehicleCmBoxes(16), 16));
  it("Body 12 → 6+8 = 14",         () => assertEquals(vehicleCmBoxes(12), 14));
});

// ── pilotPool() ───────────────────────────────────────────────────────────────

describe("pilotPool()", () => {
  it("Pilot 3 + Reaction 3 = 6",   () => assertEquals(pilotPool(3, 3), 6));
  it("Pilot 0 + Reaction 4 = 4",   () => assertEquals(pilotPool(0, 4), 4));
  it("Pilot 5 + Reaction 2 = 7",   () => assertEquals(pilotPool(5, 2), 7));
  it("Pilot 1 + Reaction 1 = 2",   () => assertEquals(pilotPool(1, 1), 2));
});

// ── gunneryPool() ─────────────────────────────────────────────────────────────

describe("gunneryPool()", () => {
  it("Gunnery 4 + Agility 3 = 7",  () => assertEquals(gunneryPool(4, 3), 7));
  it("Gunnery 0 + Sensor 4 = 4",   () => assertEquals(gunneryPool(0, 4), 4));
  it("Gunnery 6 + Agility 6 = 12", () => assertEquals(gunneryPool(6, 6), 12));
  it("Gunnery 2 + Sensor 3 = 5",   () => assertEquals(gunneryPool(2, 3), 5));
});

// ── vehicleResistPool() ───────────────────────────────────────────────────────

describe("vehicleResistPool()", () => {
  it("Body 8 + Armor 3 = 11",   () => assertEquals(vehicleResistPool(8, 3), 11));
  it("Body 16 + Armor 8 = 24",  () => assertEquals(vehicleResistPool(16, 8), 24));
  it("Body 1 + Armor 0 = 1",    () => assertEquals(vehicleResistPool(1, 0), 1));
  it("Body 12 + Armor 12 = 24", () => assertEquals(vehicleResistPool(12, 12), 24));
});

// ── hasControlRig() ───────────────────────────────────────────────────────────

describe("hasControlRig()", () => {
  it("no implants → false", () =>
    assertEquals(hasControlRig([]), false));

  it("control rig present → true", () =>
    assertEquals(hasControlRig([{ name: "Control Rig" }]), true));

  it("case-insensitive match", () =>
    assertEquals(hasControlRig([{ name: "control rig" }]), true));

  it("unrelated implants → false", () =>
    assertEquals(hasControlRig([{ name: "Wired Reflexes 2" }, { name: "Datajack" }]), false));

  it("control rig among others → true", () =>
    assertEquals(
      hasControlRig([{ name: "Wired Reflexes 1" }, { name: "Control Rig" }, { name: "Datajack" }]),
      true,
    ));
});

// ── VEHICLE_CATALOGUE ─────────────────────────────────────────────────────────

describe("VEHICLE_CATALOGUE", () => {
  it("has at least 10 vehicles", () =>
    assertEquals(VEHICLE_CATALOGUE.length >= 10, true));

  it("all entries have valid type", () => {
    const validTypes = ["ground", "air", "water", "drone"];
    for (const v of VEHICLE_CATALOGUE) {
      assertEquals(validTypes.includes(v.type), true, `${v.name} has invalid type`);
    }
  });

  it("no duplicate names", () => {
    const names = VEHICLE_CATALOGUE.map((v) => v.name.toLowerCase());
    assertEquals(new Set(names).size, names.length);
  });

  it("all entries have valid numeric stats", () => {
    for (const v of VEHICLE_CATALOGUE) {
      assertEquals(typeof v.handling, "number", `${v.name} handling`);
      assertEquals(typeof v.accel,    "number", `${v.name} accel`);
      assertEquals(typeof v.speed,    "number", `${v.name} speed`);
      assertEquals(typeof v.pilot,    "number", `${v.name} pilot`);
      assertEquals(typeof v.body,     "number", `${v.name} body`);
      assertEquals(typeof v.armor,    "number", `${v.name} armor`);
      assertEquals(typeof v.sensor,   "number", `${v.name} sensor`);
    }
  });

  it("all entries have non-empty descriptions", () => {
    for (const v of VEHICLE_CATALOGUE) {
      assertEquals(v.description.length > 0, true, `${v.name} has no description`);
    }
  });

  it("contains Ford Americar (common ground vehicle)", () => {
    const v = lookupVehicle("Ford Americar");
    assertEquals(v?.name, "Ford Americar");
    assertEquals(v?.type, "ground");
  });

  it("contains Steel Lynx (heavy drone)", () => {
    const v = lookupVehicle("Steel Lynx");
    assertEquals(v?.type, "drone");
    assertEquals(v !== null, true);
  });

  it("contains at least one air vehicle", () => {
    assertEquals(VEHICLE_CATALOGUE.some((v) => v.type === "air"), true);
  });

  it("contains at least one water vehicle", () => {
    assertEquals(VEHICLE_CATALOGUE.some((v) => v.type === "water"), true);
  });

  it("contains at least one drone", () => {
    assertEquals(VEHICLE_CATALOGUE.some((v) => v.type === "drone"), true);
  });
});

// ── lookupVehicle() ───────────────────────────────────────────────────────────

describe("lookupVehicle()", () => {
  it("finds by exact name",          () => assertEquals(lookupVehicle("Ford Americar")?.name, "Ford Americar"));
  it("case-insensitive match",       () => assertEquals(lookupVehicle("ford americar")?.name, "Ford Americar"));
  it("returns null for unknown",     () => assertEquals(lookupVehicle("HoverTank 9000"), null));
  it("returns full stats object",    () => {
    const v = lookupVehicle("Ford Americar");
    assertEquals(v?.body,  8);
    assertEquals(v?.armor, 3);
    assertEquals(v?.pilot, 2);
  });
});

// ── IVehicle schema ───────────────────────────────────────────────────────────

describe("IVehicle schema", () => {
  it("all required fields present", () => {
    const v: IVehicle = {
      id:          crypto.randomUUID(),
      name:        "TestCar",
      type:        "ground",
      handling:    3,
      accel:       2,
      speed:       3,
      pilot:       2,
      body:        8,
      armor:       3,
      sensor:      2,
      physicalDmg: 0,
      ownerId:     "player-1",
    };
    assertEquals(v.type, "ground");
    assertEquals(v.physicalDmg, 0);
    assertEquals(typeof v.id, "string");
  });
});

// ── mockChar vehicle defaults ─────────────────────────────────────────────────

describe("mockChar vehicle defaults", () => {
  it("vehicles field is optional (undefined without normalizeChar)", () => {
    const char = mockChar();
    assertEquals(char.vehicles === undefined || Array.isArray(char.vehicles), true);
  });
});

// ── CM consistency for catalogue vehicles ────────────────────────────────────

describe("vehicleCmBoxes consistency with catalogue", () => {
  it("Ford Americar (Body 8) → CM 12", () => {
    const v = lookupVehicle("Ford Americar")!;
    assertEquals(vehicleCmBoxes(v.body), 12);
  });

  it("Steel Lynx (Body 12) → CM 14", () => {
    const v = lookupVehicle("Steel Lynx")!;
    assertEquals(vehicleCmBoxes(v.body), 14);
  });

  it("GMC Bulldog (Body 16) → CM 16", () => {
    const v = lookupVehicle("GMC Bulldog")!;
    assertEquals(vehicleCmBoxes(v.body), 16);
  });
});

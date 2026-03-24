// ─── Vehicle rules (SR4A pp. 286–328) ─────────────────────────────────────────

export type VehicleType = "ground" | "air" | "water" | "drone";

export interface IVehicleEntry {
  name: string;
  type: VehicleType;
  handling: number;
  accel: number;
  speed: number;
  pilot: number;
  body: number;
  armor: number;
  sensor: number;
  description: string;
}

// ── Sample vehicle catalogue ───────────────────────────────────────────────────
// SR4A pp. 290–308 (representative selection)

export const VEHICLE_CATALOGUE: IVehicleEntry[] = [
  // Ground vehicles
  { name: "Eurocar Westwind 2000", type: "ground", handling: 5, accel: 4, speed: 6, pilot: 3, body: 8, armor: 6, sensor: 2, description: "High-performance sports car" },
  { name: "Ford Americar",         type: "ground", handling: 3, accel: 2, speed: 3, pilot: 2, body: 8, armor: 3, sensor: 1, description: "Common mid-range sedan" },
  { name: "GMC Bulldog",           type: "ground", handling: 2, accel: 2, speed: 3, pilot: 2, body: 16, armor: 8, sensor: 2, description: "Heavy-duty security van" },
  { name: "Harley-Davidson Scorpion", type: "ground", handling: 4, accel: 3, speed: 5, pilot: 2, body: 6, armor: 3, sensor: 1, description: "Street motorcycle" },
  { name: "Yamaha Growler",        type: "ground", handling: 4, accel: 2, speed: 4, pilot: 2, body: 6, armor: 3, sensor: 1, description: "Off-road dirt bike" },
  // Air vehicles
  { name: "Federated Boeing Commuter", type: "air", handling: 3, accel: 3, speed: 5, pilot: 3, body: 20, armor: 6, sensor: 3, description: "Personal VTOL aircraft" },
  { name: "Hughes Airstar",        type: "air", handling: 3, accel: 3, speed: 4, pilot: 3, body: 12, armor: 4, sensor: 2, description: "Mid-range helicopter" },
  // Water vehicles
  { name: "Samuvette Piranha",     type: "water", handling: 4, accel: 3, speed: 4, pilot: 2, body: 8, armor: 4, sensor: 2, description: "Fast attack speedboat" },
  // Drones
  { name: "Aztechnology Crawler", type: "drone", handling: 3, accel: 1, speed: 2, pilot: 3, body: 3, armor: 2, sensor: 3, description: "Ground surveillance drone" },
  { name: "Horizon Flying Eye",   type: "drone", handling: 4, accel: 2, speed: 4, pilot: 3, body: 1, armor: 0, sensor: 4, description: "Air surveillance micro-drone" },
  { name: "MCT Fly-Spy",         type: "drone", handling: 4, accel: 2, speed: 3, pilot: 3, body: 1, armor: 0, sensor: 4, description: "Stealth reconnaissance UAV" },
  { name: "Steel Lynx",          type: "drone", handling: 3, accel: 2, speed: 3, pilot: 3, body: 12, armor: 12, sensor: 2, description: "Heavy combat drone" },
];

/** Look up a vehicle catalogue entry by case-insensitive name. */
export function lookupVehicle(name: string): IVehicleEntry | null {
  const lower = name.toLowerCase();
  return VEHICLE_CATALOGUE.find((v) => v.name.toLowerCase() === lower) ?? null;
}

// ── Vehicle Condition Monitor ──────────────────────────────────────────────────

/**
 * Vehicle CM boxes = ceil(Body / 2) + 8.
 * SR4A p. 312.
 */
export function vehicleCmBoxes(body: number): number {
  return Math.ceil(body / 2) + 8;
}

// ── Pilot test ────────────────────────────────────────────────────────────────

/**
 * Pilot test pool = Pilot skill + Reaction.
 * Threshold depends on maneuver difficulty (set by gamemaster).
 */
export function pilotPool(pilotSkill: number, reaction: number): number {
  return pilotSkill + reaction;
}

/**
 * Gunnery test pool = Gunnery skill + targeting attribute.
 * Targeting attribute is usually Agility (manual) or Sensor (drone).
 */
export function gunneryPool(gunnerySkill: number, targetAttr: number): number {
  return gunnerySkill + targetAttr;
}

/**
 * Rigger jump-in: requires Control Rig implant.
 * While jumped in, rigger uses vehicle as their body; add Control Rig rating to all vehicle tests.
 */
export function hasControlRig(implants: Array<{ name: string }>): boolean {
  return implants.some((i) => i.name.toLowerCase() === "control rig");
}

/**
 * Vehicle damage resistance pool = Body + Armor.
 * SR4A p. 311.
 */
export function vehicleResistPool(body: number, armor: number): number {
  return body + armor;
}

/**
 * L1 FIX: Validate a pilot/gunnery threshold (1–20, integer).
 * Rejects out-of-range values to prevent meaningless or DoS rolls.
 */
export function validatePilotThreshold(threshold: number): string | null {
  if (!Number.isInteger(threshold) || threshold < 1) return "Threshold must be a positive integer.";
  if (threshold > 20) return "Threshold cannot exceed 20.";
  return null;
}

/**
 * L1 FIX: Validate a vehicle damage value (-50..50, integer).
 * Rejects extreme values that would produce nonsensical UX.
 */
export function validateVehicleDamage(dmg: number): string | null {
  if (!Number.isInteger(dmg)) return "Damage must be an integer.";
  if (dmg < -50 || dmg > 50) return "Damage must be between -50 and 50.";
  return null;
}

// ─── Test helpers — mock IUrsamuSDK and IDBObj ────────────────────────────────

import type { IUrsamuSDK } from "@ursamu/ursamu";
import type { IShadowrunChar } from "../../src/types.ts";

/** Minimal IDBObj-compatible shape used by tests. */
export interface IDBObj {
  id: string;
  name?: string;
  flags: Set<string>;
  state: Record<string, unknown>;
  location?: string;
  contents: unknown[];
}

export function mockPlayer(overrides: Partial<IDBObj> = {}): IDBObj {
  return {
    id: "1",
    name: "TestPlayer",
    flags: new Set(["player", "connected"]),
    state: {},
    location: "0",
    contents: [],
    ...overrides,
  };
}

export function mockAdmin(overrides: Partial<IDBObj> = {}): IDBObj {
  return mockPlayer({ flags: new Set(["player", "connected", "admin"]), ...overrides });
}

export type MockU = IUrsamuSDK & {
  _sent: string[];
  _dbCalls: unknown[][];
};

export function mockU(opts: {
  me?: Partial<IDBObj>;
  args?: string[];
  targetResult?: IDBObj | null;
  canEditResult?: boolean;
  charRecord?: IShadowrunChar | null;
  charSaveSpy?: (c: IShadowrunChar) => void;
} = {}): MockU {
  const sent: string[]       = [];
  const dbCalls: unknown[][] = [];

  const u = {
    me:   mockPlayer(opts.me ?? {}),
    here: {
      ...mockPlayer({ id: "0", name: "Lobby", flags: new Set(["room"]) }),
      broadcast: () => {},
    },
    cmd: {
      name: "",
      original: "",
      args: opts.args ?? [],
      switches: [],
    },
    send: (m: string, _target?: string) => sent.push(m),
    broadcast: () => {},
    canEdit: async () => opts.canEditResult ?? true,
    teleport: () => {},
    execute: () => {},
    force: () => {},
    forceAs: async () => {},
    checkLock: async () => true,
    setFlags: async () => {},
    trigger: async () => {},
    eval: async () => "",
    state: {},
    db: {
      search: async () => [],
      create: async (d: unknown) => ({ ...(d as object), id: "99", flags: new Set(), contents: [] }),
      modify: async (...a: unknown[]) => { dbCalls.push(a); },
      destroy: async () => {},
    },
    util: {
      target: async () => opts.targetResult ?? null,
      displayName: (o: IDBObj) => o.name ?? "Unknown",
      stripSubs: (s: string) => s.replace(/%c[a-z]/gi, "").replace(/%[rntb]/gi, ""),
      center:  (s: string) => s,
      ljust:   (s: string, w: number) => s.padEnd(w),
      rjust:   (s: string, w: number) => s.padStart(w),
      sprintf: (f: string) => f,
    },
    attr:   { get: async () => null },
    auth:   { verify: async () => false, login: async () => {}, hash: async () => "", setPassword: async () => {} },
    sys:    { setConfig: async () => {}, disconnect: async () => {}, uptime: async () => 0, reboot: async () => {}, shutdown: async () => {}, update: async () => {}, gameTime: async () => ({ year: 2072, month: 6, day: 15, hour: 8, minute: 0 }), setGameTime: async () => {} },
    chan:   { join: async () => {}, leave: async () => {}, list: async () => [], create: async () => {}, destroy: async () => {}, set: async () => {}, history: async () => [] },
    bb:     { listBoards: async () => [], listPosts: async () => [], readPost: async () => null, newPostCount: async () => 0, totalNewCount: async () => 0, markRead: async () => {}, post: async () => {}, editPost: async () => {}, deletePost: async () => {}, createBoard: async () => {}, destroyBoard: async () => {} },
    text:   { read: async () => "", set: async () => {} },
    events: { emit: async () => {}, on: async () => "" },
  } as unknown as MockU;

  Object.assign(u, { _sent: sent, _dbCalls: dbCalls });
  return u;
}

/** Build a minimal approved character for test purposes. */
export function mockChar(overrides: Partial<IShadowrunChar> = {}): IShadowrunChar {
  return {
    id: "char-1",
    playerId: "1",
    playerName: "TestPlayer",
    metatype: "Human",
    attrs: { Body: 3, Agility: 3, Reaction: 3, Strength: 3, Charisma: 3, Intuition: 3, Logic: 3, Willpower: 3, Edge: 2 },
    skills: {},
    qualities: [],
    contacts: [],
    karmaAvailable: 0,
    karmaTotal: 0,
    karmaLog: [],
    firstAidApplied: false,
    gear: [],
    nuyenLog: [],
    armorRating: 0,
    armorImpact: 0,
    recoilComp: 0,
    recoilAccum: 0,
    implants: [],
    essence: 6,
    initDiceBonus: 0,
    spells: [],
    magicLoss: 0,
    astrally: false,
    spirits: [],
    adeptPowers: [],
    nuyen: 0,
    physicalDmg: 0,
    stunDmg: 0,
    chargenState: "approved",
    initiationGrade: 0,
    submersionGrade: 0,
    metamagics: [],
    streetCred: 0,
    notoriety: 0,
    publicAwareness: 0,
    lifestyle: "low" as const,
    knowledgeSkills: {},
    languages: {},
    ...overrides,
  };
}

/** Build a minimal draft character. */
export function mockDraft(overrides: Partial<IShadowrunChar> = {}): IShadowrunChar {
  return mockChar({ chargenState: "draft", ...overrides });
}

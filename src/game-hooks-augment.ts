// ─── Shadowrun gameHooks event types ─────────────────────────────────────────
//
// Declares the payload shapes for cross-plugin events emitted by this plugin.
// Callers use `as never` casts when passing to gameHooks.emit/on because
// declaration merging across separate JSR packages is not reliable at runtime.
// Import these interfaces wherever you need to type-assert the event payload.

/** Payload emitted on gameHooks after every successful +roll or +roll/edge. */
export interface ISrRollEvent {
  /** Player who rolled. */
  playerId: string;
  playerName: string;
  /** Room where the roll was made — used by ai-gm to find the watched round. */
  roomId: string;
  /** Number of dice in the pool. */
  pool: number;
  /** Total hits (dice showing 5 or 6). */
  hits: number;
  glitch: boolean;
  critGlitch: boolean;
  edgeUsed: boolean;
  /** Threshold the player was rolling against, if provided. */
  threshold?: number;
  /** True = hits ≥ threshold; undefined = no threshold given. */
  success?: boolean;
}

/**
 * Payload emitted on gameHooks when the shadowrun plugin seeds its game
 * system definition. ai-gm listens and calls registerGameSystem(system).
 * The system object is structurally compatible with IStoredGameSystem in
 * ai-gm/systems/store.ts — no cross-package import required.
 */
export interface ISrSystemRegisterEvent {
  // deno-lint-ignore no-explicit-any
  system: Record<string, any>;
}

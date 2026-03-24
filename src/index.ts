// ─── Shadowrun plugin entry point ─────────────────────────────────────────────

import "./commands.ts";
import { gameHooks, registerPluginRoute } from "@ursamu/ursamu";
import type { IPlugin, SessionEvent } from "@ursamu/ursamu";
import { registerJobBuckets } from "@ursamu/jobs-plugin";
import { getChar } from "./db.ts";
import { seedSr4GameSystem } from "./sr4-game-system.ts";

// Named reference required for remove() to off() the same function.
const onLogin = async ({ actorId, actorName }: SessionEvent): Promise<void> => {
  const char = await getChar(actorId);
  if (!char || char.chargenState !== "draft") return;
  // Send a reminder via gameHooks emit so it lands in the next tick
  // after the session is fully established.
  await gameHooks.emit("shadowrun:chargen-reminder" as never, { actorId, actorName } as never);
};

import { routeHandler } from "./routes.ts";

const shadowrunPlugin: IPlugin = {
  name: "shadowrun",
  version: "0.1.0",
  description: "Shadowrun 4E — chargen, dice, condition monitors.",
  dependencies: [{ name: "jobs", version: ">=1.0.0" }],

  init: async () => {
    // Register the CGEN bucket for chargen submissions.
    registerJobBuckets(["CGEN"]);

    gameHooks.on("player:login", onLogin);
    registerPluginRoute("/api/v1/shadowrun", routeHandler);

    // Seed SR4 system into the shared ai-gm DBO and emit gm:system:register
    // so a running ai-gm instance picks it up without a restart.
    await seedSr4GameSystem();

    console.log("[shadowrun] Initialized — +chargen/+sheet/+roll/+damage active.");
    return true;
  },

  remove: () => {
    gameHooks.off("player:login", onLogin);
    // REST route /api/v1/shadowrun persists until restart.
  },
};

export default shadowrunPlugin;

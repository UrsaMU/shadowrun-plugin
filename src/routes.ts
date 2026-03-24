// ─── Shadowrun REST route handler ─────────────────────────────────────────────
// GET /api/v1/shadowrun/char/<playerId>
//   Auth:     Bearer JWT required
//   Response: 200 { data: IShadowrunChar }
//             401 Unauthorized
//             403 Forbidden (own unapproved char, or other player's char)
//             404 Not Found
//             405 Method Not Allowed (non-GET)

import { chars } from "./db.ts";

export const routeHandler = async (req: Request, userId: string | null): Promise<Response> => {
  // H2: Reject all non-GET methods up-front.
  if (req.method !== "GET") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  // All other methods require authentication.
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url      = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  // Expected path: /api/v1/shadowrun/char/<playerId>
  const targetId = segments[4] ?? userId;

  // H1: Only allow a player to read their own character via REST.
  // Staff review happens in-game via +sheet; the REST endpoint is self-only.
  if (targetId !== userId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const results = await chars.find({ playerId: targetId });
  const char    = results[0];
  if (!char) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ data: char });
};

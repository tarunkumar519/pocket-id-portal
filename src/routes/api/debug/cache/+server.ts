import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { CacheService } from "$lib/services/cache-service";

export const GET: RequestHandler = async ({ url }) => {
  const action = url.searchParams.get("action");

  if (action === "clear") {
    CacheService.clearAll();
    return json({ message: "Cache cleared successfully" });
  }

  if (action === "stats") {
    const stats = CacheService.getStats();
    return json(stats);
  }

  return json({
    message: "No action specified. Use ?action=clear or ?action=stats",
  });
};

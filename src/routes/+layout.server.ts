import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const publicRoutes = ["/login", "/callback", "/api"];

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const pathname = url.pathname;
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // The auth check is now done in hooks.server.ts to avoid redundancy
  // This function just provides layout data

  // If it's a private route and there's no auth, hooks.server.ts should have already redirected
  // This is just a safety check
  if (!isPublicRoute && !locals.isAuthenticated) {
    console.log("Layout server load: user not authenticated, redirecting");
    throw redirect(303, `/login?returnUrl=${encodeURIComponent(pathname)}`);
  }

  return {
    isPublicRoute,
    user: locals.user || null,
    isAuthenticated: locals.isAuthenticated || false,
  };
};

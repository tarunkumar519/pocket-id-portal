import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const publicRoutes = ["/login", "/callback", "/api"];

export const load: LayoutServerLoad = async ({ url, locals }) => {
  const pathname = url.pathname;
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Safety check: redirect unauthenticated users from private routes
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

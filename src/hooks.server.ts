// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { auth } from "$lib/stores/auth.store";
import { UserService } from "$lib/services/user-service";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/callback", "/api"];

export const handle: Handle = async ({ event, resolve }) => {
  // Skip auth for public routes or static assets
  if (
    event.url.pathname.startsWith("/login") ||
    event.url.pathname.startsWith("/callback") ||
    event.url.pathname.startsWith("/api") ||
    event.url.pathname.startsWith("/favicon") ||
    event.url.pathname.startsWith("/_app")
  ) {
    return await resolve(event);
  }

  try {
    // Get user ID from cookies
    const userId = UserService.getUserIdFromCookies(event.cookies);

    // Check for auth cookies
    const authUserCookie = event.cookies.get("auth_user");
    const authTokenCookie = event.cookies.get("auth_token");

    // If we have both cookies and a userId, user is authenticated
    if (userId && authUserCookie && authTokenCookie) {
      try {
        const user = JSON.parse(authUserCookie);
        const tokens = JSON.parse(authTokenCookie);

        // Set auth data to locals for access in load functions
        event.locals.user = user;
        event.locals.tokens = tokens;
        event.locals.isAuthenticated = true;
        event.locals.userId = userId;
      } catch (e) {
        console.warn("Failed to parse auth cookies:", e);
        event.locals.isAuthenticated = false;
      }
    } else if (userId) {
      // We have a userId but incomplete auth data
      event.locals.userId = userId;
      event.locals.isAuthenticated = false;
    } else {
      // No auth data found
      event.locals.isAuthenticated = false;
    }
  } catch (error) {
    console.error("Error in auth hook:", error);
    event.locals.isAuthenticated = false;
  }

  // If the user is not authenticated and not on a public route, redirect to login
  if (
    !event.locals.isAuthenticated &&
    !event.url.pathname.startsWith("/login") &&
    !event.url.pathname.startsWith("/callback") &&
    !event.url.pathname.startsWith("/api") &&
    !event.url.pathname.startsWith("/_app")
  ) {
    console.log(
      `Redirecting unauthenticated user from ${event.url.pathname} to login`
    );
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?returnUrl=${encodeURIComponent(event.url.pathname)}`,
      },
    });
  }

  return await resolve(event);
};

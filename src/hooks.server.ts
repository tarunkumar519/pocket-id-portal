// src/hooks.server.ts
import type { Handle } from "@sveltejs/kit";
import { UserService } from "$lib/services/user-service";

const publicRoutes = ["/login", "/callback", "/api", "/favicon", "/_app"];

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublic) {
    return resolve(event);
  }

  try {
    const userId = UserService.getUserIdFromCookies(event.cookies);
    const authUserCookie = event.cookies.get("auth_user");
    const authTokenCookie = event.cookies.get("auth_token");

    if (userId && authUserCookie && authTokenCookie) {
      try {
        const user = JSON.parse(authUserCookie);
        const tokens = JSON.parse(authTokenCookie);

        event.locals.user = user;
        event.locals.tokens = tokens;
        event.locals.isAuthenticated = true;
        event.locals.userId = userId;
      } catch (e) {
        console.warn("Failed to parse auth cookies:", e);
        event.locals.isAuthenticated = false;
      }
    } else if (userId) {
      event.locals.userId = userId;
      event.locals.isAuthenticated = false;
    } else {
      event.locals.isAuthenticated = false;
    }
  } catch (error) {
    console.error("Error in auth hook:", error);
    event.locals.isAuthenticated = false;
  }

  if (!event.locals.isAuthenticated && !isPublic) {
    console.log(`Redirecting unauthenticated user from ${pathname} to login`);
    return new Response(null, {
      status: 302,
      headers: {
        location: `/login?returnUrl=${encodeURIComponent(pathname)}`,
      },
    });
  }

  return resolve(event);
};

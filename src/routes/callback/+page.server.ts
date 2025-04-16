import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { exchangeCodeForTokens, getUserInfo, storeAuthState } from "$lib/auth";
import { env } from "$env/dynamic/public";
import { env as privateEnv } from "$env/dynamic/private";

export const load: PageServerLoad = async ({ url, cookies }) => {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return { success: false, error };
  }

  if (!state) {
    return { success: false, error: "Invalid state" };
  }

  if (!code) {
    return { success: false, error: "No authorization code" };
  }

  try {
    const clientId = env.PUBLIC_OIDC_CLIENT_ID;
    const clientSecret = privateEnv.OIDC_CLIENT_SECRET;
    const redirectUri = env.PUBLIC_APP_URL
      ? `${env.PUBLIC_APP_URL}/callback`
      : `${url.origin}/callback`;

    const tokens = await exchangeCodeForTokens(
      code,
      clientId || "",
      clientSecret || "",
      redirectUri
    );

    const userInfo = await getUserInfo(tokens.access_token);

    return {
      success: true,
      tokens,
      userInfo,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Authentication failed",
    };
  }
};

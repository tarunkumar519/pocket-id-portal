import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { POCKET_ID_API_KEY } from "$env/static/private";
import { PUBLIC_OIDC_ISSUER } from "$env/static/public";

export const GET: RequestHandler = async ({
  params,
  request,
  cookies,
  fetch,
}) => {
  try {
    // Get the path from the request
    const path = params.path;

    // Prepare headers with API key from environment
    const headers: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    // Use API key from environment
    if (POCKET_ID_API_KEY) {
      headers["X-API-Key"] = POCKET_ID_API_KEY;
      console.log("Using API key for authentication");
    }
    // Fallback to token auth if no API key
    else {
      const authCookie = cookies.get("auth_token");

      if (!authCookie) {
        console.error(
          "No auth token found in cookies and no API key available"
        );
        return json({ error: "Not authenticated" }, { status: 401 });
      }

      try {
        const authData = JSON.parse(authCookie);
        const accessToken = authData.access_token;

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
          console.log(`Using access token: ${accessToken.substring(0, 10)}...`);
        } else {
          console.error("No access token found in auth cookie");
          return json({ error: "Invalid auth token" }, { status: 401 });
        }
      } catch (e) {
        console.error("Error parsing auth cookie:", e);
        return json({ error: "Invalid auth token format" }, { status: 401 });
      }
    }

    // Forward the request to the actual API
    const apiUrl = `${PUBLIC_OIDC_ISSUER}/api/${path}${
      request.url.includes("?")
        ? request.url.substring(request.url.indexOf("?"))
        : ""
    }`;

    console.log(`Proxying request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      console.error(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
      return json(
        { error: `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

// Update POST handler similarly
export const POST: RequestHandler = async ({
  params,
  request,
  cookies,
  fetch,
}) => {
  try {
    const path = params.path;

    // Prepare headers with API key from environment
    const headers: Record<string, string> = {
      Accept: "*/*",
      "Content-Type": "application/json",
    };

    // Use API key from environment
    if (POCKET_ID_API_KEY) {
      headers["X-API-Key"] = POCKET_ID_API_KEY;
    }
    // Fallback to token auth if no API key
    else {
      const authCookie = cookies.get("auth_token");

      if (!authCookie) {
        return json({ error: "Not authenticated" }, { status: 401 });
      }

      try {
        const authData = JSON.parse(authCookie);
        const accessToken = authData.access_token;

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
          return json({ error: "Invalid auth token" }, { status: 401 });
        }
      } catch (e) {
        return json({ error: "Invalid auth token format" }, { status: 401 });
      }
    }

    // Get the request body
    const body = await request.json();

    const apiUrl = `${PUBLIC_OIDC_ISSUER}/api/${path}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return json(
        { error: `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

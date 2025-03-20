import { error } from "@sveltejs/kit";
import { env } from "$env/dynamic/public";

/** @type {import('./$types').RequestHandler} */
export async function GET({ fetch, setHeaders }) {
  try {
    if (!env.PUBLIC_OIDC_ISSUER) {
      console.error("PUBLIC_OIDC_ISSUER environment variable is not defined");
      throw error(500, "Server configuration error");
    }

    const baseUrl = env.PUBLIC_OIDC_ISSUER.endsWith("/")
      ? env.PUBLIC_OIDC_ISSUER.slice(0, -1)
      : env.PUBLIC_OIDC_ISSUER;

    const response = await fetch(
      `${baseUrl}/api/application-configuration/background-image`,
      {
        headers: {
          Accept: "image/*,application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`API returned error status: ${response.status}`);
      throw error(response.status, "Failed to fetch background image");
    }

    // Get the content type from the original response
    const contentType = response.headers.get("content-type");

    // Forward the content type
    if (contentType) {
      setHeaders({
        "content-type": contentType,
      });
    }

    // Return the response body
    return new Response(await response.arrayBuffer());
  } catch (e) {
    console.error("Error in background image proxy:", e);

    // Return a fallback gradient image
    setHeaders({
      "content-type": "image/svg+xml",
    });

    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#783ca7" stop-opacity="1"/>
          <stop offset="35%" stop-color="#4538bb" stop-opacity="1"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="1"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="1000" fill="url(#grad)"/>
    </svg>`;

    return new Response(fallbackSvg);
  }
}

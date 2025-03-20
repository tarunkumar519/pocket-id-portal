import { env } from "$env/dynamic/public";

/**
 * Service to fetch application configuration details
 */
export class ApplicationConfigurationService {
  /**
   * Fetch the background image URL from the API
   */
  static async fetchBackgroundImage(): Promise<string | null> {
    try {
      // Use our proxy endpoint instead of calling the API directly
      const proxyUrl = "/api/proxy/background-image";
      console.log(`Fetching background image through proxy: ${proxyUrl}`);

      const response = await fetch(proxyUrl);

      if (!response.ok) {
        console.error(`Failed to fetch background image: ${response.status}`);
        return null;
      }

      // Check content type to handle different response types
      const contentType = response.headers.get("content-type") || "";
      console.log(`Received response with content type: ${contentType}`);

      if (contentType.includes("application/json")) {
        // If JSON, extract URL
        const data = await response.json();
        console.log("Received JSON data:", data);
        return data?.backgroundImageUrl || null;
      } else if (contentType.includes("image/")) {
        // If direct image, create object URL
        console.log("Received direct image data");
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } else {
        // Try to create a blob URL anyway as fallback
        console.log("Unknown content type, trying to create blob URL");
        try {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch (e) {
          console.error("Failed to create blob URL:", e);
          return null;
        }
      }
    } catch (error) {
      console.error("Error fetching background image:", error);
      return null;
    }
  }
}

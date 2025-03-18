/**
 * Generates all standard OIDC endpoints from a base issuer URL
 * This simplifies configuration to require only the issuer URL
 */
export function generateOidcEndpoints(issuerUrl: string) {
  // Remove trailing slash if present
  const baseUrl = issuerUrl.endsWith("/") ? issuerUrl.slice(0, -1) : issuerUrl;

  return {
    issuer: baseUrl,
    authorizationEndpoint: `${baseUrl}/authorize`,
    tokenEndpoint: `${baseUrl}/api/oidc/token`,
    userinfoEndpoint: `${baseUrl}/api/oidc/userinfo`,
    jwksUri: `${baseUrl}/.well-known/jwks.json`,
  };
}

/**
 * Gets the appropriate logo URL from the issuer
 */
export function getLogoUrl(
  issuerUrl: string,
  clientId: string | null = null,
  lightMode: boolean = false,
) {
  const baseUrl = issuerUrl.endsWith("/") ? issuerUrl.slice(0, -1) : issuerUrl;

  if (clientId) {
    return `${baseUrl}/api/oidc/clients/${clientId}/logo`;
  } else {
    return `${baseUrl}/api/application-configuration/logo?light=${lightMode}`;
  }
}

/**
 * Creates a URL to the account management page in the OIDC provider
 */
export function getAccountManagementUrl(issuerUrl: string) {
  const baseUrl = issuerUrl.endsWith("/") ? issuerUrl.slice(0, -1) : issuerUrl;
  return `${baseUrl}/settings/account`;
}

/**
 * Builds standard OIDC logout URL with a redirect back to the application
 */
export function buildLogoutUrl(
  issuerUrl: string,
  idToken: string | null,
  redirectUri: string,
) {
  const baseUrl = issuerUrl.endsWith("/") ? issuerUrl.slice(0, -1) : issuerUrl;
  const logoutUrl = `${baseUrl}/api/oidc/end-session`;

  let url = `${logoutUrl}?post_logout_redirect_uri=${encodeURIComponent(redirectUri)}`;

  // Add ID token hint if available
  if (idToken) {
    url += `&id_token_hint=${encodeURIComponent(idToken)}`;
  }

  return url;
}

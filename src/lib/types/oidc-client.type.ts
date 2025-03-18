export interface OIDCClient {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
  grant_types: string[];
  response_types: string[];
  client_name: string;
  client_uri?: string;
  logo_uri?: string;
  scope: string;
  contacts?: string[];
  tos_uri?: string;
  policy_uri?: string;
  jwks_uri?: string;
  jwks?: object;
  software_id?: string;
  software_version?: string;
}

/**
 * Type definition for API Key
 */
export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used?: string;
  expires_at?: string;
  scopes?: string[];
}

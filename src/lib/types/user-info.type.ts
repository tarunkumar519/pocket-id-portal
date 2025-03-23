export interface UserInfo {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  email?: string;
  email_verified?: boolean;
  zoneinfo?: string;
  locale?: string;
  updated_at?: number;
}

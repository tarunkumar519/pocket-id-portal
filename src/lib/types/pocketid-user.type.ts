export interface PocketIdUser {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  userGroups: string[];
  ldapId: string;
  locale: string;
  customClaims: string[];
  isAdmin?: boolean;
}

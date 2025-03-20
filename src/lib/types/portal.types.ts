import type { UserGroup } from "./user-group.type";

export interface ClientResponse {
  data: Client[];
}

export interface Client {
  id: string;
  client_id: string;
  name: string;
  description: string;
  isPublic?: boolean;
  hasLogo?: boolean;
  logoUrl?: string | null;
  icon?: string | null;
  last_used?: string | Date;
  logoError?: boolean;
  accessGroups?: string[];
  restrictedAccess?: boolean;
  hasAccess?: boolean;
  callback_urls?: string[]; // Add this property to match what's used in ClientCard.svelte
  dashboardUrl?: string; // Added for dashboard-specific URLs
}

export interface PageServerData {
  clients: ClientResponse;
  userGroups: UserGroup[];
  status: "success" | "error";
  error: string | null;
}

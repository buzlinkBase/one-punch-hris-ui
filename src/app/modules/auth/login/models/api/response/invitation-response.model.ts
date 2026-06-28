export type InvitationStatus = "Pending" | "Accepted" | "Rejected";

export interface InvitationResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userId: string;
  tenantId: string;
  tenantName: string;
  email: string;
  token: string;
  expiry: string;
  status: InvitationStatus;
  role: string;
}

export type ClientStatus = "ACTIVE" | "INACTIVE";

export type ClientDeactivationReason = "UNPAID_DUES";

export interface ClientResponse {
  id: string;
  clientCode: string;
  clientName: string;
  contactPerson: string;
  contactNumber: string;
  email: string;
  address: string;
  unpaidDues: number;
  status: ClientStatus;
  deactivationReason?: ClientDeactivationReason;
  deactivatedAt?: string;
}

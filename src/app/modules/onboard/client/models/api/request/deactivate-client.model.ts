import type { ClientDeactivationReason } from "../response/client-response.model";

export interface DeactivateClient {
  id: string;
  deactivationReason: ClientDeactivationReason;
}

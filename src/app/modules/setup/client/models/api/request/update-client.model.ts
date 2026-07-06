import type { CreateClient } from "./create-client.model";

export interface UpdateClient extends CreateClient {
  id: string;
}

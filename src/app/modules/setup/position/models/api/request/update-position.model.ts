import type { CreatePosition } from "./create-position.model";

export interface UpdatePosition extends CreatePosition {
  id: string;
}

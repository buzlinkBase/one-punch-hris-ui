import type { CreatePermission } from './create-permission.model';

export interface UpdatePermission extends CreatePermission {
  id: string;
}

import type { PermissionAction } from "../response/permission-response.model";

export interface CreatePermission {
  code: string;
  name: string;
  module: string;
  action: PermissionAction;
  description: string;
  status: string;
}

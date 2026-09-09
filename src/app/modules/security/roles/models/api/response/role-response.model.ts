import type { PermissionResponse } from "@/app/modules/security/permissions/models/api/response/permission-response.model";

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
  permissions: PermissionResponse[];
}

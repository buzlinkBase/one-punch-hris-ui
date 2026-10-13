export interface Permission {
  id: string;
  /** The system the permission belongs to (hrms, procurement, ...). Absent from older API builds = hrms. */
  product?: string;
  module: string;
  feature: string;
  action: string;
  code: string;
  description: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  permission: Permission;
}

export interface Role {
  id: string;
  /** null = System Role (Owner/Admin/Member/Employee); set = this tenant's Custom Role. */
  tenantId: string | null;
  name: string;
  description: string;
  isSystemRole: boolean;
  /** null = spans systems (Owner, Admin, ... and roles created before systems existed). */
  product?: string | null;
  rolePermissions: RolePermission[];
}

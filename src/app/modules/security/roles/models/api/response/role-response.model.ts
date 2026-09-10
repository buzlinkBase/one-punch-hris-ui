export interface Permission {
  id: string;
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
  rolePermissions: RolePermission[];
}

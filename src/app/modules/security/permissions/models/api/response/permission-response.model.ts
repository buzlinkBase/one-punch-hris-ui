export interface PermissionResponse {
  id: string;
  /** The system the permission belongs to (hrms, procurement, ...). Absent from older API builds = hrms. */
  product?: string;
  module: string;
  feature: string;
  action: string;
  code: string;
  description: string;
}

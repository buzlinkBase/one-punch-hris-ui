export type PermissionAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'APPROVE'
  | 'REJECT';

export interface PermissionResponse {
  id: string;
  code: string;
  name: string;
  module: string;
  action: PermissionAction;
  description: string;
  status: string;
}

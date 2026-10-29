import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { ATTENDANCE_LOG_PERMISSIONS } from "../constants/attendance-log-permissions.const";
import { useCompanyClosed } from "@/app/modules/billing/hooks/use-company-closed";

export interface AttendanceLogActions {
  canEdit: boolean;
  canDelete: boolean;
}

const NONE: AttendanceLogActions = { canEdit: false, canDelete: false };

/**
 * What the caller may do to a log of a given source -- each source has its own edit/delete
 * permission (Owner always may). Subscribes to the auth session so a roles-changed token
 * refresh re-renders the caller. A closed company (read-only, suspended, on hold) may do neither.
 */
export function useAttendanceLogActions(): (
  logSource: string,
) => AttendanceLogActions {
  useAuthUser();
  const closed = useCompanyClosed();
  return (logSource) => {
    const codes = ATTENDANCE_LOG_PERMISSIONS[logSource];
    if (!codes || closed) return NONE;
    return {
      canEdit: authStorage.hasAnyPermission(codes.edit),
      canDelete: authStorage.hasAnyPermission(codes.delete),
    };
  };
}

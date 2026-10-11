import { Alert } from "antd";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { useDataAccess } from "../../hooks/use-data-access";
import type { ConfidentialNoticeClearance } from "./confidential-notice-paths";

interface ConfidentialDataNoticeProps {
  /** What the current screen needs to include confidential employees. */
  clearance: ConfidentialNoticeClearance;
  className?: string;
}

/**
 * Shown on reports, payroll and DTR summaries when confidential employees are hidden from the
 * signed-in user -- the totals leave them out, so the output isn't complete enough to submit.
 * Anyone whose clearance covers the screen sees them, so gets no notice.
 */
export function ConfidentialDataNotice({
  clearance,
  className = "mb-3",
}: ConfidentialDataNoticeProps) {
  useAuthUser(); // re-renders on a roles-changed token refresh
  const { data } = useDataAccess();
  if (!data?.restricted || data.hiddenEmployeeCount === 0) return null;
  if (authStorage.hasConfidentialClearance()) return null;
  if (
    clearance === "operations" &&
    (data.canOperate || authStorage.getConfidentialGrants().operations)
  )
    return null;

  const count = data.hiddenEmployeeCount;
  const employees =
    count === 1
      ? "1 confidential employee is"
      : `${count} confidential employees are`;
  // Spacing sits on a wrapper: antd's own component reset overrides a margin class on the Alert.
  return (
    <div className={className}>
      <Alert
        type="warning"
        showIcon
        className="px-3! py-1! text-xs"
        message={`${employees} excluded. Ask someone with confidential access to generate this for submission.`}
      />
    </div>
  );
}

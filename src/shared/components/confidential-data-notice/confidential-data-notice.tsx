import { Alert } from "antd";
import { useDataAccess } from "../../hooks/use-data-access";

interface ConfidentialDataNoticeProps {
  className?: string;
}

/**
 * Shown on reports, payroll and DTR summaries when confidential employees are hidden from the
 * signed-in user -- the totals leave them out, so the output isn't complete enough to submit.
 */
export function ConfidentialDataNotice({
  className = "mb-6",
}: ConfidentialDataNoticeProps) {
  const { data } = useDataAccess();
  if (!data?.restricted || data.hiddenEmployeeCount === 0) return null;

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
        message={`${employees} excluded from what you see here.`}
        description="Ask someone with access to confidential records to generate this for submission."
      />
    </div>
  );
}

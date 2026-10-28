import { Button, Popconfirm, Tooltip, message } from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import { apiErrorMessage } from "@/core/http/api-error";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useUnreleasePayout } from "../../hooks/use-for-payroll-queries";
import { UNRELEASE_PAYOUT_LABEL } from "../../constants/label.const";

interface UnreleasePayoutButtonProps {
  payrollId: string;
  /** The run type's feature, e.g. "13th Month Run" -- the button needs its Approve action. */
  feature: "13th Month Run" | "Last Pay Run";
  /** What the employee goes back to, shown in the confirmation. */
  description: string;
}

// Withdraws one employee's erroneously released payout so it can be regenerated. Only render it
// for a posted row -- a draft is deleted with its run instead.
export function UnreleasePayoutButton({
  payrollId,
  feature,
  description,
}: UnreleasePayoutButtonProps) {
  const { mutateAsync, isPending } = useUnreleasePayout();

  const handleConfirm = async () => {
    try {
      await mutateAsync(payrollId);
      message.success(UNRELEASE_PAYOUT_LABEL.SUCCESS);
    } catch (err) {
      message.error(apiErrorMessage(err, UNRELEASE_PAYOUT_LABEL.FAILED));
    }
  };

  return (
    <PermissionGate permission={`${feature}:Approve`}>
      <Popconfirm
        title={UNRELEASE_PAYOUT_LABEL.TITLE}
        description={description}
        okText={UNRELEASE_PAYOUT_LABEL.OK}
        okButtonProps={{ danger: true, loading: isPending }}
        onConfirm={handleConfirm}
      >
        <Tooltip title={UNRELEASE_PAYOUT_LABEL.ACTION}>
          <Button
            aria-label={UNRELEASE_PAYOUT_LABEL.ACTION}
            type="text"
            size="small"
            danger
            icon={<RollbackOutlined />}
          />
        </Tooltip>
      </Popconfirm>
    </PermissionGate>
  );
}

import { Button, Popconfirm, Tooltip, message } from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import { apiErrorMessage } from "@/core/http/api-error";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useUnreleaseBatch } from "../../hooks/use-for-payroll-queries";
import { UNRELEASE_BATCH_LABEL } from "../../constants/label.const";

interface UnreleaseBatchButtonProps {
  batchId: string;
  /** The run type's feature, e.g. "13th Month Run" -- the button needs its Approve action. */
  feature: "13th Month Run" | "Last Pay Run";
  /** What the employees go back to, shown in the confirmation. */
  description: string;
}

// Withdraws a whole released run in one command. Only render it for a posted run -- a draft is
// deleted instead.
export function UnreleaseBatchButton({
  batchId,
  feature,
  description,
}: UnreleaseBatchButtonProps) {
  const { mutateAsync, isPending } = useUnreleaseBatch();

  const handleConfirm = async () => {
    try {
      await mutateAsync(batchId);
      message.success(UNRELEASE_BATCH_LABEL.SUCCESS);
    } catch (err) {
      message.error(apiErrorMessage(err, UNRELEASE_BATCH_LABEL.FAILED));
    }
  };

  return (
    <PermissionGate permission={`${feature}:Approve`}>
      <Popconfirm
        title={UNRELEASE_BATCH_LABEL.TITLE}
        description={description}
        okText={UNRELEASE_BATCH_LABEL.OK}
        okButtonProps={{ danger: true, loading: isPending }}
        onConfirm={handleConfirm}
      >
        <Tooltip title={UNRELEASE_BATCH_LABEL.ACTION}>
          <Button
            aria-label={UNRELEASE_BATCH_LABEL.ACTION}
            danger
            size="small"
            icon={<RollbackOutlined />}
            loading={isPending}
          />
        </Tooltip>
      </Popconfirm>
    </PermissionGate>
  );
}

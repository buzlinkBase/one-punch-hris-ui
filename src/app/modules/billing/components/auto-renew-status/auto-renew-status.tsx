import { Alert, Button, Popconfirm } from "antd";
import { AUTO_RENEW_LABEL } from "../../constants/label.const";
import { useTurnOffAutoRenew } from "../../hooks/use-subscription-queries";
import type { AutoRenewResponse } from "../../models/api/response/subscription-response.model";
import { autoRenewSummary } from "../../utils/auto-renew";

interface AutoRenewStatusProps {
  autoRenew: AutoRenewResponse;
  /** Owner or billing admin: may turn it off. */
  canManage: boolean;
  className?: string;
}

/** Where an auto renew stands -- on (and when it charges next), retrying a failed charge, or waiting for
 * its first payment -- with Turn off. */
export function AutoRenewStatus({
  autoRenew,
  canManage,
  className,
}: AutoRenewStatusProps) {
  const turnOff = useTurnOffAutoRenew();
  const summary = autoRenewSummary(autoRenew);

  return (
    <Alert
      className={className}
      type={summary.type}
      showIcon
      message={summary.message}
      action={
        canManage && autoRenew.status !== "Pending" ? (
          <Popconfirm
            title={AUTO_RENEW_LABEL.TURN_OFF}
            description={AUTO_RENEW_LABEL.TURN_OFF_CONFIRM}
            okText={AUTO_RENEW_LABEL.TURN_OFF}
            okButtonProps={{ danger: true }}
            onConfirm={() => turnOff.mutate(autoRenew.target)}
          >
            <Button size="small" loading={turnOff.isPending}>
              {AUTO_RENEW_LABEL.TURN_OFF}
            </Button>
          </Popconfirm>
        ) : undefined
      }
    />
  );
}

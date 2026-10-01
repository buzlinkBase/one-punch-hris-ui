import { Button, Result, Space } from "antd";
import { LockOutlined, LogoutOutlined, SwapOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import type { SubscriptionStatus } from "../../models/api/response/subscription-response.model";

interface CompanyLockedProps {
  companyName: string | null;
  status: SubscriptionStatus | undefined;
  /** Whether the user belongs to other companies they can switch to. */
  canSwitch: boolean;
  onSignOut: () => void;
}

function reason(status: SubscriptionStatus | undefined): string {
  switch (status) {
    case "Suspended":
      return "subscription is suspended";
    case "Canceled":
      return "subscription has been canceled";
    case "Expired":
      return "free trial has ended";
    default:
      return "subscription is no longer active";
  }
}

/**
 * Shown instead of the app to a member of a company whose owner's plan lapsed. The server
 * refuses their requests too; this only says why and offers a way out.
 */
export function CompanyLocked({
  companyName,
  status,
  canSwitch,
  onSignOut,
}: CompanyLockedProps) {
  const navigate = useNavigate();
  const company = companyName ?? "This company";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Result
        icon={<LockOutlined className="text-(--ant-color-text-tertiary)" />}
        title={`${company}'s ${reason(status)}`}
        subTitle="You can't use this company until its owner renews the subscription. Contact them to restore access."
        extra={
          <Space wrap className="justify-center">
            {canSwitch && (
              <Button
                type="primary"
                icon={<SwapOutlined />}
                onClick={() => navigate({ to: "/select-tenant" })}
              >
                Switch company
              </Button>
            )}
            <Button icon={<LogoutOutlined />} onClick={onSignOut}>
              Sign out
            </Button>
          </Space>
        }
      />
    </div>
  );
}

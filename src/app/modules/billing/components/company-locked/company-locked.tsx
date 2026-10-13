import { Button, Result, Space, Typography } from "antd";
import {
  LockOutlined,
  LogoutOutlined,
  PauseCircleOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import type {
  AccessRestriction,
  SubscriptionStatus,
} from "../../models/api/response/subscription-response.model";

interface CompanyLockedProps {
  companyName: string | null;
  status: SubscriptionStatus | undefined;
  /** Set when an operator suspended the account or put it on legal hold. */
  restriction: AccessRestriction | null | undefined;
  /** The owner or a billing admin: the only ones told why an account is restricted. */
  canViewBilling: boolean;
  /** Whether the user belongs to other companies they can switch to. */
  canSwitch: boolean;
  onSignOut: () => void;
}

function lapseReason(status: SubscriptionStatus | undefined): string {
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

const RESTRICTION_STATE: Record<AccessRestriction["kind"], string> = {
  Suspended: "suspended",
  LegalHold: "on hold",
};

/**
 * Shown instead of the app when the company can't be used: either an operator suspended or held
 * the account (everyone, owner included), or the owner's plan lapsed (members only). The server
 * refuses the requests too; this only says what happened, calmly, and offers a way out. The owner
 * is told the reason; members only learn the account is unavailable and whom to ask.
 */
export function CompanyLocked({
  companyName,
  status,
  restriction,
  canViewBilling,
  canSwitch,
  onSignOut,
}: CompanyLockedProps) {
  const navigate = useNavigate();
  const company = companyName ?? "This company";

  const actions = (
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
  );

  if (restriction) {
    const state = RESTRICTION_STATE[restriction.kind];
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Result
          icon={
            <PauseCircleOutlined className="text-(--ant-color-text-tertiary)" />
          }
          title={
            canViewBilling
              ? `Your account is ${state}`
              : `${company} is currently unavailable`
          }
          subTitle={
            canViewBilling
              ? `Access to ${company} and your other companies is paused for everyone on this account.`
              : `This account is ${state}, so access is paused for now. Please contact your company administrator for more information.`
          }
          extra={
            <div className="mx-auto flex max-w-md flex-col items-center gap-5">
              {canViewBilling && (
                <div className="w-full rounded-lg bg-(--ant-color-fill-quaternary) p-4 text-left">
                  <Typography.Text type="secondary" className="text-xs">
                    Reason from Onepunch
                  </Typography.Text>
                  <Typography.Paragraph className="mb-0! mt-1 whitespace-pre-wrap">
                    {restriction.reason ?? "No details were provided."}
                  </Typography.Paragraph>
                </div>
              )}
              {canViewBilling && (
                <Typography.Text type="secondary">
                  If you think this is a mistake or want to resolve it, contact
                  Onepunch support and we&apos;ll help.
                </Typography.Text>
              )}
              {actions}
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Result
        icon={<LockOutlined className="text-(--ant-color-text-tertiary)" />}
        title={`${company}'s ${lapseReason(status)}`}
        subTitle="Access is paused until the company owner settles the subscription. Please contact them and they can restore it right away."
        extra={actions}
      />
    </div>
  );
}

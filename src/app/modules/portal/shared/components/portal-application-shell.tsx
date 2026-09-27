import type { ReactNode } from "react";
import { Alert, Button, Card, Empty, Skeleton, Typography } from "antd";
import { useNavigate } from "@tanstack/react-router";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { ApprovalStatusField } from "@/shared/components/approval-status-field";
import { ApprovalRestartNotice } from "@/shared/components/approval-restart-notice";
import type { PortalFormMode } from "../hooks/use-portal-form-mode";

const { Title } = Typography;

interface PortalApplicationShellProps {
  mode: PortalFormMode;
  /** Page title per mode, e.g. { create: "File Overtime Application", edit: …, view: … }. */
  titles: Record<PortalFormMode, string>;
  subtitle: string;
  /** Portal list route to go back to, e.g. "/portal/overtime". */
  backTo: string;
  applicationType: ApprovalApplicationType;
  /** Edit/view only: the employee's own record, looked up from their list query. */
  record?: { id: string; approvalStatus?: string };
  /** Employee or list data still loading -- shows a skeleton instead of the form. */
  loading: boolean;
  /** No linked Employee record -- nothing can be filed or viewed. */
  noEmployee: boolean;
  /** The form is read-only (view route, or the application is no longer pending). */
  readOnly: boolean;
  /** Skip the wrapping Card, for forms that lay out their own cards. */
  bare?: boolean;
  children: ReactNode;
}

/**
 * Shared frame for the portal's create / edit / view application pages, so each page only
 * supplies its own form. Handles the per-mode title, loading/not-found states, the status field,
 * the read-only and "sends it back to the first approver" notices, and the approval timeline.
 */
export function PortalApplicationShell({
  mode,
  titles,
  subtitle,
  backTo,
  applicationType,
  record,
  loading,
  noEmployee,
  readOnly,
  bare = false,
  children,
}: PortalApplicationShellProps) {
  const navigate = useNavigate();
  const isExisting = mode !== "create";
  const effectiveMode: PortalFormMode = isExisting && readOnly ? "view" : mode;

  const body = () => {
    if (loading) return <Skeleton active paragraph={{ rows: 6 }} />;
    if (noEmployee)
      return (
        <Empty description="No employee profile is linked to your account yet. Contact HR if you believe this is a mistake." />
      );
    if (isExisting && !record)
      return (
        <Empty description="This application wasn't found among your applications.">
          <Button onClick={() => navigate({ to: backTo })}>Back</Button>
        </Empty>
      );

    return (
      <>
        {isExisting && mode === "edit" && readOnly && (
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message="Only applications still awaiting approval can be edited."
          />
        )}
        {isExisting && !readOnly && (
          <ApprovalRestartNotice status={record?.approvalStatus} />
        )}
        {bare ? (
          <>
            {isExisting && (
              <div className="w-50">
                <ApprovalStatusField status={record?.approvalStatus} />
              </div>
            )}
            {children}
          </>
        ) : (
          <Card>
            {isExisting && (
              <div className="w-50">
                <ApprovalStatusField status={record?.approvalStatus} />
              </div>
            )}
            {children}
          </Card>
        )}
        {isExisting && record && (
          <Card size="small" title="Approval Progress" className="mt-4">
            <ApprovalTimeline
              applicationType={applicationType}
              applicationId={record.id}
            />
          </Card>
        )}
      </>
    );
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {titles[effectiveMode]}
            </Title>
            <p className="page-toolbar-subtitle">{subtitle}</p>
          </div>
          {isExisting && (
            <Button onClick={() => navigate({ to: backTo })}>Back</Button>
          )}
        </div>
      </div>

      <div className="form-page-body">{body()}</div>
    </div>
  );
}

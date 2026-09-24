import { useState } from "react";
import {
  Timeline,
  Tag,
  Typography,
  Spin,
  Empty,
  Button,
  Space,
  message,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
  SwapOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useApprovalInstance,
  useReassignApprover,
} from "@/shared/hooks/use-approval-queries";
import { ApprovalReassignModal } from "@/shared/components/approval-reassign-modal/approval-reassign-modal";
import { authStorage } from "@/core/auth/auth-storage";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

const { Text } = Typography;

interface ApprovalTimelineProps {
  applicationType: ApprovalApplicationType;
  applicationId: string | undefined;
  /** Resolves an actor's employee id to a display name — falls back to a shortened id. */
  resolveEmployeeName?: (employeeId: string) => string | undefined;
}

const STATUS_COLOR: Record<string, string> = {
  InProgress: "processing",
  Approved: "success",
  Declined: "error",
  Cancelled: "default",
};

/**
 * Approval progress/history for one application record, shared across all 5 Applications
 * modules' detail pages — see ApprovalActionModal for the matching approve/decline action UI.
 * Renders nothing meaningful (a quiet "no approval history yet" state) when the record predates
 * this engine and was never acted on, since GET /approvals/{type}/{id} 404s in that case.
 */
export function ApprovalTimeline({
  applicationType,
  applicationId,
  resolveEmployeeName,
}: ApprovalTimelineProps) {
  const [reassignOpen, setReassignOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const {
    data: instance,
    isLoading,
    isError,
  } = useApprovalInstance(applicationType, applicationId);
  const { mutate: reassign, isPending: isReassigning } = useReassignApprover(
    applicationType,
    applicationId,
  );

  if (isLoading) return <Spin size="small" />;
  if (isError || !instance) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No approval history yet"
      />
    );
  }

  const nameOf = (employeeId: string) =>
    resolveEmployeeName?.(employeeId) ?? `${employeeId.slice(0, 8)}…`;

  const items = instance.actions.map((action) => ({
    color:
      action.action === "Approved"
        ? "green"
        : action.action === "Declined"
          ? "red"
          : "blue",
    dot:
      action.action === "Approved" ? (
        <CheckCircleFilled style={{ fontSize: 16 }} />
      ) : action.action === "Declined" ? (
        <CloseCircleFilled style={{ fontSize: 16 }} />
      ) : (
        <SwapOutlined style={{ fontSize: 16 }} />
      ),
    children: (
      <div>
        <Text strong>
          Step {action.stepNumber} —{" "}
          {action.action === "Reassigned"
            ? `Reassigned by ${nameOf(action.actorEmployeeId)}`
            : `${action.action} by ${nameOf(action.actorEmployeeId)}`}
        </Text>
        <div>
          <Text type="secondary">
            {dayjs(action.createdAt).format("MMM D, YYYY h:mm A")}
          </Text>
        </div>
        {action.note && <div>{action.note}</div>}
      </div>
    ),
  }));

  if (instance.status === "InProgress") {
    items.push({
      color: "gray",
      dot: <ClockCircleOutlined style={{ fontSize: 16 }} />,
      children: (
        <Text type="secondary">
          Pending — Step {instance.currentStepNumber} of {instance.totalSteps}
          {instance.currentStepApproverLabel
            ? ` · Awaiting: ${instance.currentStepApproverLabel}`
            : ""}
        </Text>
      ),
    });

    // Upcoming steps, shown muted/outline so they read as "not reached yet" rather than
    // competing with the solid-colored past actions or the current step's clock icon.
    instance.steps
      .filter((step) => step.stepNumber > instance.currentStepNumber)
      .forEach((step) => {
        items.push({
          color: "gray",
          dot: <ClockCircleOutlined style={{ fontSize: 16, opacity: 0.4 }} />,
          children: (
            <Text type="secondary" className="opacity-60">
              Step {step.stepNumber}: {step.approverLabel ?? "Unassigned"}
            </Text>
          ),
        });
      });
  }

  const canReassign =
    instance.status === "InProgress" &&
    authStorage.hasAnyRole("Owner", "Admin");

  return (
    <div className="flex flex-col gap-2">
      {contextHolder}
      <Space wrap>
        <Tag color={STATUS_COLOR[instance.status]}>
          {instance.status === "InProgress"
            ? `Step ${instance.currentStepNumber} of ${instance.totalSteps}`
            : instance.status}
        </Tag>
        {canReassign && (
          <Button
            size="small"
            icon={<UserSwitchOutlined />}
            onClick={() => setReassignOpen(true)}
          >
            Reassign
          </Button>
        )}
      </Space>
      {items.length > 0 ? (
        <Timeline items={items} />
      ) : (
        <Text type="secondary">Awaiting the first approval action.</Text>
      )}
      <ApprovalReassignModal
        open={reassignOpen}
        loading={isReassigning}
        onCancel={() => setReassignOpen(false)}
        onConfirm={(newApproverEmployeeId, note) =>
          reassign(
            { newApproverEmployeeId, note },
            {
              onSuccess: () => {
                setReassignOpen(false);
                messageApi.success("Step reassigned.");
              },
              onError: () =>
                messageApi.error("Failed to reassign. Please try again."),
            },
          )
        }
      />
    </div>
  );
}

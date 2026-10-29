import { useState } from "react";
import {
  Button,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useApprovalWorkflows,
  useActivateApprovalWorkflow,
  useDeactivateApprovalWorkflow,
  useDeleteApprovalWorkflow,
  useScheduleApprovalWorkflowActivation,
  useCancelScheduledApprovalWorkflowActivation,
} from "../../hooks/use-approval-workflow-queries";
import type { ApprovalWorkflowResponse } from "../../models/api/response/approval-workflow-response.model";
import {
  APPROVAL_WORKFLOWS_LABEL,
  APPLICATION_TYPE_OPTIONS,
} from "../../constants/label.const";
import { WorkflowResolutionModal } from "../../components/workflow-resolution-modal/workflow-resolution-modal";
import { useScopeOptions } from "../../hooks/use-scope-options";
import {
  describeConditions,
  fromScopeDtos,
} from "../../services/scope-conditions.util";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import { useHasPermission } from "@/shared/hooks/use-has-permission";

const { Title } = Typography;

const LIST_PATH = "/setup/approval-workflows";

const waiting = (count: number) =>
  `${count} ${count === 1 ? "request" : "requests"} pending`;

export default function ApprovalWorkflowList() {
  const navigate = useNavigate();
  const [applicationType, setApplicationType] =
    useState<ApprovalApplicationType>("Leave");
  const [checkOpen, setCheckOpen] = useState(false);
  const canManage = useHasPermission("Approval Workflows:Edit");
  const { labelFor } = useScopeOptions();

  const { data: workflows = [], isLoading } =
    useApprovalWorkflows(applicationType);
  const { mutate: activate, isPending: isActivating } =
    useActivateApprovalWorkflow();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateApprovalWorkflow();
  const { mutate: remove } = useDeleteApprovalWorkflow();
  const { mutate: schedule, isPending: isScheduling } =
    useScheduleApprovalWorkflowActivation();
  const { mutate: cancelSchedule } =
    useCancelScheduledApprovalWorkflowActivation();

  // The active workflow in the same slot (same conditions) -- what an inactive version would
  // replace. Workflows with different conditions stay active side by side.
  const activeFor = (r: ApprovalWorkflowResponse) =>
    workflows.find(
      (w) => w.id !== r.id && w.isActive && w.slotKey === r.slotKey,
    );

  const scheduleSwitch = (r: ApprovalWorkflowResponse) =>
    schedule(r.id, {
      onSuccess: (activated) =>
        message.success(
          activated
            ? `"${r.name}" is now active -- nothing was pending.`
            : `"${r.name}" will take over once the pending requests finish.`,
        ),
    });

  const columns: ColumnsType<ApprovalWorkflowResponse> = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Applies to",
      key: "scope",
      render: (_, r) => {
        const lines = describeConditions(fromScopeDtos(r.scopes), labelFor);
        if (lines.length === 0) return <Tag>Everyone (default)</Tag>;
        return (
          <Space size={[4, 4]} wrap>
            {lines.map((line) => (
              <Tag key={line} className="me-0!">
                {line}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 90,
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: "Steps",
      key: "steps",
      width: 80,
      render: (_, r) => r.steps.length,
    },
    {
      title: "Status",
      key: "status",
      width: 280,
      render: (_, r) => (
        <Space size={[4, 4]} wrap>
          <Tag color={r.isActive ? "success" : "default"}>
            {r.isActive ? "Active" : "Inactive"}
          </Tag>
          {r.overlapsWith.length > 0 && (
            <Tooltip
              title={`Can apply to the same people as ${r.overlapsWith.join(", ")} at the same priority, so the more specific (then older) one wins. Give them different priorities to be explicit.`}
            >
              <Tag color="warning" icon={<WarningOutlined />}>
                Same priority overlap
              </Tag>
            </Tooltip>
          )}
          {r.inProgressCount > 0 && (
            <Tooltip title="Requests still going through this workflow. It can't be edited until they finish.">
              <Tag color="processing">{waiting(r.inProgressCount)}</Tag>
            </Tooltip>
          )}
          {r.replacedByWorkflowName && (
            <Tag color="warning">
              Being replaced by "{r.replacedByWorkflowName}"
            </Tag>
          )}
          {r.replacesWorkflowName && (
            <Tag color="purple" icon={<ClockCircleOutlined />}>
              Takes over from "{r.replacesWorkflowName}" when its pending
              requests finish
              {canManage && (
                <Popconfirm
                  title="Cancel the scheduled switch?"
                  onConfirm={() => cancelSchedule(r.id)}
                  okText="Cancel switch"
                  cancelText="Keep"
                >
                  <Button
                    type="link"
                    size="small"
                    className="h-auto! p-0! ml-1"
                  >
                    Cancel
                  </Button>
                </Popconfirm>
              )}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 330,
      render: (_, r) => {
        const current = r.isActive ? undefined : activeFor(r);
        const editable = canManage && r.canEdit;
        return (
          <Space size="small" wrap>
            <PermissionGate permission="Approval Workflows:Edit">
              {r.isActive ? (
                <Popconfirm
                  title="Deactivate this workflow? Applications it covered will use the next matching workflow, or today's single-step behavior if none matches."
                  onConfirm={() => deactivate(r.id)}
                  okText="Deactivate"
                >
                  <Button size="small" loading={isDeactivating}>
                    Deactivate
                  </Button>
                </Popconfirm>
              ) : (
                <>
                  <Popconfirm
                    title={
                      current
                        ? `Activate now? New applications use this from now on; requests already pending on "${current.name}" finish there.`
                        : "Activate this workflow?"
                    }
                    onConfirm={() => activate(r.id)}
                    okText="Activate now"
                  >
                    <Button size="small" type="primary" loading={isActivating}>
                      Activate
                    </Button>
                  </Popconfirm>
                  {current && !r.replacesWorkflowId && (
                    <Popconfirm
                      title={`Switch to this once "${current.name}" has no pending requests? Until then, new applications keep using "${current.name}".`}
                      onConfirm={() => scheduleSwitch(r)}
                      okText="Schedule switch"
                    >
                      <Button size="small" loading={isScheduling}>
                        Switch when idle
                      </Button>
                    </Popconfirm>
                  )}
                </>
              )}
            </PermissionGate>

            {editable ? (
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                title="Edit"
                onClick={() => navigate({ to: `${LIST_PATH}/${r.id}` })}
              />
            ) : (
              <Button
                size="small"
                type="text"
                icon={<EyeOutlined />}
                title={
                  r.inProgressCount > 0
                    ? `View -- ${waiting(r.inProgressCount)}, so it can't be edited right now`
                    : "View"
                }
                onClick={() => navigate({ to: `${LIST_PATH}/${r.id}` })}
              />
            )}

            <PermissionGate permission="Approval Workflows:Edit">
              <Button
                size="small"
                type="text"
                icon={<CopyOutlined />}
                title="Copy as a new version"
                onClick={() =>
                  navigate({
                    to: `${LIST_PATH}/create`,
                    search: { copyFrom: r.id },
                  })
                }
              />
            </PermissionGate>

            <PermissionGate permission="Approval Workflows:Edit">
              <Popconfirm
                title="Delete this workflow?"
                onConfirm={() => remove(r.id)}
                okText="Delete"
                okButtonProps={{ danger: true }}
                disabled={!r.canDelete}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!r.canDelete}
                  title={
                    r.canDelete
                      ? "Delete"
                      : "Used by past requests, so it can't be deleted -- deactivate it instead."
                  }
                />
              </Popconfirm>
            </PermissionGate>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {APPROVAL_WORKFLOWS_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {APPROVAL_WORKFLOWS_LABEL.SUBTITLE}
            </p>
          </div>
          <Space>
            <Button
              icon={<QuestionCircleOutlined />}
              onClick={() => setCheckOpen(true)}
            >
              Which workflow applies?
            </Button>
            <PermissionGate permission="Approval Workflows:Edit">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate({ to: `${LIST_PATH}/create` })}
              >
                Add Workflow
              </Button>
            </PermissionGate>
          </Space>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <Select
          value={applicationType}
          onChange={setApplicationType}
          options={APPLICATION_TYPE_OPTIONS}
          className="w-56"
        />
      </div>

      <Table
        rowKey="id"
        dataSource={workflows}
        columns={columns}
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 15 }}
        scroll={{ x: true }}
      />

      <WorkflowResolutionModal
        open={checkOpen}
        applicationType={applicationType}
        onClose={() => setCheckOpen(false)}
      />
    </div>
  );
}

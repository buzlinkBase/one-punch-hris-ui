import { useState } from "react";
import {
  Button,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import {
  useApprovalWorkflows,
  useActivateApprovalWorkflow,
  useDeactivateApprovalWorkflow,
  useDeleteApprovalWorkflow,
} from "../../hooks/use-approval-workflow-queries";
import type { ApprovalWorkflowResponse } from "../../models/api/response/approval-workflow-response.model";
import {
  APPROVAL_WORKFLOWS_LABEL,
  APPLICATION_TYPE_OPTIONS,
} from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

const { Title } = Typography;

export default function ApprovalWorkflowList() {
  const navigate = useNavigate();
  const [applicationType, setApplicationType] =
    useState<ApprovalApplicationType>("Leave");

  const { data: workflows = [], isLoading } =
    useApprovalWorkflows(applicationType);
  const { mutate: activate, isPending: isActivating } =
    useActivateApprovalWorkflow();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateApprovalWorkflow();
  const { mutate: remove } = useDeleteApprovalWorkflow();

  const columns: ColumnsType<ApprovalWorkflowResponse> = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Scope",
      key: "scope",
      render: (_, r) =>
        r.scopeDepartmentId
          ? `Scoped: ${r.scopeDepartmentName ?? r.scopeDepartmentId}`
          : "company-wide default",
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
      width: 110,
      render: (_, r) => (
        <Tag color={r.isActive ? "success" : "default"}>
          {r.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, r) => (
        <Space size="small">
          <PermissionGate permission="Approval Workflows:Edit">
            {r.isActive ? (
              <Popconfirm
                title="Deactivate this workflow? New applications of this type will fall back to the company-wide default (or today's single-step behavior if none)."
                onConfirm={() => deactivate(r.id)}
                okText="Deactivate"
              >
                <Button size="small" loading={isDeactivating}>
                  Deactivate
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="Activate this workflow? Any other active workflow for this type/scope will be deactivated."
                onConfirm={() => activate(r.id)}
                okText="Activate"
              >
                <Button size="small" type="primary" loading={isActivating}>
                  Activate
                </Button>
              </Popconfirm>
            )}
          </PermissionGate>
          <PermissionGate permission="Approval Workflows:Edit">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              disabled={!r.isEditable}
              title={
                r.isEditable
                  ? "Edit"
                  : "This workflow has already been used and can no longer be edited — create a new version instead."
              }
              onClick={() =>
                navigate({ to: `/setup/approval-workflows/${r.id}` })
              }
            />
          </PermissionGate>
          <PermissionGate permission="Approval Workflows:Edit">
            <Popconfirm
              title="Delete this workflow?"
              onConfirm={() => remove(r.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              disabled={!r.isEditable}
            >
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={!r.isEditable}
              />
            </Popconfirm>
          </PermissionGate>
        </Space>
      ),
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
          <PermissionGate permission="Approval Workflows:Edit">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                navigate({ to: "/setup/approval-workflows/create" })
              }
            >
              Add Workflow
            </Button>
          </PermissionGate>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-3 flex-wrap">
        <Select
          value={applicationType}
          onChange={setApplicationType}
          options={APPLICATION_TYPE_OPTIONS}
          style={{ width: 220 }}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={workflows}
        columns={columns}
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 15 }}
      />
    </div>
  );
}

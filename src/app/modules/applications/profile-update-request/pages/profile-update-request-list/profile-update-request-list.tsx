import { useMemo, useState } from "react";
import {
  Button,
  Modal,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { HistoryOutlined, ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useApproveProfileUpdateRequest,
  useDeclineProfileUpdateRequest,
  useProfileUpdateRequests,
} from "../../hooks/use-profile-update-request-queries";
import type { EmployeeProfileUpdateRequestResponse } from "../../models/api/response/employee-profile-update-request-response.model";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
  PROFILE_UPDATE_REQUEST_LABEL,
} from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { ApprovalActionModal } from "@/shared/components/approval-action-modal/approval-action-modal";
import { ApprovalTimeline } from "@/shared/components/approval-timeline/approval-timeline";
import { useApprovalInstance } from "@/shared/hooks/use-approval-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";

const { Title } = Typography;

export default function ProfileUpdateRequestList() {
  const navigate = useNavigate();
  const {
    data: requests = [],
    isLoading,
    isFetching,
    refetch,
  } = useProfileUpdateRequests();
  const { mutate: approve, isPending: isApproving } =
    useApproveProfileUpdateRequest();
  const { mutate: decline, isPending: isDeclining } =
    useDeclineProfileUpdateRequest();

  const [actionTarget, setActionTarget] = useState<{
    record: EmployeeProfileUpdateRequestResponse;
    action: "Approved" | "Declined";
  } | null>(null);
  const { data: instance } = useApprovalInstance(
    "ProfileUpdate",
    actionTarget?.record.id,
  );

  const [historyTargetId, setHistoryTargetId] = useState<string | null>(null);
  const { data: rawEmployees = [] } = useEmployees();
  const resolveEmployeeName = (employeeId: string) =>
    rawEmployees.find((e) => e.id === employeeId)?.fullName ?? undefined;

  const pending = useMemo(
    () => requests.filter((r) => r.approvalStatus === "ForApproval"),
    [requests],
  );
  const history = useMemo(
    () => requests.filter((r) => r.approvalStatus !== "ForApproval"),
    [requests],
  );

  const columns: ColumnsType<EmployeeProfileUpdateRequestResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (v, r) => v ?? r.employeeId,
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      // No Z-strip here (unlike wall-clock business fields such as departureTime/
      // applicationDate elsewhere) -- CreatedAt is a real UTC instant from BaseEntity, and
      // dayjs already renders a parsed ISO instant in the viewer's local timezone by default.
      render: (v) => dayjs(v).format("MMM DD, YYYY HH:mm"),
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <Space size={4}>
          <Tag color={APPROVAL_STATUS_COLOR[r.approvalStatus] ?? "default"}>
            {APPROVAL_STATUS_LABEL[r.approvalStatus] ?? r.approvalStatus}
          </Tag>
          {r.hasConflict && <Tag color="error">Conflict</Tag>}
        </Space>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 280,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() =>
              navigate({
                to: `/applications/profile-update-request/${record.id}`,
              })
            }
          >
            View
          </Button>
          <Button
            size="small"
            icon={<HistoryOutlined />}
            onClick={() => setHistoryTargetId(record.id)}
          >
            History
          </Button>
          {record.approvalStatus === "ForApproval" && (
            <PermissionGate permission="Profile Update:Approve">
              <Button
                size="small"
                onClick={() => setActionTarget({ record, action: "Approved" })}
              >
                Approve
              </Button>
              <Button
                size="small"
                danger
                onClick={() => setActionTarget({ record, action: "Declined" })}
              >
                Decline
              </Button>
            </PermissionGate>
          )}
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
              {PROFILE_UPDATE_REQUEST_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {PROFILE_UPDATE_REQUEST_LABEL.SUBTITLE}
            </p>
          </div>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          />
        </div>
      </div>

      <Tabs
        type="card"
        items={[
          {
            key: "pending",
            label: `For Approval (${pending.length})`,
            children: (
              <Table
                rowKey="id"
                dataSource={pending}
                columns={columns}
                loading={isLoading || isFetching}
                size="small"
                pagination={{ pageSize: 20, showSizeChanger: false }}
              />
            ),
          },
          {
            key: "history",
            label: "History",
            children: (
              <Table
                rowKey="id"
                dataSource={history}
                columns={columns}
                loading={isLoading || isFetching}
                size="small"
                pagination={{ pageSize: 20, showSizeChanger: false }}
              />
            ),
          },
        ]}
      />

      <Modal
        open={!!historyTargetId}
        onCancel={() => setHistoryTargetId(null)}
        footer={null}
        title="Approval History"
      >
        <ApprovalTimeline
          applicationType="ProfileUpdate"
          applicationId={historyTargetId ?? undefined}
          resolveEmployeeName={resolveEmployeeName}
        />
      </Modal>

      <ApprovalActionModal
        open={!!actionTarget}
        action={actionTarget?.action ?? "Approved"}
        noteRequirement={instance?.currentStepNoteRequirement}
        loading={isApproving || isDeclining}
        onCancel={() => setActionTarget(null)}
        onConfirm={(note) => {
          if (!actionTarget) return;
          const { record, action } = actionTarget;
          if (action === "Approved") {
            approve(
              { id: record.id, note },
              {
                onSuccess: () => message.success("Profile update approved."),
                onError: (err) => {
                  const status = (err as { response?: { status?: number } })
                    .response?.status;
                  if (status === 409) {
                    message.warning(
                      "This employee's record changed since the request was submitted. Open the request to review and approve anyway.",
                    );
                  } else {
                    message.error("Failed to approve.");
                  }
                },
              },
            );
          } else {
            decline(
              { id: record.id, note },
              {
                onSuccess: () => message.success("Profile update declined."),
                onError: () => message.error("Failed to decline."),
              },
            );
          }
          setActionTarget(null);
        }}
      />
    </div>
  );
}

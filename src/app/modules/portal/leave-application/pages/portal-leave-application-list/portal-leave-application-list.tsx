import { Button, Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMyLeaveApplications } from "../../../shared/hooks/use-my-employee-queries";
import { useLeaveTypes } from "@/app/modules/setup/leave-type/hooks/use-leave-type-queries";
import type { LeaveApplicationResponse } from "@/app/modules/applications/leave-application/models/api/response/leave-application-response.model";

const { Title } = Typography;

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
};

export default function PortalLeaveApplicationList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyLeaveApplications();
  const { data: leaveTypes } = useLeaveTypes();

  const leaveTypeMap = new Map((leaveTypes ?? []).map((l) => [l.id, l]));

  const columns: ColumnsType<LeaveApplicationResponse> = [
    {
      title: "Leave Type",
      key: "leaveType",
      render: (_, r) => leaveTypeMap.get(r.leaveId)?.description ?? "—",
    },
    {
      title: "Dates",
      key: "dates",
      render: (_, r) =>
        r.leaveDateFrom === r.leaveDateTo
          ? dayjs(r.leaveDateFrom).format("MMM D, YYYY")
          : `${dayjs(r.leaveDateFrom).format("MMM D")} – ${dayjs(r.leaveDateTo).format("MMM D, YYYY")}`,
    },
    { title: "Pay Type", dataIndex: "payType" },
    {
      title: "Filed On",
      dataIndex: "createdAt",
      render: (v?: string) => (v ? dayjs(v).format("MMM D, YYYY") : "—"),
    },
    {
      title: "Status",
      dataIndex: "approvalStatus",
      render: (val: string) => (
        <Tag color={STATUS_COLOR[val] ?? "default"}>
          {STATUS_LABEL[val] ?? val}
        </Tag>
      ),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Leave Applications
            </Title>
            <p className="page-toolbar-subtitle">
              Every leave application you've filed and its current status.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/portal/leave-applications/create" })
            }
          >
            File Leave Application
          </Button>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Table<LeaveApplicationResponse>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={applications ?? []}
            pagination={{ pageSize: 15 }}
          />
        </Card>
      </div>
    </div>
  );
}

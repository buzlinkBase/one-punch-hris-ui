import { Button, Card, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyOvertimeApplications,
  useWithdrawMyOvertimeApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import type { OvertimeApplicationResponse } from "@/app/modules/applications/overtime-application/models/api/response/overtime-application-response.model";
import { ApprovalStatusCell } from "@/shared/components/approval-status-cell/approval-status-cell";
import { PortalApplicationRowActions } from "../../../shared/components/portal-application-row-actions";

const { Title } = Typography;

export default function PortalOvertimeList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyOvertimeApplications();
  const { mutateAsync: withdraw, isPending: isWithdrawing } =
    useWithdrawMyOvertimeApplication();

  const handleWithdraw = async (id: string) => {
    try {
      await withdraw(id);
      message.success("Overtime application withdrawn.");
    } catch {
      message.error("Failed to withdraw overtime application.");
    }
  };

  const columns: ColumnsType<OvertimeApplicationResponse> = [
    {
      title: "OT Date",
      dataIndex: "otDate",
      render: (v: string) => dayjs(v).format("MMM D, YYYY"),
    },
    {
      title: "Time / Minutes",
      key: "duration",
      render: (_, r) =>
        r.isManualEntry
          ? `${r.manualOTMinutes} min`
          : `${dayjs(r.startTime).format("HH:mm")} – ${dayjs(r.endTime).format("HH:mm")}`,
    },
    { title: "Remarks", dataIndex: "remarks" },
    {
      title: "Filed On",
      dataIndex: "createdAt",
      render: (v?: string) => (v ? dayjs(v).format("MMM D, YYYY") : "—"),
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <ApprovalStatusCell
          applicationType="Overtime"
          applicationId={r.id}
          approvalStatus={r.approvalStatus}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 110,
      render: (_, r) => (
        <PortalApplicationRowActions
          status={r.approvalStatus}
          onView={() => navigate({ to: `/portal/overtime/${r.id}/view` })}
          onEdit={() => navigate({ to: `/portal/overtime/${r.id}` })}
          withdrawTitle="Withdraw this overtime application?"
          onWithdraw={() => handleWithdraw(r.id)}
          withdrawing={isWithdrawing}
        />
      ),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Overtime Applications
            </Title>
            <p className="page-toolbar-subtitle">
              Every overtime application you've filed and its current status.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/portal/overtime/create" })}
          >
            File Overtime Application
          </Button>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Table<OvertimeApplicationResponse>
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

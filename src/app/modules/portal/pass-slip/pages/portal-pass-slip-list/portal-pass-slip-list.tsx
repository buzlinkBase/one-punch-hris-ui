import { Button, Card, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyPassSlipApplications,
  useWithdrawMyPassSlipApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import type { PortalPassSlipResponse } from "../../../shared/models/api/response/portal-pass-slip-response.model";
import { ApprovalStatusCell } from "@/shared/components/approval-status-cell/approval-status-cell";
import { PortalApplicationRowActions } from "../../../shared/components/portal-application-row-actions";
import { ApprovalTabs } from "@/shared/components/approval-tabs/approval-tabs";
import { useApprovalTabs } from "@/shared/hooks/use-approval-tabs";

const { Title } = Typography;

export default function PortalPassSlipList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyPassSlipApplications();
  const approval = useApprovalTabs(applications ?? []);
  const { mutateAsync: withdraw, isPending: isWithdrawing } =
    useWithdrawMyPassSlipApplication();

  const handleWithdraw = async (id: string) => {
    try {
      await withdraw(id);
      message.success("Pass slip withdrawn.");
    } catch {
      message.error("Failed to withdraw pass slip.");
    }
  };

  const columns: ColumnsType<PortalPassSlipResponse> = [
    {
      title: "Date",
      dataIndex: "applicationDate",
      render: (v: string) => dayjs(v).format("MMM D, YYYY"),
    },
    {
      title: "Departure",
      dataIndex: "departureTime",
      render: (v: string) => dayjs(v).format("HH:mm"),
    },
    {
      title: "Return",
      dataIndex: "returnTime",
      render: (v?: string | null) => (v ? dayjs(v).format("HH:mm") : "—"),
    },
    { title: "Destination", dataIndex: "destination" },
    { title: "Purpose", dataIndex: "purpose" },
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
          applicationType="PassSlip"
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
          onView={() => navigate({ to: `/portal/pass-slip/${r.id}/view` })}
          onEdit={() => navigate({ to: `/portal/pass-slip/${r.id}` })}
          withdrawTitle="Withdraw this pass slip?"
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
              My Pass Slips
            </Title>
            <p className="page-toolbar-subtitle">
              Every pass slip you've filed and its current status.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/portal/pass-slip/create" })}
          >
            File Pass Slip
          </Button>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <ApprovalTabs
            value={approval.tab}
            onChange={approval.setTab}
            pendingCount={approval.pendingCount}
            processedCount={approval.processedCount}
            pendingLabel="Pending"
          />
          <Table<PortalPassSlipResponse>
            rowKey="id"
            loading={isLoading}
            columns={columns}
            dataSource={approval.rows}
            pagination={{ pageSize: 15 }}
          />
        </Card>
      </div>
    </div>
  );
}

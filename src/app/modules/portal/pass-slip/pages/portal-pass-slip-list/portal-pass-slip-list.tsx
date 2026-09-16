import { Button, Card, Popconfirm, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyPassSlipApplications,
  useWithdrawMyPassSlipApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import type { PortalPassSlipResponse } from "../../../shared/models/api/response/portal-pass-slip-response.model";
import { ApprovalStatusCell } from "@/shared/components/approval-status-cell/approval-status-cell";

const { Title } = Typography;

export default function PortalPassSlipList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyPassSlipApplications();
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
      width: 60,
      render: (_, r) =>
        r.approvalStatus === "ForApproval" && (
          <Popconfirm
            title="Withdraw this pass slip?"
            description="This cannot be undone. You'll need to file again if you change your mind."
            onConfirm={() => handleWithdraw(r.id)}
            okText="Withdraw"
            okButtonProps={{ danger: true, loading: isWithdrawing }}
            cancelText="Cancel"
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<CloseOutlined />}
              title="Withdraw"
            />
          </Popconfirm>
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
          <Table<PortalPassSlipResponse>
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

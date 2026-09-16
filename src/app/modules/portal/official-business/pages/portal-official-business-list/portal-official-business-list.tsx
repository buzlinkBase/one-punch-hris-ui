import { Button, Card, Popconfirm, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyTravelOrderApplications,
  useWithdrawMyTravelOrderApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import type { TravelOrderApplicationResponse } from "@/app/modules/applications/travel-order-application/models/api/response/travel-order-application-response.model";
import { ApprovalStatusCell } from "@/shared/components/approval-status-cell/approval-status-cell";

const { Title } = Typography;

export default function PortalOfficialBusinessList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyTravelOrderApplications();
  const { mutateAsync: withdraw, isPending: isWithdrawing } =
    useWithdrawMyTravelOrderApplication();

  const handleWithdraw = async (id: string) => {
    try {
      await withdraw(id);
      message.success("Official business application withdrawn.");
    } catch {
      message.error("Failed to withdraw official business application.");
    }
  };

  const columns: ColumnsType<TravelOrderApplicationResponse> = [
    {
      title: "Dates",
      key: "dates",
      render: (_, r) =>
        r.startDate === r.endDate
          ? dayjs(r.startDate).format("MMM D, YYYY")
          : `${dayjs(r.startDate).format("MMM D")} – ${dayjs(r.endDate).format("MMM D, YYYY")}`,
    },
    { title: "Destination", dataIndex: "destination" },
    { title: "Classification", dataIndex: "classification" },
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
          applicationType="OfficialBusiness"
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
            title="Withdraw this application?"
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
              My Official Business Applications
            </Title>
            <p className="page-toolbar-subtitle">
              Every official business application you've filed and its current
              status.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/portal/official-business/create" })}
          >
            File Official Business
          </Button>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Table<TravelOrderApplicationResponse>
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

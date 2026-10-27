import { Button, Card, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyTravelOrderApplications,
  useWithdrawMyTravelOrderApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import type { TravelOrderApplicationResponse } from "@/app/modules/applications/travel-order-application/models/api/response/travel-order-application-response.model";
import { ApprovalStatusCell } from "@/shared/components/approval-status-cell/approval-status-cell";
import { PortalApplicationRowActions } from "../../../shared/components/portal-application-row-actions";
import { ApprovalTabs } from "@/shared/components/approval-tabs/approval-tabs";
import { useApprovalTabs } from "@/shared/hooks/use-approval-tabs";

const { Title } = Typography;

export default function PortalOfficialBusinessList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyTravelOrderApplications();
  const approval = useApprovalTabs(applications ?? []);
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
      title: "Date Submitted",
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
      width: 110,
      render: (_, r) => (
        <PortalApplicationRowActions
          status={r.approvalStatus}
          onView={() =>
            navigate({ to: `/portal/official-business/${r.id}/view` })
          }
          onEdit={() => navigate({ to: `/portal/official-business/${r.id}` })}
          withdrawTitle="Withdraw this application?"
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
            New Official Business
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
          <Table<TravelOrderApplicationResponse>
            scroll={{ x: "max-content" }}
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

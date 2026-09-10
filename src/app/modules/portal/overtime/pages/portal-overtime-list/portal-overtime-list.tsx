import {
  Button,
  Card,
  Popconfirm,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import {
  useMyOvertimeApplications,
  useWithdrawMyOvertimeApplication,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import type { OvertimeApplicationResponse } from "@/app/modules/applications/overtime-application/models/api/response/overtime-application-response.model";

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
      dataIndex: "approvalStatus",
      render: (val: string) => (
        <Tag color={APPROVAL_STATUS_COLOR[val] ?? "default"}>
          {APPROVAL_STATUS_LABEL[val] ?? val}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 60,
      render: (_, r) =>
        r.approvalStatus === "ForApproval" && (
          <Popconfirm
            title="Withdraw this overtime application?"
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

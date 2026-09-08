import { Button, Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMyPassSlipApplications } from "../../../shared/hooks/use-my-employee-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import type { PortalPassSlipResponse } from "../../../shared/models/api/response/portal-pass-slip-response.model";

const { Title } = Typography;

export default function PortalPassSlipList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyPassSlipApplications();

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
      dataIndex: "approvalStatus",
      render: (val: string) => (
        <Tag color={APPROVAL_STATUS_COLOR[val] ?? "default"}>
          {APPROVAL_STATUS_LABEL[val] ?? val}
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

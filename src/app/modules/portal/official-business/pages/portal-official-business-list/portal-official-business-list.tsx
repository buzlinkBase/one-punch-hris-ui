import { Button, Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMyTravelOrderApplications } from "../../../shared/hooks/use-my-employee-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import type { TravelOrderApplicationResponse } from "@/app/modules/applications/travel-order-application/models/api/response/travel-order-application-response.model";

const { Title } = Typography;

export default function PortalOfficialBusinessList() {
  const navigate = useNavigate();
  const { data: applications, isLoading } = useMyTravelOrderApplications();

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

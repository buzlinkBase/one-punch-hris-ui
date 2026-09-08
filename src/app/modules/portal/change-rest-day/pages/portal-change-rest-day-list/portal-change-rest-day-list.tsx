import { Button, Card, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useMyChangeRestDayRequests } from "../../../shared/hooks/use-my-employee-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import type { ChangeRestDayResponse } from "@/app/modules/change-schedule/change-rest-day/models/api/response/change-rest-day-response.model";

const { Title } = Typography;

export default function PortalChangeRestDayList() {
  const navigate = useNavigate();
  const { data: requests, isLoading } = useMyChangeRestDayRequests();

  const columns: ColumnsType<ChangeRestDayResponse> = [
    {
      title: "Current Rest Day",
      dataIndex: "fromDate",
      render: (v: string) => dayjs(v).format("MMM D, YYYY"),
    },
    {
      title: () => (
        <Space size={4}>
          <ArrowRightOutlined style={{ color: "#1DA081" }} />
          New Rest Day
        </Space>
      ),
      dataIndex: "toDate",
      render: (v: string) => (
        <span style={{ color: "#1DA081", fontWeight: 500 }}>
          {dayjs(v).format("MMM D, YYYY")}
        </span>
      ),
    },
    { title: "Batch", dataIndex: "batchCode" },
    {
      title: "Status",
      dataIndex: "approvalStatus",
      render: (val?: string) => (
        <Tag color={APPROVAL_STATUS_COLOR[val ?? ""] ?? "default"}>
          {APPROVAL_STATUS_LABEL[val ?? ""] ?? val ?? "—"}
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
              My Change Rest Day Requests
            </Title>
            <p className="page-toolbar-subtitle">
              Every rest day change you've requested and its current status.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate({ to: "/portal/change-rest-day/create" })}
          >
            Request Change
          </Button>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Table<ChangeRestDayResponse>
            rowKey={(r) => `${r.batchCode}-${r.employeeId}`}
            loading={isLoading}
            columns={columns}
            dataSource={requests ?? []}
            pagination={{ pageSize: 15 }}
          />
        </Card>
      </div>
    </div>
  );
}

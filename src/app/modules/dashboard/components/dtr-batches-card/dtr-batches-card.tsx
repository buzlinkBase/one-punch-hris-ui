import { Card, Skeleton, Table, Tag, Typography, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useDtrBatches } from "@/app/modules/daily-time-record/for-payroll/hooks/use-for-payroll-queries";
import type { DtrBatchModel } from "@/app/modules/daily-time-record/for-payroll/models/api/response/dtr-batch-response.model";
import StatCard from "../stat-card";

const MOCK_BATCHES: DtrBatchModel[] = [
  {
    code: "DTR-2026-08-A",
    fromDate: "2026-08-01",
    toDate: "2026-08-15",
    employeeCount: 42,
    isPosted: true,
  },
  {
    code: "DTR-2026-08-B",
    fromDate: "2026-08-16",
    toDate: "2026-08-31",
    employeeCount: 42,
    isPosted: false,
  },
  {
    code: "DTR-2026-07-A",
    fromDate: "2026-07-01",
    toDate: "2026-07-15",
    employeeCount: 40,
    isPosted: true,
  },
  {
    code: "DTR-2026-07-B",
    fromDate: "2026-07-16",
    toDate: "2026-07-31",
    employeeCount: 40,
    isPosted: true,
  },
];

const { Title, Text } = Typography;

const fmtDate = (d: string) =>
  d ? dayjs(d.replace(/Z$/, "")).format("MMM DD") : "—";

const columns: ColumnsType<DtrBatchModel> = [
  {
    title: "Batch Code",
    dataIndex: "code",
    key: "code",
    render: (v) => (
      <Text code style={{ fontSize: 11 }}>
        {v}
      </Text>
    ),
  },
  {
    title: "Period",
    key: "period",
    render: (_, r) => (
      <Text style={{ fontSize: 12 }}>
        {fmtDate(r.fromDate)} – {fmtDate(r.toDate)}
      </Text>
    ),
  },
  {
    title: "Employees",
    dataIndex: "employeeCount",
    key: "employeeCount",
    align: "right",
    render: (v) => <Text style={{ fontSize: 12 }}>{v}</Text>,
  },
  {
    title: "Status",
    dataIndex: "isPosted",
    key: "isPosted",
    render: (v) =>
      v ? (
        <Tag
          color="success"
          icon={<CheckCircleOutlined />}
          style={{ fontSize: 11 }}
        >
          Posted
        </Tag>
      ) : (
        <Tag
          color="warning"
          icon={<ClockCircleOutlined />}
          style={{ fontSize: 11 }}
        >
          Pending
        </Tag>
      ),
  },
];

export default function DtrBatchesCard() {
  const { token } = theme.useToken();
  const { data: rawBatches = [], isLoading } = useDtrBatches();
  const batches = rawBatches.length > 0 ? rawBatches : MOCK_BATCHES;

  const total = batches.length;
  const posted = batches.filter((b) => b.isPosted).length;
  const pending = batches.filter((b) => !b.isPosted).length;
  const totalEmployees = batches.reduce((s, b) => s + b.employeeCount, 0);

  return (
    <div>
      <Title
        level={5}
        style={{ marginBottom: 12, color: token.colorTextSecondary }}
      >
        Timekeeping
      </Title>

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        style={{ marginBottom: 16 }}
      >
        <StatCard
          title="Total Batches"
          value={total}
          icon={<FileTextOutlined />}
          color="#1DA081"
          loading={isLoading}
        />
        <StatCard
          title="Posted"
          value={posted}
          icon={<CheckCircleOutlined />}
          color="#1890FF"
          loading={isLoading}
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={<ClockCircleOutlined />}
          color="#FAAD14"
          loading={isLoading}
        />
        <StatCard
          title="DTR Employees"
          value={totalEmployees}
          icon={<TeamOutlined />}
          color="#722ED1"
          loading={isLoading}
        />
      </div>

      <Card size="small">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Table
            rowKey="code"
            dataSource={batches}
            columns={columns}
            size="small"
            pagination={{ pageSize: 8, showSizeChanger: false, size: "small" }}
          />
        )}
      </Card>
    </div>
  );
}

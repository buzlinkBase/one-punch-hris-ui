import { useMemo } from "react";
import { Card, Empty, Progress, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMyCashBond } from "../../../shared/hooks/use-my-employee-queries";
import { useDeductions } from "@/app/modules/setup/deduction/hooks/use-deduction-queries";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import type {
  DeductionApplicationDetailResponse,
  DeductionApplicationResponse,
} from "@/app/modules/applications/deduction-application/models/api/response/deduction-application-response.model";

const { Title, Text } = Typography;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const totalCollected = (breakdown: DeductionApplicationDetailResponse[]) => {
  const today = dayjs().format("YYYY-MM-DD");
  return breakdown
    .filter((b) => b.date?.slice(0, 10) <= today)
    .reduce((sum, b) => sum + b.amount, 0);
};

const scheduleColumns: ColumnsType<DeductionApplicationDetailResponse> = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    render: (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: fmt,
  },
  {
    title: "Status",
    key: "collected",
    render: (_, r) =>
      r.date?.slice(0, 10) <= dayjs().format("YYYY-MM-DD") ? (
        <Tag color="success">Collected</Tag>
      ) : (
        <Tag>Upcoming</Tag>
      ),
  },
];

export default function PortalCashBond() {
  const { data: cashBonds = [], isLoading } = useMyCashBond();
  const { data: rawDeductions = [] } = useDeductions();

  const deductionMap = useMemo(
    () => Object.fromEntries(rawDeductions.map((d) => [d.id, d.name])),
    [rawDeductions],
  );

  const columns: ColumnsType<DeductionApplicationResponse> = [
    {
      title: "Cash Bond",
      dataIndex: "deductionId",
      key: "deductionId",
      render: (v: string) => deductionMap[v] ?? v,
    },
    {
      title: "Target",
      dataIndex: "totalPrincipal",
      key: "target",
      align: "right",
      render: fmt,
    },
    {
      title: "Collected",
      key: "collected",
      align: "right",
      render: (_, r) => fmt(totalCollected(r.breakdown ?? [])),
    },
    {
      title: "Progress",
      key: "progress",
      width: 180,
      render: (_, r) => {
        const collected = totalCollected(r.breakdown ?? []);
        const target = r.totalPrincipal || 0;
        return (
          <Progress
            percent={
              target > 0
                ? Math.min(100, Math.round((collected / target) * 100))
                : 0
            }
            size="small"
          />
        );
      },
    },
    {
      title: "Remaining",
      key: "remaining",
      align: "right",
      render: (_, r) =>
        fmt(
          Math.max(
            0,
            (r.totalPrincipal || 0) - totalCollected(r.breakdown ?? []),
          ),
        ),
    },
    {
      title: "Status",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      render: (v?: string) => (
        <Tag color={APPROVAL_STATUS_COLOR[v ?? ""] ?? "success"}>
          {APPROVAL_STATUS_LABEL[v ?? ""] ?? v ?? "Approved"}
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
              My Cash Bond
            </Title>
            <p className="page-toolbar-subtitle">
              Your cash bond target and how much has been collected so far.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          {!isLoading && cashBonds.length === 0 ? (
            <Empty description="No cash bond on file." />
          ) : (
            <Table<DeductionApplicationResponse>
              rowKey="id"
              loading={isLoading}
              columns={columns}
              dataSource={cashBonds}
              pagination={{ pageSize: 10 }}
              expandable={{
                expandedRowRender: (record) => (
                  <Table<DeductionApplicationDetailResponse>
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={scheduleColumns}
                    dataSource={record.breakdown ?? []}
                  />
                ),
              }}
            />
          )}
          <Text type="secondary" className="text-xs">
            Refunds, if any, are handled manually by HR as part of clearance —
            they are not automatically added to your pay.
          </Text>
        </Card>
      </div>
    </div>
  );
}

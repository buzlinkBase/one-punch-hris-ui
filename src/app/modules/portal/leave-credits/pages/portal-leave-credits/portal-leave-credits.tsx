import { useState } from "react";
import { Card, InputNumber, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useMyLeaveCredits } from "../../../shared/hooks/use-my-employee-queries";
import type { LeaveBalanceResponse } from "@/app/modules/setup/leave-balance/models/api/response/leave-balance-response.model";

const { Title } = Typography;

function formatDays(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export default function PortalLeaveCredits() {
  const [year, setYear] = useState<number>(dayjs().year());
  const { data, isLoading } = useMyLeaveCredits(year);

  const columns: ColumnsType<LeaveBalanceResponse> = [
    { title: "Leave Type", dataIndex: "leaveDescription" },
    { title: "Code", dataIndex: "leaveCode", width: 90 },
    {
      title: "Granted",
      dataIndex: "granted",
      align: "right",
      render: formatDays,
    },
    { title: "Used", dataIndex: "used", align: "right", render: formatDays },
    {
      title: "Balance",
      dataIndex: "balance",
      align: "right",
      render: formatDays,
    },
    {
      title: "Reserved",
      dataIndex: "reserved",
      align: "right",
      render: formatDays,
    },
    {
      title: "Available to File",
      dataIndex: "availableToFile",
      align: "right",
      render: (v: number) => <b>{formatDays(v)}</b>,
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Leave Credits
            </Title>
            <p className="page-toolbar-subtitle">
              Your leave balances for the selected year.
            </p>
          </div>
          <Space wrap>
            <InputNumber
              min={2000}
              max={2100}
              value={year}
              onChange={(v) => setYear(v ?? dayjs().year())}
            />
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Table<LeaveBalanceResponse>
            rowKey="leaveId"
            loading={isLoading}
            columns={columns}
            dataSource={data ?? []}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
}

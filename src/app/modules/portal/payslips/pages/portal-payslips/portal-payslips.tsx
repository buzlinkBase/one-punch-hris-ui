import { useState } from "react";
import { Button, Card, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PrinterOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useMyPayrolls } from "../../../shared/hooks/use-my-employee-queries";
import type { PayrollRunResult } from "@/app/modules/daily-time-record/for-payroll/models/api/response/payroll-run-result.model";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";

const { Title } = Typography;

const ME_BASE_URL = buildApiUrl(API_PREFIX.hrms, "me");

function formatMoney(value: number) {
  return value.toLocaleString("en-PH", { minimumFractionDigits: 2 });
}

export default function PortalPayslips() {
  const defaultCutoff = getSemiMonthlyCutoff();
  const [dateRange, setDateRange] = useState<[string, string]>([
    defaultCutoff.fromDate,
    defaultCutoff.toDate,
  ]);

  const { data, isLoading, isFetching, refetch } = useMyPayrolls({
    from: dateRange[0],
    to: dateRange[1],
  });

  const columns: ColumnsType<PayrollRunResult> = [
    {
      title: "Pay Period",
      key: "period",
      render: (_, r) =>
        `${dayjs(r.payPeriodStart).format("MMM D")} – ${dayjs(r.payPeriodEnd).format("MMM D, YYYY")}`,
    },
    {
      title: "Pay Date",
      dataIndex: "payDate",
      render: (v?: string | null) => (v ? dayjs(v).format("MMM D, YYYY") : "—"),
    },
    {
      title: "Gross Income",
      dataIndex: "grossIncome",
      align: "right",
      render: (v: number) => formatMoney(v),
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      align: "right",
      render: (v: number) => formatMoney(v),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_, r) =>
        r.id && (
          <Button
            size="small"
            icon={<PrinterOutlined />}
            onClick={() =>
              openPdfInNewTab(`${ME_BASE_URL}/payrolls/${r.id}/print`)
            }
          >
            Print
          </Button>
        ),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              My Pay Slips
            </Title>
            <p className="page-toolbar-subtitle">
              Your posted payroll runs for the selected period.
            </p>
          </div>
          <Space wrap>
            <MobileRangePicker
              value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
              onChange={(dates) => {
                if (dates)
                  setDateRange([
                    dates[0]?.format("YYYY-MM-DD") ?? "",
                    dates[1]?.format("YYYY-MM-DD") ?? "",
                  ]);
              }}
            />
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Card>
          <Table<PayrollRunResult>
            rowKey={(r) => r.id ?? `${r.employeeId}-${r.payPeriodStart}`}
            loading={isLoading}
            columns={columns}
            dataSource={data?.data ?? []}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
}

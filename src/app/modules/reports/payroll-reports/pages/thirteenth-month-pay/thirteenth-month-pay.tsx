import { useState } from "react";
import { Button, DatePicker, Form, Tag, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useThirteenthMonth } from "../../hooks/use-payroll-reports-queries";
import type { ThirteenthMonthResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const STATUS_LABEL: Record<ThirteenthMonthResponse["status"], string> = {
  NotGenerated: "Not Generated",
  Draft: "Draft",
  Posted: "Posted",
};

const STATUS_COLOR: Record<
  ThirteenthMonthResponse["status"],
  "success" | "processing" | "default"
> = {
  NotGenerated: "default",
  Draft: "processing",
  Posted: "success",
};

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Total Basic Pay (Year)",
  "Special Bonuses (Year)",
  "13th Month Pay",
  "Status",
  "Net Pay",
];

// Opens the payslip PDF in a new tab (same convention as Payroll Summary's per-row print) —
// PayslipDocument.cs renders a dedicated "13TH MONTH PAY" layout for these rows.
const handlePrintPayslip = async (payrollId: string) => {
  const printTab = window.open("about:blank", "_blank");
  try {
    const blob = await httpClient.get<Blob>(
      `${buildApiUrl(API_PREFIX.hrms, "payrolls")}/${payrollId}/print`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(blob);
    if (printTab) printTab.location.href = url;
  } catch {
    printTab?.close();
    message.error("Failed to generate the payslip. Please try again.");
  }
};

const toRows = (records: ThirteenthMonthResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    fmt(r.totalBasicPayForYear),
    fmt(r.totalSpecialBonusesForYear),
    fmt(r.thirteenthMonthPay),
    STATUS_LABEL[r.status],
    r.netPay != null ? fmt(r.netPay) : "—",
  ]);

const columns: ColumnsType<ThirteenthMonthResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 220 },
  {
    title: "Total Basic Pay (Year)",
    dataIndex: "totalBasicPayForYear",
    key: "basic",
    align: "right",
    render: fmt,
  },
  {
    title: "Special Bonuses (Year)",
    dataIndex: "totalSpecialBonusesForYear",
    key: "bonuses",
    align: "right",
    render: fmt,
  },
  {
    title: "13th Month Pay",
    dataIndex: "thirteenthMonthPay",
    key: "thirteenth",
    align: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (v: ThirteenthMonthResponse["status"]) => (
      <Tag color={STATUS_COLOR[v]}>{STATUS_LABEL[v]}</Tag>
    ),
  },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "netPay",
    align: "right",
    render: (v: number | null) => (v != null ? fmt(v) : "—"),
  },
  {
    title: "",
    key: "print",
    width: 48,
    fixed: "right",
    render: (_, r) =>
      r.payrollId ? (
        <Tooltip title="Print payslip">
          <Button
            type="text"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintPayslip(r.payrollId!)}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Not generated yet">
          <Button
            type="text"
            size="small"
            icon={<PrinterOutlined />}
            disabled
          />
        </Tooltip>
      ),
  },
];

export default function ThirteenthMonthPay() {
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading, refetch } = useThirteenthMonth(year);

  const handlePrintList = async () => {
    if (!data.length) {
      message.info("No data to print. Adjust the year first.");
      return;
    }
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        // PayrollReportsController's route resolves to "payrollreports" (no hyphen) — see
        // payroll-reports.api.ts's ENDPOINT comment for why.
        `${buildApiUrl(API_PREFIX.hrms, "payrollreports")}/13th-month-pay/print`,
        { params: { year }, responseType: "blob" },
      );
      const url = URL.createObjectURL(blob);
      if (printTab) printTab.location.href = url;
    } catch {
      printTab?.close();
      message.error("Failed to generate the report. Please try again.");
    }
  };

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.THIRTEENTH_MONTH_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.THIRTEENTH_MONTH_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName={`13th-month-pay-${year}`}
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      extraActions={
        <Button
          icon={<PrinterOutlined />}
          disabled={!data.length}
          onClick={handlePrintList}
        >
          Print
        </Button>
      }
      filters={
        <Form layout="vertical">
          <Form.Item label="Year" className="mb-0" style={{ maxWidth: 180 }}>
            <DatePicker
              picker="year"
              style={{ width: "100%" }}
              value={dayjs().year(year)}
              allowClear={false}
              onChange={(date) => date && setYear(date.year())}
            />
          </Form.Item>
        </Form>
      }
    />
  );
}

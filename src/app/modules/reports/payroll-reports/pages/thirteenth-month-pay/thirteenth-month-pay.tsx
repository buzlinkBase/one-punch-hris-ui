import { useState } from "react";
import { Button, DatePicker, Form, Tag, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PrinterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ClientFilter } from "../../components/client-filter/client-filter";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useThirteenthMonth } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { ThirteenthMonthResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";
import { forPayrollApi } from "@/app/modules/daily-time-record/for-payroll/services/for-payroll.api";
import { payrollReportsApi } from "../../services/payroll-reports.api";
import { formatMoney } from "@/shared/utils/money.util";

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
const handlePrintPayslip = (payrollId: string) =>
  openPdfInNewTab(forPayrollApi.urls.payslipPrint(payrollId));

const toRows = (records: ThirteenthMonthResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.totalBasicPayForYear,
    r.totalSpecialBonusesForYear,
    r.thirteenthMonthPay,
    STATUS_LABEL[r.status],
    r.netPay ?? "",
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
    render: formatMoney,
  },
  {
    title: "Special Bonuses (Year)",
    dataIndex: "totalSpecialBonusesForYear",
    key: "bonuses",
    align: "right",
    render: formatMoney,
  },
  {
    title: "13th Month Pay",
    dataIndex: "thirteenthMonthPay",
    key: "thirteenth",
    align: "right",
    render: (v: number) => <strong>{formatMoney(v)}</strong>,
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
    render: (v: number | null) => (v != null ? formatMoney(v) : "—"),
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
            aria-label="Print payslip"
            type="text"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintPayslip(r.payrollId!)}
          />
        </Tooltip>
      ) : (
        <Tooltip title="Not generated yet">
          <Button
            aria-label="Not generated yet"
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
  const [clientId, setClientId] = useState<string | undefined>();
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading, refetch } = useThirteenthMonth(year, clientId);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  const handlePrintList = async () => {
    if (!data.length) {
      message.info("No data to print. Adjust the year first.");
      return;
    }
    await openPdfInNewTab(payrollReportsApi.urls.thirteenthMonthPayPrint, {
      year,
      clientId,
    });
  };

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.THIRTEENTH_MONTH_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.THIRTEENTH_MONTH_SUBTITLE}
      data={employeeFilter.filtered}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName={`13th-month-pay-${year}`}
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      totals={{
        fields: [
          "totalBasicPayForYear",
          "totalSpecialBonusesForYear",
          "thirteenthMonthPay",
          "netPay",
        ],
        exportHeaders: [
          "Total Basic Pay (Year)",
          "Special Bonuses (Year)",
          "13th Month Pay",
          "Net Pay",
        ],
      }}
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
          <div className="flex items-end gap-4 flex-wrap">
            <Form.Item label="Year" className="mb-0" style={{ maxWidth: 180 }}>
              <DatePicker
                picker="year"
                style={{ width: "100%" }}
                value={dayjs().year(year)}
                allowClear={false}
                onChange={(date) => date && setYear(date.year())}
              />
            </Form.Item>
            <ClientFilter value={clientId} onChange={setClientId} />
            <ReportNameFilter
              label="Employee"
              options={employeeFilter.options}
              value={employeeFilter.selected}
              onChange={employeeFilter.setSelected}
            />
          </div>
        </Form>
      }
    />
  );
}

import { useState } from "react";
import { Button, DatePicker, Form, Tag, Tooltip, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PrinterOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ClientFilter } from "../../components/client-filter/client-filter";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useThirteenthMonth } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { ThirteenthMonthResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import {
  THIRTEENTH_MONTH_HINT,
  THIRTEENTH_MONTH_LABEL,
  THIRTEENTH_MONTH_STATUS_COLOR,
  THIRTEENTH_MONTH_STATUS_LABEL,
  isStillUnpaid,
} from "../../constants/thirteenth-month.const";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";
import { forPayrollApi } from "@/app/modules/daily-time-record/for-payroll/services/for-payroll.api";
import { payrollReportsApi } from "../../services/payroll-reports.api";
import { formatMoney } from "@/shared/utils/money.util";

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  THIRTEENTH_MONTH_LABEL.BASIC_PAY,
  THIRTEENTH_MONTH_LABEL.SPECIAL_BONUSES,
  THIRTEENTH_MONTH_LABEL.EARNED,
  THIRTEENTH_MONTH_LABEL.STATUS,
  THIRTEENTH_MONTH_LABEL.RELEASED,
  THIRTEENTH_MONTH_LABEL.STILL_UNPAID,
];

// A column title with a "?" that explains the figure in plain words.
const titleWithHint = (label: string, hint: string) => (
  <Tooltip title={hint}>
    <span className="inline-flex items-center gap-1">
      {label}
      <QuestionCircleOutlined className="text-xs opacity-60" />
    </span>
  </Tooltip>
);

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
    THIRTEENTH_MONTH_STATUS_LABEL[r.status],
    r.netPay ?? "",
    r.stillUnpaid,
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
    title: titleWithHint(
      THIRTEENTH_MONTH_LABEL.BASIC_PAY,
      THIRTEENTH_MONTH_HINT.BASIC_PAY,
    ),
    dataIndex: "totalBasicPayForYear",
    key: "basic",
    align: "right",
    render: formatMoney,
  },
  {
    title: titleWithHint(
      THIRTEENTH_MONTH_LABEL.SPECIAL_BONUSES,
      THIRTEENTH_MONTH_HINT.SPECIAL_BONUSES,
    ),
    dataIndex: "totalSpecialBonusesForYear",
    key: "bonuses",
    align: "right",
    render: formatMoney,
  },
  {
    title: titleWithHint(
      THIRTEENTH_MONTH_LABEL.EARNED,
      THIRTEENTH_MONTH_HINT.EARNED,
    ),
    dataIndex: "thirteenthMonthPay",
    key: "thirteenth",
    align: "right",
    render: (v: number) => <strong>{formatMoney(v)}</strong>,
  },
  {
    title: titleWithHint(
      THIRTEENTH_MONTH_LABEL.STATUS,
      THIRTEENTH_MONTH_HINT.STATUS,
    ),
    dataIndex: "status",
    key: "status",
    render: (v: ThirteenthMonthResponse["status"]) => (
      <Tag color={THIRTEENTH_MONTH_STATUS_COLOR[v]}>
        {THIRTEENTH_MONTH_STATUS_LABEL[v]}
      </Tag>
    ),
  },
  {
    title: titleWithHint(
      THIRTEENTH_MONTH_LABEL.RELEASED,
      THIRTEENTH_MONTH_HINT.RELEASED,
    ),
    dataIndex: "netPay",
    key: "netPay",
    align: "right",
    render: (v: number | null) => (v != null ? formatMoney(v) : "—"),
  },
  {
    title: titleWithHint(
      THIRTEENTH_MONTH_LABEL.STILL_UNPAID,
      THIRTEENTH_MONTH_HINT.STILL_UNPAID,
    ),
    dataIndex: "stillUnpaid",
    key: "stillUnpaid",
    align: "right",
    render: (v: number, r) =>
      isStillUnpaid(r) ? (
        <Tooltip title="The payout was generated before later cutoffs were posted. This amount hasn't been paid.">
          <strong className="text-orange-600">{formatMoney(v)}</strong>
        </Tooltip>
      ) : (
        "—"
      ),
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
          "stillUnpaid",
        ],
        exportHeaders: [
          THIRTEENTH_MONTH_LABEL.BASIC_PAY,
          THIRTEENTH_MONTH_LABEL.SPECIAL_BONUSES,
          THIRTEENTH_MONTH_LABEL.EARNED,
          THIRTEENTH_MONTH_LABEL.RELEASED,
          THIRTEENTH_MONTH_LABEL.STILL_UNPAID,
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
            <Form.Item label="Year" className="mb-0 max-w-[180px]">
              <DatePicker
                picker="year"
                className="w-full"
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

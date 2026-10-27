import { useState } from "react";
import { Form, Select, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ClientFilter } from "../../components/client-filter/client-filter";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useBankDisbursement } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { BankDisbursementResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { formatMoney } from "@/shared/utils/money.util";

type ModeFilter = "All" | "ATM" | "Cash";

const MODE_OPTIONS: { value: ModeFilter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "ATM", label: "ATM" },
  { value: "Cash", label: "Cash" },
];

const BANK_EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Mode of Payment",
  "Bank Name",
  "Bank/Account No",
  "Period Start",
  "Period End",
  "Net Pay",
];

const CASH_EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Period Start",
  "Period End",
  "Net Pay",
  "Signature",
];

const toBankRows = (records: BankDisbursementResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.modeOfPayment,
    r.bankName,
    r.bankNo,
    r.payPeriodStart,
    r.payPeriodEnd,
    r.netPay,
  ]);

const toCashRows = (records: BankDisbursementResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.payPeriodStart,
    r.payPeriodEnd,
    r.netPay,
    "",
  ]);

const bankColumns: ColumnsType<BankDisbursementResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "Mode",
    dataIndex: "modeOfPayment",
    key: "mode",
    width: 90,
    render: (v: string) => (
      <Tag color={v === "ATM" ? "blue" : "default"}>{v}</Tag>
    ),
  },
  { title: "Bank Name", dataIndex: "bankName", key: "bankName", width: 160 },
  { title: "Bank/Account No", dataIndex: "bankNo", key: "bankNo", width: 160 },
  {
    title: "Period",
    key: "period",
    render: (_, r) =>
      `${dayjs(r.payPeriodStart).format("MMM DD")} – ${dayjs(r.payPeriodEnd).format("MMM DD, YYYY")}`,
  },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "net",
    align: "right",
    fixed: "right",
    render: formatMoney,
  },
];

const cashColumns: ColumnsType<BankDisbursementResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 220 },
  {
    title: "Period",
    key: "period",
    render: (_, r) =>
      `${dayjs(r.payPeriodStart).format("MMM DD")} – ${dayjs(r.payPeriodEnd).format("MMM DD, YYYY")}`,
  },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "net",
    align: "right",
    width: 140,
    render: formatMoney,
  },
  { title: "Signature", key: "signature", width: 200, render: () => "" },
];

export default function BankDisbursement() {
  const [clientId, setClientId] = useState<string | undefined>();
  const [mode, setMode] = useState<ModeFilter>("All");
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);
  const {
    data = [],
    isLoading,
    refetch,
  } = useBankDisbursement(range[0], range[1], clientId);
  const byMode = data.filter((r) => mode === "All" || r.modeOfPayment === mode);
  const isCash = mode === "Cash";
  const employeeFilter = useReportNameFilter(byMode, (r) => r.fullName);
  const bankFilter = useReportNameFilter(
    employeeFilter.filtered,
    (r) => r.bankName,
  );

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.BANK_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.BANK_SUBTITLE}
      data={bankFilter.filtered}
      loading={isLoading}
      columns={isCash ? cashColumns : bankColumns}
      onRefresh={() => refetch()}
      rowKey={(r) => `${r.employeeId}-${r.payPeriodStart}-${r.payPeriodEnd}`}
      exportFileName={isCash ? "cash-disbursement" : "bank-disbursement"}
      exportHeaders={isCash ? CASH_EXPORT_HEADERS : BANK_EXPORT_HEADERS}
      exportRows={isCash ? toCashRows : toBankRows}
      totals={{ fields: ["netPay"], exportHeaders: ["Net Pay"] }}
      filters={
        <Form layout="vertical">
          <div className="flex items-end gap-4 flex-wrap">
            <Form.Item
              label="Date Range"
              className="mb-0"
              style={{ maxWidth: 360 }}
            >
              <MobileRangePicker
                style={{ width: "100%" }}
                value={[dayjs(range[0]), dayjs(range[1])]}
                onChange={(dates) => {
                  if (dates)
                    setRange([
                      dates[0]?.format("YYYY-MM-DD") ?? "",
                      dates[1]?.format("YYYY-MM-DD") ?? "",
                    ]);
                }}
              />
            </Form.Item>
            <Form.Item label="Mode of Payment" className="mb-0">
              <Select
                className="w-36"
                options={MODE_OPTIONS}
                value={mode}
                onChange={setMode}
              />
            </Form.Item>
            <ClientFilter value={clientId} onChange={setClientId} />
            <ReportNameFilter
              label="Employee"
              options={employeeFilter.options}
              value={employeeFilter.selected}
              onChange={employeeFilter.setSelected}
            />
            {!isCash && (
              <ReportNameFilter
                label="Bank"
                options={bankFilter.options}
                value={bankFilter.selected}
                onChange={bankFilter.setSelected}
              />
            )}
          </div>
        </Form>
      }
    />
  );
}

import { useState } from "react";
import { Form, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useBankDisbursement } from "../../hooks/use-payroll-reports-queries";
import type { BankDisbursementResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Mode of Payment",
  "Bank Name",
  "Bank/Account No",
  "Period Start",
  "Period End",
  "Net Pay",
];

const toRows = (records: BankDisbursementResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.modeOfPayment,
    r.bankName,
    r.bankNo,
    r.payPeriodStart,
    r.payPeriodEnd,
    fmt(r.netPay),
  ]);

const columns: ColumnsType<BankDisbursementResponse> = [
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
    render: fmt,
  },
];

export default function BankDisbursement() {
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);
  const {
    data = [],
    isLoading,
    refetch,
  } = useBankDisbursement(range[0], range[1]);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.BANK_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.BANK_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName="bank-disbursement"
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      filters={
        <Form layout="vertical">
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
        </Form>
      }
    />
  );
}

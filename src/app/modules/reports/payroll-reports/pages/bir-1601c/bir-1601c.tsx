import { useState } from "react";
import { Alert, Button, DatePicker, Form } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useMonthlyRemittanceReturn } from "../../hooks/use-payroll-reports-queries";
import { payrollReportsApi } from "../../services/payroll-reports.api";
import type { MonthlyRemittanceReturnResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Period From",
  "Period To",
  "Employee Count",
  "Total Taxable Compensation",
  "Total Tax Withheld",
];

const toRows = (records: MonthlyRemittanceReturnResponse[]) =>
  records.map((r) => [
    r.periodFrom,
    r.periodTo,
    String(r.employeeCount),
    fmt(r.totalTaxableCompensation),
    fmt(r.totalTaxWithheld),
  ]);

const columns: ColumnsType<MonthlyRemittanceReturnResponse> = [
  {
    title: "Period From",
    dataIndex: "periodFrom",
    key: "from",
    render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
  },
  {
    title: "Period To",
    dataIndex: "periodTo",
    key: "to",
    render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
  },
  {
    title: "Employees",
    dataIndex: "employeeCount",
    key: "count",
    align: "right",
  },
  {
    title: "Total Taxable Compensation",
    dataIndex: "totalTaxableCompensation",
    key: "taxable",
    align: "right",
    render: fmt,
  },
  {
    title: "Total Tax Withheld",
    dataIndex: "totalTaxWithheld",
    key: "tax",
    align: "right",
    fixed: "right",
    render: fmt,
  },
];

export default function Bir1601C() {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const range: [string, string] = [
    month.startOf("month").format("YYYY-MM-DD"),
    month.endOf("month").format("YYYY-MM-DD"),
  ];
  const {
    data = [],
    isLoading,
    refetch,
  } = useMonthlyRemittanceReturn(range[0], range[1]);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.BIR_1601C_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.BIR_1601C_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.periodFrom}
      exportFileName="bir-1601c"
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      notice={
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="This is a summary of return figures for transcription into eBIRForms/eFPS — BIR does not accept a raw file upload for the 1601-C."
        />
      }
      extraActions={
        <Button
          icon={<FilePdfOutlined />}
          onClick={() =>
            openPdfInNewTab(
              payrollReportsApi.urls.monthlyRemittanceReturnPrint,
              {
                from: range[0],
                to: range[1],
              },
            )
          }
        >
          Preview PDF
        </Button>
      }
      filters={
        <Form layout="vertical">
          <Form.Item
            label="Posting Month"
            className="mb-0"
            style={{ maxWidth: 200 }}
          >
            <DatePicker
              style={{ width: "100%" }}
              picker="month"
              value={month}
              onChange={(date) => {
                if (date) setMonth(date);
              }}
              allowClear={false}
            />
          </Form.Item>
        </Form>
      }
    />
  );
}

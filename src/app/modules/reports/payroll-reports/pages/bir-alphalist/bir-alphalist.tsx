import { useState } from "react";
import { Alert, Button, DatePicker, Form, Space } from "antd";
import { FilePdfOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useAlphalist } from "../../hooks/use-payroll-reports-queries";
import { payrollReportsApi } from "../../services/payroll-reports.api";
import type { AlphalistEntryResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import {
  openPdfInNewTab,
  downloadBlobFile,
} from "@/shared/utils/download-file.util";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "TIN",
  "Gross Compensation",
  "Non-Taxable",
  "Taxable",
  "13th Month Pay",
  "SSS",
  "PhilHealth",
  "Pag-IBIG",
  "Tax Withheld",
];

const toRows = (records: AlphalistEntryResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.tin,
    fmt(r.grossCompensation),
    fmt(r.nonTaxableCompensation),
    fmt(r.taxableCompensation),
    fmt(r.thirteenthMonthPay),
    fmt(r.totalSSS),
    fmt(r.totalPhilHealth),
    fmt(r.totalPagIbig),
    fmt(r.totalTaxWithheld),
  ]);

const columns: ColumnsType<AlphalistEntryResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  { title: "TIN", dataIndex: "tin", key: "tin", width: 140 },
  {
    title: "Gross Compensation",
    dataIndex: "grossCompensation",
    key: "gross",
    align: "right",
    render: fmt,
  },
  {
    title: "Non-Taxable",
    dataIndex: "nonTaxableCompensation",
    key: "nonTaxable",
    align: "right",
    render: fmt,
  },
  {
    title: "Taxable",
    dataIndex: "taxableCompensation",
    key: "taxable",
    align: "right",
    render: fmt,
  },
  {
    title: "13th Month Pay",
    dataIndex: "thirteenthMonthPay",
    key: "13th",
    align: "right",
    render: fmt,
  },
  {
    title: "Tax Withheld",
    dataIndex: "totalTaxWithheld",
    key: "tax",
    align: "right",
    fixed: "right",
    render: fmt,
  },
];

export default function BirAlphalist() {
  const [year, setYear] = useState(dayjs().year());
  const { data = [], isLoading, refetch } = useAlphalist(year);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.BIR_ALPHALIST_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.BIR_ALPHALIST_SUBTITLE}
      data={data}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName="bir-alphalist"
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      notice={
        <Alert
          type="warning"
          showIcon
          className="mb-4"
          message={PAYROLL_REPORTS_LABEL.GOV_FILE_FORMAT_NOTICE}
        />
      }
      extraActions={
        <Space>
          <Button
            icon={<FilePdfOutlined />}
            onClick={() =>
              openPdfInNewTab(payrollReportsApi.urls.alphalistPrint, { year })
            }
          >
            Preview PDF
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() =>
              downloadBlobFile(
                payrollReportsApi.urls.alphalistExport,
                { year },
                `bir-alphalist-${year}.csv`,
              )
            }
          >
            Download File
          </Button>
        </Space>
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

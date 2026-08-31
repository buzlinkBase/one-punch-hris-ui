import { useState } from "react";
import { Alert, Button, DatePicker, Form, Select } from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { useBir2316 } from "../../hooks/use-payroll-reports-queries";
import { payrollReportsApi } from "../../services/payroll-reports.api";
import type { Bir2316Response } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { openPdfInNewTab } from "@/shared/utils/download-file.util";

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

const toRows = (records: Bir2316Response[]) =>
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

const columns: ColumnsType<Bir2316Response> = [
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  { title: "TIN", dataIndex: "tin", key: "tin", width: 140 },
  { title: "RDO Code", dataIndex: "rdoCode", key: "rdo", width: 100 },
  {
    title: "Gross Compensation",
    dataIndex: "grossCompensation",
    key: "gross",
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
    title: "Tax Withheld",
    dataIndex: "totalTaxWithheld",
    key: "tax",
    align: "right",
    fixed: "right",
    render: fmt,
  },
];

export default function Bir2316() {
  const [employeeId, setEmployeeId] = useState<string>();
  const [year, setYear] = useState(dayjs().year());
  const { data: employees = [] } = useEmployeeFilter();
  const {
    data: rows = [],
    isLoading,
    refetch,
  } = useBir2316(employeeId ?? "", year);

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.BIR_2316_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.BIR_2316_SUBTITLE}
      data={rows}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName={`bir-2316-${year}`}
      exportHeaders={EXPORT_HEADERS}
      exportRows={toRows}
      filterValidationMessage={
        !employeeId ? "Select an employee first" : undefined
      }
      notice={
        <Alert
          type="info"
          showIcon
          className="mb-4"
          message="Select an employee to view and print their 2316 certificate. Always printed — BIR has no electronic upload format for 2316."
        />
      }
      extraActions={
        <Button
          icon={<FilePdfOutlined />}
          disabled={!employeeId || !rows.length}
          onClick={() =>
            employeeId &&
            openPdfInNewTab(payrollReportsApi.urls.bir2316Print, {
              employeeId,
              year,
            })
          }
        >
          Preview PDF
        </Button>
      }
      filters={
        <Form layout="vertical">
          <div className="form-grid-2">
            <Form.Item label="Employee" className="mb-0">
              <Select
                showSearch
                placeholder="Select employee"
                options={employeeOptions}
                value={employeeId}
                onChange={setEmployeeId}
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item label="Year" className="mb-0" style={{ maxWidth: 180 }}>
              <DatePicker
                picker="year"
                style={{ width: "100%" }}
                value={dayjs().year(year)}
                allowClear={false}
                onChange={(date) => date && setYear(date.year())}
              />
            </Form.Item>
          </div>
        </Form>
      }
    />
  );
}

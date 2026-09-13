import { useState } from "react";
import { Alert, Button, Form, Space } from "antd";
import { FilePdfOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { useSssRemittance } from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import { payrollReportsApi } from "../../services/payroll-reports.api";
import type { ContributionRemittanceResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import {
  openPdfInNewTab,
  downloadBlobFile,
} from "@/shared/utils/download-file.util";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "SSS No",
  "EE Share",
  "ER Share",
  "Total",
];

const toRows = (records: ContributionRemittanceResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.govIdNumber,
    fmt(r.employeeShare),
    fmt(r.employerShare),
    fmt(r.totalContribution),
  ]);

const columns: ColumnsType<ContributionRemittanceResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  { title: "SSS No", dataIndex: "govIdNumber", key: "govId", width: 140 },
  {
    title: "EE Share",
    dataIndex: "employeeShare",
    key: "ee",
    align: "right",
    render: fmt,
  },
  {
    title: "ER Share",
    dataIndex: "employerShare",
    key: "er",
    align: "right",
    render: fmt,
  },
  {
    title: "Total",
    dataIndex: "totalContribution",
    key: "total",
    align: "right",
    fixed: "right",
    render: fmt,
  },
];

export default function SssR3() {
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);
  const {
    data = [],
    isLoading,
    refetch,
  } = useSssRemittance(range[0], range[1]);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  return (
    <PayrollReportShell
      title={PAYROLL_REPORTS_LABEL.SSS_R3_TITLE}
      subtitle={PAYROLL_REPORTS_LABEL.SSS_R3_SUBTITLE}
      data={employeeFilter.filtered}
      loading={isLoading}
      columns={columns}
      onRefresh={() => refetch()}
      rowKey={(r) => r.employeeId}
      exportFileName="sss-r3-preview"
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
              openPdfInNewTab(payrollReportsApi.urls.sssR3Print, {
                from: range[0],
                to: range[1],
              })
            }
          >
            Preview PDF
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() =>
              downloadBlobFile(
                payrollReportsApi.urls.sssR3Export,
                { from: range[0], to: range[1] },
                `sss-r3-${range[0]}-${range[1]}.csv`,
              )
            }
          >
            Download File
          </Button>
        </Space>
      }
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

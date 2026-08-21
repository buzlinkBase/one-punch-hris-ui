import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Typography,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { usePayrolls } from "../../hooks/use-for-payroll-queries";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });
const fmtH = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }) + " h";

export default function PayrollSummary() {
  const { token } = theme.useToken();
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = usePayrolls({
    from: dateRange[0],
    to: dateRange[1],
  });

  const results = useMemo<PayrollRunResult[]>(
    () => response?.data ?? [],
    [response],
  );

  const totals = useMemo(
    () => ({
      gross: results.reduce((s, r) => s + r.grossIncome, 0),
      net: results.reduce((s, r) => s + r.netPay, 0),
      sss: results.reduce((s, r) => s + r.sssContribution, 0),
      phic: results.reduce((s, r) => s + r.philHealthContribution, 0),
      hdmf: results.reduce((s, r) => s + r.pagIbigContribution, 0),
      tax: results.reduce((s, r) => s + r.withholdingTax, 0),
      ot: results.reduce((s, r) => s + r.overtimePay, 0),
      nd: results.reduce((s, r) => s + r.nightDifferentialPay, 0),
      regHours: results.reduce((s, r) => s + r.regularNetHours, 0),
    }),
    [results],
  );

  const earningsColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
    },
    {
      title: "Period Start",
      dataIndex: "payPeriodStart",
      key: "from",
      render: (v: string) => (v ? dayjs(v).format("MMM DD") : "—"),
    },
    {
      title: "Period End",
      dataIndex: "payPeriodEnd",
      key: "to",
      render: (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
    },
    {
      title: "Basic",
      dataIndex: "basicSalary",
      key: "basic",
      align: "right",
      render: fmt,
    },
    {
      title: "OT Pay",
      dataIndex: "overtimePay",
      key: "ot",
      align: "right",
      render: fmt,
    },
    {
      title: "ND Pay",
      dataIndex: "nightDifferentialPay",
      key: "nd",
      align: "right",
      render: fmt,
    },
    {
      title: "Holiday",
      dataIndex: "holidayPay",
      key: "hol",
      align: "right",
      render: fmt,
    },
    {
      title: "Allowances",
      dataIndex: "totalRegularAllowances",
      key: "allow",
      align: "right",
      render: fmt,
    },
    {
      title: "Other Income",
      dataIndex: "totalOtherIncome",
      key: "other",
      align: "right",
      render: fmt,
    },
    {
      title: "Reimbursement",
      dataIndex: "reimbursement",
      key: "reimb",
      align: "right",
      render: fmt,
    },
    {
      title: "Gross",
      dataIndex: "grossIncome",
      key: "gross",
      align: "right",
      fixed: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
  ];

  const deductionsColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
    },
    {
      title: "SSS",
      dataIndex: "sssContribution",
      key: "sss",
      align: "right",
      render: fmt,
    },
    {
      title: "PhilHealth",
      dataIndex: "philHealthContribution",
      key: "phic",
      align: "right",
      render: fmt,
    },
    {
      title: "Pag-IBIG",
      dataIndex: "pagIbigContribution",
      key: "hdmf",
      align: "right",
      render: fmt,
    },
    {
      title: "W-Tax",
      dataIndex: "withholdingTax",
      key: "tax",
      align: "right",
      render: fmt,
    },
    {
      title: "Loans & Deductions",
      dataIndex: "otherDeductions",
      key: "other",
      align: "right",
      render: fmt,
    },
    {
      title: "Late/UT",
      key: "late",
      align: "right",
      render: (_, r) => fmt(r.lateAmount + r.underTimeAmount),
    },
    {
      title: "Absent",
      dataIndex: "absences",
      key: "abs",
      align: "right",
      render: fmt,
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "net",
      align: "right",
      fixed: "right",
      render: (v: number) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {fmt(v)}
        </Text>
      ),
    },
  ];

  const hoursColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
    },
    {
      title: "Regular",
      dataIndex: "regularNetHours",
      key: "reg",
      align: "right",
      render: fmtH,
    },
    {
      title: "Reg OT",
      dataIndex: "regularOTHours",
      key: "regot",
      align: "right",
      render: fmtH,
    },
    {
      title: "Reg ND",
      dataIndex: "regularNDHours",
      key: "regnd",
      align: "right",
      render: fmtH,
    },
    {
      title: "Reg ND-OT",
      dataIndex: "regularNDOTHours",
      key: "regndot",
      align: "right",
      render: fmtH,
    },
    {
      title: "Rest Day",
      dataIndex: "restDayHours",
      key: "rd",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD OT",
      dataIndex: "restDayOTHours",
      key: "rdot",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD ND",
      dataIndex: "restDayNDHours",
      key: "rdnd",
      align: "right",
      render: fmtH,
    },
    {
      title: "Legal Hol",
      dataIndex: "legalHolHours",
      key: "lh",
      align: "right",
      render: fmtH,
    },
    {
      title: "Legal OT",
      dataIndex: "legalHolOTHours",
      key: "lhot",
      align: "right",
      render: fmtH,
    },
    {
      title: "Legal ND",
      dataIndex: "legalHolNightDiffHours",
      key: "lhnd",
      align: "right",
      render: fmtH,
    },
    {
      title: "Special Hol",
      dataIndex: "specialHolHours",
      key: "sh",
      align: "right",
      render: fmtH,
    },
    {
      title: "Special OT",
      dataIndex: "specialHolOTHours",
      key: "shot",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Legal",
      dataIndex: "restLegalDayHours",
      key: "rdlh",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Legal OT",
      dataIndex: "restLegalDayOTHours",
      key: "rdlhot",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Special",
      dataIndex: "restSpecialDayHours",
      key: "rdsh",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Special OT",
      dataIndex: "restSpecialDayOTHours",
      key: "rdshot",
      align: "right",
      render: fmtH,
    },
    {
      title: "OT Total Hr",
      dataIndex: "overtimeHour",
      key: "ottotal",
      align: "right",
      fixed: "right",
      render: fmtH,
    },
  ];

  const erColumns: ColumnsType<PayrollRunResult> = [
    { title: "Employee", dataIndex: "fullName", key: "name", width: 160 },
    {
      title: "ER SSS",
      dataIndex: "employerSSSContribution",
      key: "ersss",
      align: "right",
      render: fmt,
    },
    {
      title: "ER PhilHealth",
      dataIndex: "employerPhilHealthContribution",
      key: "erphic",
      align: "right",
      render: fmt,
    },
    {
      title: "ER Pag-IBIG",
      dataIndex: "employerPagIbigContribution",
      key: "erhdmf",
      align: "right",
      render: fmt,
    },
    {
      title: "EC",
      dataIndex: "employerECContribution",
      key: "ec",
      align: "right",
      render: fmt,
    },
    {
      title: "Total ER Cost",
      key: "ertotal",
      align: "right",
      render: (_, r) =>
        fmt(
          r.employerSSSContribution +
            r.employerPhilHealthContribution +
            r.employerPagIbigContribution +
            r.employerECContribution,
        ),
    },
  ];

  const tableProps = {
    rowKey: "employeeId",
    loading: isLoading,
    size: "small" as const,
    scroll: { x: "max-content" as const },
    pagination: { pageSize: 50, showSizeChanger: false },
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Payroll Summary
            </Title>
            <p className="page-toolbar-subtitle">
              View generated payroll records with full earnings, deductions, and
              hour breakdown.
            </p>
          </div>
          <Space>
            <RangePicker
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

      {results.length > 0 && (
        <Row gutter={16} className="mb-4">
          <Col>
            <Card size="small">
              <Statistic
                title="Employees"
                value={results.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total Gross"
                value={totals.gross}
                precision={2}
                prefix="₱"
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total Net Pay"
                value={totals.net}
                precision={2}
                prefix="₱"
                valueStyle={{ color: token.colorPrimary }}
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total OT Pay"
                value={totals.ot}
                precision={2}
                prefix="₱"
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Regular Hours"
                value={totals.regHours}
                precision={2}
                suffix="h"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Tabs
          items={[
            {
              key: "earnings",
              label: "Earnings",
              children: (
                <Table
                  dataSource={results}
                  columns={earningsColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "deductions",
              label: "Deductions & Net",
              children: (
                <Table
                  dataSource={results}
                  columns={deductionsColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "hours",
              label: "Hours Breakdown",
              children: (
                <Table
                  dataSource={results}
                  columns={hoursColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "er",
              label: "Employer Contributions",
              children: (
                <Table
                  dataSource={results}
                  columns={erColumns}
                  {...tableProps}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

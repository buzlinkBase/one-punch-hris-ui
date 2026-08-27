import { Card, Skeleton, Table, Typography, theme } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DollarOutlined,
  MinusCircleOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { usePayrolls } from "@/app/modules/daily-time-record/for-payroll/hooks/use-for-payroll-queries";
import type { PayrollRunResult } from "@/app/modules/daily-time-record/for-payroll/models/api/response/payroll-run-result.model";
import StatCard from "../stat-card";

const MOCK_PAYROLL: PayrollRunResult[] = [
  {
    employeeId: "emp-1",
    salaryType: "VARIABLE",
    dailyRate: 0,
    fullName: "Maria Santos",
    payPeriodStart: "2026-08-01",
    payPeriodEnd: "2026-08-15",
    basicPay: 12500,
    overtimeHour: 4,
    overtimePay: 625,
    nightDifferentialHour: 0,
    nightDifferentialPay: 0,
    nightDifferentialOTPay: 0,
    holidayPay: 0,
    restDayPay: 0,
    cola: 1000,
    totalRegularAllowances: 1500,
    totalBonuses: 0,
    totalOtherIncome: 500,
    totalDeminimises: 0,
    totalCommissions: 0,
    grossIncome: 16125,
    sssContribution: 581.3,
    philHealthContribution: 400,
    pagIbigContribution: 100,
    withholdingTax: 312,
    otherDeductions: 0,
    totalDeductions: 1393.3,
    absences: 0,
    absentCount: 0,
    lateAmount: 0,
    lateHours: 0,
    underTimeAmount: 0,
    underTimeHours: 0,
    reimbursement: 0,
    netPay: 14731.7,
    nonTaxableBenefits: 1500,
    taxableBenefits: 500,
    employerSSSContribution: 1208,
    employerPhilHealthContribution: 400,
    employerPagIbigContribution: 100,
    employerECContribution: 10,
    regularNetHours: 88,
    regularOTHours: 4,
    regularNDHours: 0,
    regularNDOTHours: 0,
    restDayHours: 0,
    restDayOTHours: 0,
    restDayNDHours: 0,
    restDayNDOTHours: 0,
    legalHolHours: 0,
    legalHolOTHours: 0,
    legalHolNightDiffHours: 0,
    legalHolNightDiffOTHours: 0,
    specialHolHours: 0,
    specialHolOTHours: 0,
    specialHolNightDiffHours: 0,
    specialHolNightDiffOTHours: 0,
    restLegalDayHours: 0,
    restLegalDayOTHours: 0,
    restLegalDayNDHours: 0,
    restLegalDayNDOTHours: 0,
    restSpecialDayHours: 0,
    restSpecialDayOTHours: 0,
    restSpecialDayNDHours: 0,
    restSpecialDayNDOTHours: 0,
  },
  {
    employeeId: "emp-2",
    salaryType: "VARIABLE",
    dailyRate: 0,
    fullName: "Juan Dela Cruz",
    payPeriodStart: "2026-08-01",
    payPeriodEnd: "2026-08-15",
    basicPay: 15000,
    overtimeHour: 0,
    overtimePay: 0,
    nightDifferentialHour: 16,
    nightDifferentialPay: 300,
    nightDifferentialOTPay: 0,
    holidayPay: 0,
    restDayPay: 0,
    cola: 1000,
    totalRegularAllowances: 2000,
    totalBonuses: 0,
    totalOtherIncome: 0,
    totalDeminimises: 0,
    totalCommissions: 0,
    grossIncome: 18300,
    sssContribution: 675,
    philHealthContribution: 450,
    pagIbigContribution: 100,
    withholdingTax: 520,
    otherDeductions: 0,
    totalDeductions: 1745,
    absences: 0,
    absentCount: 0,
    lateAmount: 125,
    lateHours: 1,
    underTimeAmount: 0,
    underTimeHours: 0,
    reimbursement: 0,
    netPay: 16430,
    nonTaxableBenefits: 2000,
    taxableBenefits: 0,
    employerSSSContribution: 1400,
    employerPhilHealthContribution: 450,
    employerPagIbigContribution: 100,
    employerECContribution: 10,
    regularNetHours: 88,
    regularOTHours: 0,
    regularNDHours: 16,
    regularNDOTHours: 0,
    restDayHours: 0,
    restDayOTHours: 0,
    restDayNDHours: 0,
    restDayNDOTHours: 0,
    legalHolHours: 0,
    legalHolOTHours: 0,
    legalHolNightDiffHours: 0,
    legalHolNightDiffOTHours: 0,
    specialHolHours: 0,
    specialHolOTHours: 0,
    specialHolNightDiffHours: 0,
    specialHolNightDiffOTHours: 0,
    restLegalDayHours: 0,
    restLegalDayOTHours: 0,
    restLegalDayNDHours: 0,
    restLegalDayNDOTHours: 0,
    restSpecialDayHours: 0,
    restSpecialDayOTHours: 0,
    restSpecialDayNDHours: 0,
    restSpecialDayNDOTHours: 0,
  },
  {
    employeeId: "emp-3",
    salaryType: "VARIABLE",
    dailyRate: 0,
    fullName: "Angela Reyes",
    payPeriodStart: "2026-08-01",
    payPeriodEnd: "2026-08-15",
    basicPay: 10000,
    overtimeHour: 8,
    overtimePay: 1000,
    nightDifferentialHour: 0,
    nightDifferentialPay: 0,
    nightDifferentialOTPay: 0,
    holidayPay: 1250,
    restDayPay: 0,
    cola: 800,
    totalRegularAllowances: 1000,
    totalBonuses: 0,
    totalOtherIncome: 0,
    totalDeminimises: 0,
    totalCommissions: 0,
    grossIncome: 14050,
    sssContribution: 450,
    philHealthContribution: 350,
    pagIbigContribution: 100,
    withholdingTax: 0,
    otherDeductions: 0,
    totalDeductions: 900,
    absences: 0,
    absentCount: 0,
    lateAmount: 0,
    lateHours: 0,
    underTimeAmount: 0,
    underTimeHours: 0,
    reimbursement: 0,
    netPay: 13150,
    nonTaxableBenefits: 1000,
    taxableBenefits: 0,
    employerSSSContribution: 950,
    employerPhilHealthContribution: 350,
    employerPagIbigContribution: 100,
    employerECContribution: 10,
    regularNetHours: 80,
    regularOTHours: 8,
    regularNDHours: 0,
    regularNDOTHours: 0,
    restDayHours: 8,
    restDayOTHours: 0,
    restDayNDHours: 0,
    restDayNDOTHours: 0,
    legalHolHours: 8,
    legalHolOTHours: 0,
    legalHolNightDiffHours: 0,
    legalHolNightDiffOTHours: 0,
    specialHolHours: 0,
    specialHolOTHours: 0,
    specialHolNightDiffHours: 0,
    specialHolNightDiffOTHours: 0,
    restLegalDayHours: 0,
    restLegalDayOTHours: 0,
    restLegalDayNDHours: 0,
    restLegalDayNDOTHours: 0,
    restSpecialDayHours: 0,
    restSpecialDayOTHours: 0,
    restSpecialDayNDHours: 0,
    restSpecialDayNDOTHours: 0,
  },
];

const { Title, Text } = Typography;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export default function PayrollSummaryCard() {
  const { token } = theme.useToken();
  const from = dayjs().startOf("month").format("YYYY-MM-DD");
  const to = dayjs().format("YYYY-MM-DD");

  const { data, isLoading } = usePayrolls({ from, to });
  const rawRows = data?.data ?? [];
  const rows = rawRows.length > 0 ? rawRows : MOCK_PAYROLL;

  const totalGross = rows.reduce((s, r) => s + r.grossIncome, 0);
  const totalDeductions = rows.reduce((s, r) => s + r.totalDeductions, 0);
  const totalNet = rows.reduce((s, r) => s + r.netPay, 0);

  const columns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      render: (v) => <Text style={{ fontSize: 12 }}>{v}</Text>,
    },
    {
      title: "Basic",
      dataIndex: "basicPay",
      key: "basicPay",
      align: "right",
      render: (v) => <Text style={{ fontSize: 12 }}>₱{fmt(v)}</Text>,
    },
    {
      title: "Gross",
      dataIndex: "grossIncome",
      key: "grossIncome",
      align: "right",
      render: (v) => <Text style={{ fontSize: 12 }}>₱{fmt(v)}</Text>,
    },
    {
      title: "Deductions",
      dataIndex: "totalDeductions",
      key: "totalDeductions",
      align: "right",
      render: (v) => (
        <Text style={{ fontSize: 12, color: token.colorError }}>₱{fmt(v)}</Text>
      ),
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      align: "right",
      render: (v) => (
        <Text strong style={{ fontSize: 12, color: token.colorPrimary }}>
          ₱{fmt(v)}
        </Text>
      ),
    },
  ];

  return (
    <div>
      <Title
        level={5}
        style={{ marginBottom: 12, color: token.colorTextSecondary }}
      >
        Payroll — {dayjs().format("MMMM YYYY")}
      </Title>

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        style={{ marginBottom: 16 }}
      >
        <StatCard
          title="Employees Paid"
          value={rows.length}
          icon={<TeamOutlined />}
          color="#1DA081"
          loading={isLoading}
        />
        <StatCard
          title="Total Gross"
          value={isLoading ? 0 : fmt(totalGross)}
          icon={<DollarOutlined />}
          color="#1890FF"
          loading={isLoading}
        />
        <StatCard
          title="Total Deductions"
          value={isLoading ? 0 : fmt(totalDeductions)}
          icon={<MinusCircleOutlined />}
          color="#F5222D"
          loading={isLoading}
        />
        <StatCard
          title="Total Net Pay"
          value={isLoading ? 0 : fmt(totalNet)}
          icon={<WalletOutlined />}
          color="#722ED1"
          loading={isLoading}
        />
      </div>

      <Card size="small">
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Table
            rowKey="employeeId"
            dataSource={rows}
            columns={columns}
            size="small"
            pagination={{ pageSize: 8, showSizeChanger: false, size: "small" }}
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <Text strong style={{ fontSize: 12 }}>
                    Total
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <Text strong style={{ fontSize: 12 }}>
                    ₱{fmt(rows.reduce((s, r) => s + r.basicPay, 0))}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="right">
                  <Text strong style={{ fontSize: 12 }}>
                    ₱{fmt(totalGross)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text
                    strong
                    style={{ fontSize: 12, color: token.colorError }}
                  >
                    ₱{fmt(totalDeductions)}
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="right">
                  <Text
                    strong
                    style={{ fontSize: 12, color: token.colorPrimary }}
                  >
                    ₱{fmt(totalNet)}
                  </Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        )}
      </Card>
    </div>
  );
}

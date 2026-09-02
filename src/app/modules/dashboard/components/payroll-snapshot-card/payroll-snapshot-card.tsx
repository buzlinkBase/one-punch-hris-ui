import { Card, Skeleton, Typography, theme } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import { usePayrolls } from "@/app/modules/daily-time-record/for-payroll/hooks/use-for-payroll-queries";
import type { PayrollRunResult } from "@/app/modules/daily-time-record/for-payroll/models/api/response/payroll-run-result.model";

const { Title, Text } = Typography;

const MOCK: PayrollRunResult[] = [
  {
    employeeId: "emp-1",
    salaryType: "VARIABLE",
    dailyRate: 0,
    fullName: "Maria Santos",
    payPeriodStart: "2026-08-01",
    payPeriodEnd: "2026-08-15",
    basicPay: 12500,
    overtimeHours: 4,
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
    totalLoans: 0,
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
    overtimeHours: 0,
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
    totalLoans: 0,
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
    overtimeHours: 8,
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
    totalLoans: 0,
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
    restDayHours: 0,
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

const peso = (n: number) =>
  "₱" + (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

function Line({
  label,
  value,
  borderColor,
}: {
  label: string;
  value: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: `1px solid ${borderColor}`,
      }}
    >
      <Text type="secondary" style={{ fontSize: 13 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </Text>
    </div>
  );
}

export default function PayrollSnapshotCard() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const from = dayjs().startOf("month").format("YYYY-MM-DD");
  const to = dayjs().format("YYYY-MM-DD");
  const { data, isLoading } = usePayrolls({ from, to });
  const rows = data?.data?.length ? data.data : MOCK;

  const totalBasic = rows.reduce((s, r) => s + r.basicPay, 0);
  const totalOT = rows.reduce(
    (s, r) => s + r.overtimePay + r.nightDifferentialPay,
    0,
  );
  const totalAllowances = rows.reduce(
    (s, r) => s + r.totalRegularAllowances + r.totalOtherIncome + r.cola,
    0,
  );
  const totalDeductions = rows.reduce((s, r) => s + r.totalDeductions, 0);
  const totalNet = rows.reduce((s, r) => s + r.netPay, 0);

  return (
    <Card
      size="small"
      className="h-full"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Text
        type="secondary"
        style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}
      >
        Payroll
      </Text>
      <Title level={5} style={{ marginTop: 4, marginBottom: 2 }}>
        Payroll snapshot
      </Title>
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <>
          <div style={{ margin: "8px 0 4px" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: token.colorPrimary,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {peso(totalNet)}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs().format("MMMM YYYY")} · {rows.length} employees
            </Text>
          </div>

          <div style={{ marginTop: 12 }}>
            <Line
              label="Base pay"
              value={peso(totalBasic)}
              borderColor={token.colorBorderSecondary}
            />
            <Line
              label="OT / ND pay"
              value={peso(totalOT)}
              borderColor={token.colorBorderSecondary}
            />
            <Line
              label="Allowances"
              value={peso(totalAllowances)}
              borderColor={token.colorBorderSecondary}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                Deductions
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: token.colorError,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                -{peso(totalDeductions)}
              </Text>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/daily-time-record/for-payroll" })}
            style={{
              marginTop: "auto",
              paddingTop: 12,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: token.colorPrimary,
              fontWeight: 500,
            }}
          >
            View payroll details <ArrowRightOutlined style={{ fontSize: 11 }} />
          </button>
        </>
      )}
    </Card>
  );
}

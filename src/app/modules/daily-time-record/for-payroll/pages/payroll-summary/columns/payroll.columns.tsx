import { Button, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  otPay,
  ndPay,
  basicPay,
  holidayPay,
} from "../../../utils/ot-nd-pay.util";
import {
  fmt,
  holidayDuty,
  restLegalTotal,
  specialTotal,
  restSpecialTotal,
  doubleLegalTotal,
  restDoubleLegalTotal,
  restDayTotal,
} from "../utils/payroll-summary.util";
import {
  statusColumn,
  acknowledgedColumn,
  actionsColumn,
} from "./shared.columns";

const { Text } = Typography;

type Column = ColumnsType<PayrollRunResult>[number];

// Plain right-aligned money column over any row figure.
const money = (
  title: string,
  key: string,
  value: (r: PayrollRunResult) => number | undefined,
): Column => ({
  title,
  key,
  align: "right",
  render: (_, r) => fmt(value(r) ?? 0),
});

const identityColumns: Column[] = [
  {
    title: "Employee",
    dataIndex: "fullName",
    key: "name",
    width: 160,
    fixed: "left",
  },
  statusColumn,
  acknowledgedColumn,
  {
    title: "Salary Type",
    dataIndex: "salaryType",
    key: "salaryType",
    render: (v: string) => (v === "FIXED" ? "Fixed" : "Variable"),
  },
  money("Daily Rate", "dailyRate", (r) => r.dailyRate),
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
];

// Earnings' Holiday figure — folds in the 6 holiday categories' ND-hours day-rate portion under
// Additive mode (see ot-nd-pay.util.ts).
const holidayTotal = (title: string): Column => ({
  title,
  key: "hol",
  align: "right",
  render: (_, r) => fmt(holidayPay(r)),
});

// The 7 holiday categories, mirroring PayslipDocument.cs. Each category total includes its own
// OT/ND/NDOT pay (already counted in the OT/ND columns), so they don't add up to Holiday.
const holidayCategoryColumns: Column[] = [
  money("Legal (Unworked)", "legalUnworked", (r) => r.legalHolidayUnworkedPay),
  money("Legal Duty (Worked)", "holidayDuty", holidayDuty),
  money("RD + Legal", "restLegal", restLegalTotal),
  money("Special", "special", specialTotal),
  money("RD + Special", "restSpecial", restSpecialTotal),
  money("Double Legal", "doubleLegal", doubleLegalTotal),
  money("RD + Double Legal", "restDoubleLegal", restDoubleLegalTotal),
];

const holidayToggle = (expanded: boolean, onToggle: () => void) => (
  <Tooltip
    title={
      expanded
        ? "Hide holiday breakdown"
        : "Show holiday breakdown — each category includes its own OT/ND pay, so the categories don't add up to Total"
    }
  >
    <Button
      type="text"
      size="small"
      icon={expanded ? <DownOutlined /> : <RightOutlined />}
      iconPlacement="end"
      onClick={onToggle}
      className="px-0! font-semibold"
    >
      Holiday
    </Button>
  </Tooltip>
);

const holidayColumn = (expanded: boolean, onToggle: () => void): Column =>
  expanded
    ? {
        title: holidayToggle(expanded, onToggle),
        key: "holidayGroup",
        children: [...holidayCategoryColumns, holidayTotal("Total")],
      }
    : { ...holidayTotal(""), title: holidayToggle(expanded, onToggle) };

const earningsColumns = (
  holidayExpanded: boolean,
  onToggleHoliday: () => void,
): Column[] => [
  // Folds in Regular's ND-hours day-rate portion under Additive mode.
  money("Basic", "basic", basicPay),
  // Folds in NDOT's raw-OT-rate portion under Additive mode.
  money("OT Pay", "ot", otPay),
  // Folds in NDOT's ND-delta portion under Additive mode.
  money("ND Pay", "nd", ndPay),
  // Always shown regardless of OT/ND Calculation Method. Under Additive this pay is already
  // folded into OT Pay/ND Pay above, so it is informational there.
  money("NDOT Pay", "ndot", (r) => r.nightDifferentialOTPay),
  holidayColumn(holidayExpanded, onToggleHoliday),
  money("Rest Day", "restDay", restDayTotal),
  {
    title: "Paid Leave",
    key: "paidLeaves",
    align: "right",
    // FIXED's Basic Pay already covers every day incl. Company-funded paid leave (see
    // PayrollProcessorService.ComputeAllowances), so showing the full amount again would
    // double it up — FIXED shows only the informational Government/Shared/Other slice
    // instead (does not add to Gross). VARIABLE's Basic Pay never includes leave-day pay,
    // so the full amount is shown and does add to Gross.
    render: (_, r) => {
      const value =
        r.salaryType === "FIXED"
          ? r.nonCompanyPaidLeaves
            ? fmt(r.nonCompanyPaidLeaves)
            : "—"
          : fmt(r.paidLeaves ?? 0);
      return r.paidLeaveBreakdown ? (
        <Tooltip title={r.paidLeaveBreakdown}>{value}</Tooltip>
      ) : (
        value
      );
    },
  },
  {
    title: "1x Payout (Co)",
    key: "oneTimeCompany",
    align: "right",
    render: (_, r) =>
      r.companyFundedLeavePay ? (
        <Tooltip title={r.oneTimePayoutBreakdown}>
          {fmt(r.companyFundedLeavePay)}
        </Tooltip>
      ) : (
        "—"
      ),
  },
  {
    title: "1x Payout (Gov)",
    key: "oneTimeGov",
    align: "right",
    render: (_, r) =>
      r.governmentFundedLeavePay ? (
        <Tooltip title={r.oneTimePayoutBreakdown}>
          {fmt(r.governmentFundedLeavePay)}
        </Tooltip>
      ) : (
        "—"
      ),
  },
  money("COLA", "cola", (r) => r.cola),
  money("Allowances", "allow", (r) => r.totalRegularAllowances),
  money("Bonuses", "bonuses", (r) => r.totalBonuses),
  money("Commissions", "commissions", (r) => r.totalCommissions),
  money("De Minimis", "deminimis", (r) => r.totalDeminimises),
  money("Other Income", "other", (r) => r.totalOtherIncome),
  money("Reimbursement", "reimb", (r) => r.reimbursement),
  {
    title: "Gross",
    dataIndex: "grossIncome",
    key: "gross",
    align: "right",
    render: (v: number) => <Text strong>{fmt(v)}</Text>,
  },
  // Setup > Client > Settings > Allowances > Retirement (days/year) -- this run's computed
  // accrual, informational only. Excluded from Gross -- see backend
  // EmployeePayrollLineService.ComputeRetirementAccrual.
  money("Retirement Accrual", "retirementAccrual", (r) => r.retirementAccrual),
];

const deductionColumns: Column[] = [
  money("SSS", "sss", (r) => r.sssContribution),
  money("PhilHealth", "phic", (r) => r.philHealthContribution),
  money("Pag-IBIG", "hdmf", (r) => r.pagIbigContribution),
  money("W-Tax", "tax", (r) => r.withholdingTax),
  money("Cash Bond", "cashBond", (r) => r.cashBondDeduction),
  money("Loans", "loans", (r) => r.totalLoans),
  money(
    "Other Deductions",
    "otherDed",
    (r) => r.otherDeductions - r.totalLoans,
  ),
  money("Late/UT", "late", (r) => r.lateAmount + r.underTimeAmount),
  money("Absent", "abs", (r) => r.absencesAmount),
];

export interface PayrollColumnsOptions {
  onPrint: (r: PayrollRunResult) => void;
  holidayExpanded: boolean;
  onToggleHoliday: () => void;
}

// One row reads earnings -> Gross -> deductions -> Net. Employee is pinned left and Net Pay +
// print pinned right so the figures stay readable while scrolling the wide middle.
export const payrollColumns = ({
  onPrint,
  holidayExpanded,
  onToggleHoliday,
}: PayrollColumnsOptions): ColumnsType<PayrollRunResult> => [
  ...identityColumns,
  {
    title: "Earnings",
    key: "earnings",
    children: earningsColumns(holidayExpanded, onToggleHoliday),
  },
  { title: "Deductions", key: "deductions", children: deductionColumns },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "net",
    align: "right",
    fixed: "right",
    render: (v: number) => (
      <Text strong className="text-(--primary)!">
        {fmt(v)}
      </Text>
    ),
  },
  actionsColumn(onPrint),
];

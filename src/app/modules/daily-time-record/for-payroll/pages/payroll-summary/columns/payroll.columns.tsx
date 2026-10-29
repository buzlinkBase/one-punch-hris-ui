import { Button, Tag, Tooltip, Typography } from "antd";
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
  type BreakdownSpec,
  breakdownAmount,
  breakdownRemainder,
  breakdownTypes,
  fmt,
  hasBreakdownRemainder,
  holidayDuty,
  loansBreakdown,
  otherDeductionsBreakdown,
  otherIncomeBreakdown,
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
import { totalCell, type OpenSource } from "./source-link";

const { Text } = Typography;

type Column = ColumnsType<PayrollRunResult>[number];

// The totals that can unfold into the columns behind them.
export type ExpandableGroup =
  "holiday" | "loans" | "otherDeductions" | "otherIncome";

// What the expandable groups need: which are open, how to flip one, and the rows whose types
// become the unfolded columns.
export interface ColumnContext {
  results: PayrollRunResult[];
  expanded: Record<ExpandableGroup, boolean>;
  onToggle: (group: ExpandableGroup) => void;
  // Opens the breakdown popup behind a total (omit to keep totals as plain money).
  onOpenSource?: OpenSource;
}

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

// A total that can expand into the columns behind it (Holiday's categories, a deduction or Other
// Income type per column). Collapsed it is just the total, headed by a toggle button; expanded it
// becomes a group of `children` ending in that same total.
interface CollapsibleGroup {
  label: string;
  groupKey: string;
  expanded: boolean;
  onToggle: () => void;
  expandedHint: string;
  children: Column[];
  total: (title: string) => Column;
}

const groupToggle = ({
  label,
  expanded,
  onToggle,
  expandedHint,
}: CollapsibleGroup) => (
  <Tooltip title={expanded ? `Hide ${label} breakdown` : expandedHint}>
    <Button
      type="text"
      size="small"
      icon={expanded ? <DownOutlined /> : <RightOutlined />}
      iconPlacement="end"
      onClick={onToggle}
      className="px-0! font-semibold"
    >
      {label}
    </Button>
  </Tooltip>
);

const collapsibleGroup = (group: CollapsibleGroup): Column =>
  group.expanded
    ? {
        title: groupToggle(group),
        key: group.groupKey,
        children: [...group.children, group.total("Total")],
      }
    : { ...group.total(""), title: groupToggle(group) };

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
  money(
    "Reg Hol (Unworked)",
    "legalUnworked",
    (r) => r.legalHolidayUnworkedPay,
  ),
  money("Reg Hol Duty (Worked)", "holidayDuty", holidayDuty),
  money("RD + Reg Hol", "restLegal", restLegalTotal),
  money("Special", "special", specialTotal),
  money("RD + Special", "restSpecial", restSpecialTotal),
  money("Double Reg Hol", "doubleLegal", doubleLegalTotal),
  money("RD + Double Reg Hol", "restDoubleLegal", restDoubleLegalTotal),
];

const holidayColumn = ({ expanded, onToggle }: ColumnContext): Column =>
  collapsibleGroup({
    label: "Holiday",
    groupKey: "holidayGroup",
    expanded: expanded.holiday,
    onToggle: () => onToggle("holiday"),
    expandedHint:
      "Show holiday breakdown — each category includes its own OT/ND pay, so the categories don't add up to Total",
    children: holidayCategoryColumns,
    total: holidayTotal,
  });

// One column per type behind a total (every employee's loans / other deductions / Other Income),
// plus an Adjustments column only when some row's total holds more than its itemized types.
const breakdownColumns = (
  results: PayrollRunResult[],
  spec: BreakdownSpec,
  keyPrefix: string,
): Column[] => [
  ...breakdownTypes(results, spec).map(({ itemId, label }) =>
    money(label, `${keyPrefix}:${itemId}`, (r) =>
      breakdownAmount(r, spec, itemId),
    ),
  ),
  ...(hasBreakdownRemainder(results, spec)
    ? [
        money("Adjustments", `${keyPrefix}:adj`, (r) =>
          breakdownRemainder(r, spec),
        ),
      ]
    : []),
];

const breakdownGroup = (
  group: ExpandableGroup,
  label: string,
  key: string,
  spec: BreakdownSpec,
  { results, expanded, onToggle, onOpenSource }: ColumnContext,
): Column =>
  collapsibleGroup({
    label,
    groupKey: `${key}Group`,
    expanded: expanded[group],
    onToggle: () => onToggle(group),
    expandedHint: `Show ${label} per type — Adjustments covers Salary Adjustments and runs saved before types were recorded`,
    children: breakdownColumns(results, spec, key),
    total: (title) => ({
      title,
      key,
      align: "right",
      render: (_, r) => totalCell(r, spec, label, onOpenSource),
    }),
  });

const earningsColumns = (ctx: ColumnContext): Column[] => [
  // Folds in Regular's ND-hours day-rate portion under Additive mode.
  money("Basic", "basic", basicPay),
  // Folds in NDOT's raw-OT-rate portion under Additive mode.
  money("OT Pay", "ot", otPay),
  // Folds in NDOT's ND-delta portion under Additive mode.
  money("ND Pay", "nd", ndPay),
  // Always shown regardless of OT/ND Calculation Method. Under Additive this pay is already
  // folded into OT Pay/ND Pay above, so it is informational there.
  money("NDOT Pay", "ndot", (r) => r.nightDifferentialOTPay),
  holidayColumn(ctx),
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
  breakdownGroup(
    "otherIncome",
    "Other Income",
    "other",
    otherIncomeBreakdown,
    ctx,
  ),
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

const deductionColumns = (ctx: ColumnContext): Column[] => [
  money("SSS", "sss", (r) => r.sssContribution),
  money("PhilHealth", "phic", (r) => r.philHealthContribution),
  money("Pag-IBIG", "hdmf", (r) => r.pagIbigContribution),
  money("W-Tax", "tax", (r) => r.withholdingTax),
  money("Cash Bond", "cashBond", (r) => r.cashBondDeduction),
  breakdownGroup("loans", "Loans", "loans", loansBreakdown, ctx),
  breakdownGroup(
    "otherDeductions",
    "Other Deductions",
    "otherDed",
    otherDeductionsBreakdown,
    ctx,
  ),
  money("Late/UT", "late", (r) => r.lateAmount + r.underTimeAmount),
  money("Absent", "abs", (r) => r.absencesAmount),
];

// Setup > Company Policy > "which payroll run takes the deductions": a run that pays an employee
// earnings only (another run of the same cutoff takes their contributions, tax, loans and other
// income). Shown only when some row in the list is such a run, so it never appears for companies
// that don't use the rule.
const carrierColumn: Column = {
  title: "Deductions",
  key: "carrier",
  width: 130,
  render: (_, r) =>
    r.isDeductionCarrier === false ? (
      <Tooltip title="Another run of this cutoff takes this employee's government contributions, tax, loans and other income. This run pays earnings only.">
        <Tag>Earnings only</Tag>
      </Tooltip>
    ) : (
      <Tag color="green">Taken here</Tag>
    ),
};

export interface PayrollColumnsOptions extends ColumnContext {
  onPrint: (r: PayrollRunResult) => void;
  // Takes one employee out of a draft run (omit to hide the action).
  onUnsave?: (r: PayrollRunResult) => void;
}

// One row reads earnings -> Gross -> deductions -> Net. Employee is pinned left and Net Pay +
// print pinned right so the figures stay readable while scrolling the wide middle.
export const payrollColumns = ({
  onPrint,
  onUnsave,
  ...ctx
}: PayrollColumnsOptions): ColumnsType<PayrollRunResult> => [
  ...identityColumns,
  ...(ctx.results.some((r) => r.isDeductionCarrier === false)
    ? [carrierColumn]
    : []),
  {
    title: "Earnings",
    key: "earnings",
    children: earningsColumns(ctx),
  },
  {
    title: "Deductions",
    key: "deductions",
    children: deductionColumns(ctx),
  },
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
  actionsColumn(onPrint, onUnsave),
];

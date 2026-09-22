import { Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  otPay,
  ndPay,
  basicPay,
  holidayPay,
} from "../../../utils/ot-nd-pay.util";
import { fmt, restDayTotal } from "../utils/payroll-summary.util";
import {
  statusColumn,
  acknowledgedColumn,
  actionsColumn,
} from "./shared.columns";

const { Text } = Typography;

export const earningsColumns = (
  onPrint: (r: PayrollRunResult) => void,
): ColumnsType<PayrollRunResult> => [
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
  {
    title: "Daily Rate",
    dataIndex: "dailyRate",
    key: "dailyRate",
    align: "right",
    render: fmt,
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
    // Folds in Regular's ND-hours day-rate portion under Additive mode — see
    // ot-nd-pay.util.ts.
    title: "Basic",
    key: "basic",
    align: "right",
    render: (_, r) => fmt(basicPay(r)),
  },
  {
    // Folds in NDOT's raw-OT-rate portion under Additive mode — see ot-nd-pay.util.ts.
    title: "OT Pay",
    key: "ot",
    align: "right",
    render: (_, r) => fmt(otPay(r)),
  },
  {
    // Folds in NDOT's ND-delta portion under Additive mode — see ot-nd-pay.util.ts.
    title: "ND Pay",
    key: "nd",
    align: "right",
    render: (_, r) => fmt(ndPay(r)),
  },
  {
    title: "Rest Day",
    key: "restDay",
    align: "right",
    render: (_, r) => fmt(restDayTotal(r)),
  },
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
  {
    // Folds in the 6 holiday categories' ND-hours day-rate portion under Additive mode — see
    // ot-nd-pay.util.ts. NOT the same figure as the Holiday Breakdown tab's own "Holiday
    // Total" column, which is already a self-contained sum of fully-blended per-category
    // totals and must not also receive this fold.
    title: "Holiday Total",
    key: "hol",
    align: "right",
    render: (_, r) => fmt(holidayPay(r)),
  },
  {
    title: "COLA",
    dataIndex: "cola",
    key: "cola",
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
    title: "Bonuses",
    dataIndex: "totalBonuses",
    key: "bonuses",
    align: "right",
    render: fmt,
  },
  {
    title: "Commissions",
    dataIndex: "totalCommissions",
    key: "commissions",
    align: "right",
    render: fmt,
  },
  {
    title: "De Minimis",
    dataIndex: "totalDeminimises",
    key: "deminimis",
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
    // Setup > Client > Settings > Allowances > Retirement (days/year) -- this run's computed
    // accrual, informational only. Excluded from Gross -- see backend
    // EmployeePayrollLineService.ComputeRetirementAccrual.
    title: "Retirement Accrual",
    dataIndex: "retirementAccrual",
    key: "retirementAccrual",
    align: "right",
    render: (v?: number) => fmt(v ?? 0),
  },
  {
    title: "Gross",
    dataIndex: "grossIncome",
    key: "gross",
    align: "right",
    fixed: "right",
    render: (v: number) => <Text strong>{fmt(v)}</Text>,
  },
  actionsColumn(onPrint),
];

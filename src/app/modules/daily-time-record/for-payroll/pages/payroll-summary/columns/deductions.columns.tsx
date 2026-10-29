import { Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  type BreakdownSpec,
  breakdownAmount,
  breakdownRemainder,
  breakdownTypes,
  fmt,
  hasBreakdownRemainder,
  loansBreakdown,
  otherDeductionsBreakdown,
} from "../utils/payroll-summary.util";
import { totalCell, type OpenSource } from "./source-link";

const { Text } = Typography;

type Column = ColumnsType<PayrollRunResult>[number];

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

// A group header over one column per type, an Adjustments column only when some row's total
// holds more than its itemized types, then the group's total — always unfolded here, unlike the
// Payroll tab's toggles.
const breakdownGroup = (
  label: string,
  key: string,
  spec: BreakdownSpec,
  results: PayrollRunResult[],
  onOpenSource?: OpenSource,
): Column => ({
  title: label,
  key: `${key}Group`,
  children: [
    ...breakdownTypes(results, spec).map(({ itemId, label: typeLabel }) =>
      money(typeLabel, `${key}:${itemId}`, (r) =>
        breakdownAmount(r, spec, itemId),
      ),
    ),
    ...(hasBreakdownRemainder(results, spec)
      ? [money("Adjustments", `${key}:adj`, (r) => breakdownRemainder(r, spec))]
      : []),
    {
      title: "Total",
      key,
      align: "right",
      render: (_, r) => totalCell(r, spec, label, onOpenSource),
    },
  ],
});

// Every deduction on the run in one place: contributions and tax, each loan / other deduction
// type, then attendance deductions, ending in Total Deductions.
export const deductionsColumns = (
  results: PayrollRunResult[],
  onOpenSource?: OpenSource,
): ColumnsType<PayrollRunResult> => [
  {
    title: "Employee",
    dataIndex: "fullName",
    key: "name",
    width: 160,
    fixed: "left",
  },
  money("SSS", "sss", (r) => r.sssContribution),
  money("PhilHealth", "phic", (r) => r.philHealthContribution),
  money("Pag-IBIG", "hdmf", (r) => r.pagIbigContribution),
  money("W-Tax", "tax", (r) => r.withholdingTax),
  money("Cash Bond", "cashBond", (r) => r.cashBondDeduction),
  breakdownGroup("Loans", "loans", loansBreakdown, results, onOpenSource),
  breakdownGroup(
    "Other Deductions",
    "otherDed",
    otherDeductionsBreakdown,
    results,
    onOpenSource,
  ),
  money("Late", "late", (r) => r.lateAmount),
  money("Undertime", "ut", (r) => r.underTimeAmount),
  // Variable-rate employees aren't paid for absent days to begin with, so nothing is deducted.
  money("Absent", "abs", (r) =>
    r.salaryType === "FIXED" ? r.absencesAmount : 0,
  ),
  {
    title: "Total Deductions",
    key: "totalDeductions",
    align: "right",
    fixed: "right",
    render: (_, r) => <Text strong>{fmt(r.totalDeductions)}</Text>,
  },
];

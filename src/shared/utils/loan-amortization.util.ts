import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";
import { formatMoney, roundMoney } from "@/shared/utils/money.util";

export interface LoanBreakdownRow {
  // The stored installment's id; absent for freshly generated rows, which the API adds as new.
  id?: string;
  period: number;
  date: string;
  principal: number;
  interest: number;
  amount: number;
  balance: number;
}

const PERIODS_PER_YEAR: Record<string, number> = {
  Daily: 365,
  Weekly: 52,
  SemiMonthly: 24,
  Monthly: 12,
};

export function generateLoanBreakdown(
  principal: number,
  interestRate: number,
  terms: number,
  startDate: string,
  frequency: string,
): LoanBreakdownRow[] {
  if (!principal || !terms || !startDate || !frequency) return [];

  const periodsPerYear = PERIODS_PER_YEAR[frequency] ?? 12;
  const periodRate = interestRate / 100 / periodsPerYear;

  let payment: number;
  if (periodRate === 0) {
    payment = principal / terms;
  } else {
    payment =
      (principal * periodRate * Math.pow(1 + periodRate, terms)) /
      (Math.pow(1 + periodRate, terms) - 1);
  }

  const daysMap: Record<string, number> = {
    Daily: 1,
    Weekly: 7,
    SemiMonthly: 15,
    Monthly: 30,
  };
  const stepDays = daysMap[frequency] ?? 30;

  // Payroll deducts each installment as-is, so every figure is in whole centavos. Rounding the
  // level payment leaves a few centavos over or under by the end; the last installment takes
  // exactly what's left, so the schedule sums to the principal plus its interest.
  const level = roundMoney(payment);
  const rows: LoanBreakdownRow[] = [];
  let balance = roundMoney(principal);
  let currentDate = dayjs(startDate);

  for (let i = 1; i <= terms; i++) {
    const interest = roundMoney(balance * periodRate);
    const principalPart =
      i === terms ? balance : Math.min(balance, roundMoney(level - interest));
    balance = roundMoney(balance - principalPart);

    rows.push({
      period: i,
      date: currentDate.format("YYYY-MM-DD"),
      principal: principalPart,
      interest,
      amount: roundMoney(principalPart + interest),
      balance,
    });

    if (frequency === "SemiMonthly") {
      // alternate between +15 and month-end
      const day = currentDate.date();
      if (day <= 15) {
        currentDate = currentDate.endOf("month").startOf("day");
      } else {
        currentDate = currentDate
          .add(1, "month")
          .startOf("month")
          .add(14, "day");
      }
    } else {
      currentDate = currentDate.add(stepDays, "day");
    }
  }

  return rows;
}

// After a payment was hand-edited or removed: each row keeps its interest, its principal becomes
// whatever of the payment is left over, and the running balance is rebuilt from the loan principal.
// A locked row (already used by payroll) keeps its stored principal: the API refuses any change.
export function recomputeLoanBalances<T extends LoanBreakdownRow>(
  rows: T[],
  principal: number,
  isLocked: (row: T) => boolean = () => false,
): T[] {
  let balance = principal;
  return rows.map((r) => {
    const principalPart = isLocked(r)
      ? r.principal
      : roundMoney(Math.max(0, r.amount - r.interest));
    balance = Math.max(0, roundMoney(balance - principalPart));
    return { ...r, principal: principalPart, balance };
  });
}

// A stored installment's own `balance` is what is still owed on that one payment (its amount until
// payroll takes it, then 0), not a running balance. For display, rebuild the running balance: what
// remains of the whole schedule after each payment.
export function withRunningBalance<
  T extends { amount: number; balance: number },
>(rows: T[]): T[] {
  let remaining = rows.reduce((sum, r) => sum + r.amount, 0);
  return rows.map((r) => {
    remaining = Math.max(0, roundMoney(remaining - r.amount));
    return { ...r, balance: remaining };
  });
}

export const loanBreakdownColumns: ColumnsType<LoanBreakdownRow> = [
  {
    title: "#",
    dataIndex: "period",
    key: "period",
    width: 50,
    align: "center",
  },
  { title: "Date", dataIndex: "date", key: "date", width: 120 },
  {
    title: "Principal",
    dataIndex: "principal",
    key: "principal",
    align: "right",
    render: (v: number) => formatMoney(v),
  },
  {
    title: "Interest",
    dataIndex: "interest",
    key: "interest",
    align: "right",
    render: (v: number) => formatMoney(v),
  },
  {
    title: "Payment",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (v: number) => formatMoney(v),
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "right",
    render: (v: number) => formatMoney(v),
  },
];

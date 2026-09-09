import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

export interface LoanBreakdownRow {
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

  const rows: LoanBreakdownRow[] = [];
  let balance = principal;
  let currentDate = dayjs(startDate);

  for (let i = 1; i <= terms; i++) {
    const interest = balance * periodRate;
    const principalPart = payment - interest;
    balance = Math.max(0, balance - principalPart);

    rows.push({
      period: i,
      date: currentDate.format("YYYY-MM-DD"),
      principal: +principalPart.toFixed(4),
      interest: +interest.toFixed(4),
      amount: +payment.toFixed(4),
      balance: +balance.toFixed(4),
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
    render: (v: number) =>
      (v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
  },
  {
    title: "Interest",
    dataIndex: "interest",
    key: "interest",
    align: "right",
    render: (v: number) =>
      (v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
  },
  {
    title: "Payment",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (v: number) =>
      (v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "right",
    render: (v: number) =>
      (v ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
  },
];

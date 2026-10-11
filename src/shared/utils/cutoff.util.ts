import dayjs from "dayjs";

/** 1st of last month through the end of the current month -- the latest run may belong to the previous period. */
export function getLastMonthToCurrentRange(): {
  fromDate: string;
  toDate: string;
} {
  const today = dayjs();
  return {
    fromDate: today.subtract(1, "month").startOf("month").format("YYYY-MM-DD"),
    toDate: today.endOf("month").format("YYYY-MM-DD"),
  };
}

/** The semi-monthly cutoff (1st-15th, or 16th-end of month) that today falls within. */
export function getSemiMonthlyCutoff(): { fromDate: string; toDate: string } {
  const today = dayjs();
  const day = today.date();
  if (day <= 15) {
    return {
      fromDate: today.startOf("month").format("YYYY-MM-DD"),
      toDate: today.date(15).format("YYYY-MM-DD"),
    };
  }
  return {
    fromDate: today.date(16).format("YYYY-MM-DD"),
    toDate: today.endOf("month").format("YYYY-MM-DD"),
  };
}

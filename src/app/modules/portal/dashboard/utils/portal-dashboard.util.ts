import dayjs from "dayjs";
import {
  isActiveLoan,
  summarizeLoan,
} from "../../deductions/utils/deduction-ledger.util";
import type { DeductionApplicationResponse } from "@/app/modules/applications/deduction-application/models/api/response/deduction-application-response.model";
import type {
  PortalVisibilityKey,
  PortalVisibilityResponse,
} from "../../shared/models/api/response/portal-visibility-response.model";
import { formatMoney } from "@/shared/utils/money.util";

export const DATE_FORMAT = "YYYY-MM-DD";

/** Backend status of a request still waiting on its approvers. */
const PENDING_STATUS = "ForApproval";

export const fmtAmount = (n: number) => formatMoney(n);

export const fmtDays = (n: number) =>
  Number.isInteger(n) ? String(n) : n.toFixed(2);

/** Month-to-date window used to look for incomplete punches. */
export function monthToDateRange(today = dayjs()) {
  return {
    from: today.startOf("month").format(DATE_FORMAT),
    to: today.format(DATE_FORMAT),
  };
}

/** Today plus the next six days. */
export function nextWeekRange(today = dayjs()) {
  return {
    from: today.format(DATE_FORMAT),
    to: today.add(6, "day").format(DATE_FORMAT),
  };
}

/** Total still owed across the employee's active (approved, unpaid) loans. */
export function totalLoanBalance(loans: DeductionApplicationResponse[]) {
  return loans
    .filter(isActiveLoan)
    .reduce((sum, loan) => sum + summarizeLoan(loan).balance, 0);
}

export function countPending(items: { approvalStatus?: string }[]) {
  return items.filter((i) => i.approvalStatus === PENDING_STATUS).length;
}

/** The request lists the Pending Requests card adds up, in the order its link prefers them. */
const REQUEST_PAGES: { key: PortalVisibilityKey; path: string }[] = [
  { key: "showLeaveApplications", path: "/portal/leave-applications" },
  { key: "showOvertime", path: "/portal/overtime" },
  { key: "showOfficialBusiness", path: "/portal/official-business" },
  { key: "showPassSlip", path: "/portal/pass-slip" },
];

/** First request page the company still has on, or undefined once all four are off. */
export function firstVisibleRequestPath(
  visibility: PortalVisibilityResponse | undefined,
) {
  return REQUEST_PAGES.find((page) => visibility?.[page.key] ?? true)?.path;
}

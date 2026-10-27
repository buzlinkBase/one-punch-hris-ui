import dayjs from "dayjs";
import type { ApprovalDelegationResponse } from "../models/approval-delegation.model";
import { APPLICATION_TYPE_LABEL } from "@/app/modules/setup/approval-workflows/constants/label.const";

const DAY = "MMM D, YYYY";

/** "Oct 5 – Oct 9, 2026", "From Oct 5, 2026", "Until Oct 9, 2026" or "Until switched off". */
export function describeDelegationDates(
  d: Pick<ApprovalDelegationResponse, "fromDate" | "toDate">,
): string {
  if (d.fromDate && d.toDate)
    return `${dayjs(d.fromDate).format(DAY)} – ${dayjs(d.toDate).format(DAY)}`;
  if (d.fromDate) return `From ${dayjs(d.fromDate).format(DAY)}`;
  if (d.toDate) return `Until ${dayjs(d.toDate).format(DAY)}`;
  return "Until switched off";
}

export function describeDelegationType(
  d: Pick<ApprovalDelegationResponse, "applicationType">,
): string {
  return d.applicationType
    ? APPLICATION_TYPE_LABEL[d.applicationType]
    : "All requests";
}

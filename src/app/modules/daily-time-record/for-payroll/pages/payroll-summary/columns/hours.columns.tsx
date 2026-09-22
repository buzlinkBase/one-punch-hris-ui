import type { ColumnsType } from "antd/es/table";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import { fmtH } from "../utils/payroll-summary.util";

// Full Hrs/OT/ND/ND-OT breakdown per pay category, mirroring the DTR Detail table's
// grouping exactly (dtr-detail-table.tsx) so Payroll Summary has the same granularity
// once DTR rows are rolled up into a run — see backend ComputeHoursBreakdown.
const hourCol = (
  title: string,
  dataIndex: keyof PayrollRunResult,
  key: string,
): ColumnsType<PayrollRunResult>[number] => ({
  title,
  dataIndex,
  key,
  align: "right",
  render: fmtH,
});

export const hoursColumns: ColumnsType<PayrollRunResult> = [
  {
    title: "Employee",
    dataIndex: "fullName",
    key: "name",
    width: 160,
    fixed: "left",
  },
  hourCol("Regular", "regularNetHours", "reg"),
  hourCol("Reg OT", "regularOTHours", "regot"),
  hourCol("Reg ND", "regularNDHours", "regnd"),
  hourCol("Reg ND-OT", "regularNDOTHours", "regndot"),
  hourCol("Rest Day", "restDayHours", "rd"),
  hourCol("RD OT", "restDayOTHours", "rdot"),
  hourCol("RD ND", "restDayNDHours", "rdnd"),
  hourCol("RD ND-OT", "restDayNDOTHours", "rdndot"),
  hourCol("Legal Hol", "legalHolHours", "lh"),
  hourCol("Legal OT", "legalHolOTHours", "lhot"),
  hourCol("Legal ND", "legalHolNightDiffHours", "lhnd"),
  hourCol("Legal ND-OT", "legalHolNightDiffOTHours", "lhndot"),
  hourCol("Special Hol", "specialHolHours", "sh"),
  hourCol("Special OT", "specialHolOTHours", "shot"),
  hourCol("Special ND", "specialHolNightDiffHours", "shnd"),
  hourCol("Special ND-OT", "specialHolNightDiffOTHours", "shndot"),
  hourCol("RD+Legal", "restLegalDayHours", "rdlh"),
  hourCol("RD+Legal OT", "restLegalDayOTHours", "rdlhot"),
  hourCol("RD+Legal ND", "restLegalDayNDHours", "rdlhnd"),
  hourCol("RD+Legal ND-OT", "restLegalDayNDOTHours", "rdlhndot"),
  hourCol("RD+Special", "restSpecialDayHours", "rdsh"),
  hourCol("RD+Special OT", "restSpecialDayOTHours", "rdshot"),
  hourCol("RD+Special ND", "restSpecialDayNDHours", "rdshnd"),
  hourCol("RD+Special ND-OT", "restSpecialDayNDOTHours", "rdshndot"),
  hourCol("Double Legal", "doubleLegalHours", "dl"),
  hourCol("Double Legal OT", "doubleLegalOTHours", "dlot"),
  hourCol("Double Legal ND", "doubleLegalNDHours", "dlnd"),
  hourCol("Double Legal ND-OT", "doubleLegalNDOTHours", "dlndot"),
  hourCol("RD+Double Legal", "restDoubleLegalHours", "rdl"),
  hourCol("RD+Double Legal OT", "restDoubleLegalOTHours", "rdlot"),
  hourCol("RD+Double Legal ND", "restDoubleLegalNDHours", "rdlnd"),
  hourCol("RD+Double Legal ND-OT", "restDoubleLegalNDOTHours", "rdlndot"),
  hourCol("OB Hrs", "obHours", "ob"),
  hourCol("Paid Leave Hrs", "paidLeaveHours", "pl"),
  hourCol("Unpaid Leave Hrs", "unpaidLeaveHours", "upl"),
  {
    title: "OT Total Hr",
    dataIndex: "overtimeHours",
    key: "ottotal",
    align: "right",
    fixed: "right",
    render: fmtH,
  },
];

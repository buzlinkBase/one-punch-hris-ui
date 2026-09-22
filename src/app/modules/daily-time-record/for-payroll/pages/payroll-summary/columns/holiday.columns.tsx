import { Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import {
  fmt,
  holidayDuty,
  restLegalTotal,
  specialTotal,
  restSpecialTotal,
  doubleLegalTotal,
  restDoubleLegalTotal,
} from "../utils/payroll-summary.util";

const { Text } = Typography;

export const holidayColumns: ColumnsType<PayrollRunResult> = [
  {
    title: "Employee",
    dataIndex: "fullName",
    key: "name",
    width: 160,
    fixed: "left",
  },
  {
    title: "Legal Holiday (Unworked)",
    key: "legalUnworked",
    align: "right",
    render: (_, r) => fmt(r.legalHolidayUnworkedPay ?? 0),
  },
  {
    title: "Legal Holiday Duty (Worked)",
    key: "holidayDuty",
    align: "right",
    render: (_, r) => fmt(holidayDuty(r)),
  },
  {
    title: "Rest Day + Legal Holiday",
    key: "restLegal",
    align: "right",
    render: (_, r) => fmt(restLegalTotal(r)),
  },
  {
    title: "Special Holiday",
    key: "special",
    align: "right",
    render: (_, r) => fmt(specialTotal(r)),
  },
  {
    title: "Rest Day + Special Holiday",
    key: "restSpecial",
    align: "right",
    render: (_, r) => fmt(restSpecialTotal(r)),
  },
  {
    title: "Double Legal Holiday",
    key: "doubleLegal",
    align: "right",
    render: (_, r) => fmt(doubleLegalTotal(r)),
  },
  {
    title: "Rest Day + Double Legal Holiday",
    key: "restDoubleLegal",
    align: "right",
    render: (_, r) => fmt(restDoubleLegalTotal(r)),
  },
  {
    title: "Holiday Total",
    dataIndex: "holidayPay",
    key: "hol",
    align: "right",
    fixed: "right",
    render: (v: number) => <Text strong>{fmt(v)}</Text>,
  },
];

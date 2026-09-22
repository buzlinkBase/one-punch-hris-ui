import type { ColumnsType } from "antd/es/table";
import type { PayrollRunResult } from "../../../models/api/response/payroll-run-result.model";
import { fmt } from "../utils/payroll-summary.util";

export const erColumns: ColumnsType<PayrollRunResult> = [
  { title: "Employee", dataIndex: "fullName", key: "name", width: 160 },
  {
    title: "ER SSS",
    dataIndex: "employerSSSContribution",
    key: "ersss",
    align: "right",
    render: fmt,
  },
  {
    title: "ER PhilHealth",
    dataIndex: "employerPhilHealthContribution",
    key: "erphic",
    align: "right",
    render: fmt,
  },
  {
    title: "ER Pag-IBIG",
    dataIndex: "employerPagIbigContribution",
    key: "erhdmf",
    align: "right",
    render: fmt,
  },
  {
    title: "EC",
    dataIndex: "employerECContribution",
    key: "ec",
    align: "right",
    render: fmt,
  },
  {
    title: "Total ER Cost",
    key: "ertotal",
    align: "right",
    render: (_, r) =>
      fmt(
        r.employerSSSContribution +
          r.employerPhilHealthContribution +
          r.employerPagIbigContribution +
          r.employerECContribution,
      ),
  },
];

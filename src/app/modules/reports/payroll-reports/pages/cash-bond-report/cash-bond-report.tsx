import { useState } from "react";
import { Button, DatePicker, Form, Space, Tooltip, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import {
  BalanceAdjustModal,
  type BalanceAdjustSubmitValues,
  type BalanceAdjustTarget,
} from "../../components/balance-adjust-modal/balance-adjust-modal";
import {
  useAdjustCashBond,
  useCashBondReport,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { CashBondReportResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Cash Bond Rate",
  "Beginning / Adjustments",
  "From Payroll",
  "Total Collected",
  "Payroll Runs",
];

const toRows = (records: CashBondReportResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    fmt(r.cashBondRate),
    fmt(r.adjustments),
    fmt(r.collectedFromPayroll),
    fmt(r.totalCollected),
    String(r.payrollRunsCount),
  ]);

const columns: ColumnsType<CashBondReportResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "Cash Bond Rate",
    dataIndex: "cashBondRate",
    key: "rate",
    align: "right",
    render: fmt,
  },
  {
    title: (
      <Tooltip title="Entered by HR, e.g. cash bond already deducted before this system">
        Beginning / Adjustments
      </Tooltip>
    ),
    dataIndex: "adjustments",
    key: "adjustments",
    align: "right",
    render: (v: number) => (v !== 0 ? fmt(v) : ""),
  },
  {
    title: "From Payroll",
    dataIndex: "collectedFromPayroll",
    key: "fromPayroll",
    align: "right",
    render: fmt,
  },
  {
    title: "Total Collected",
    dataIndex: "totalCollected",
    key: "collected",
    align: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
  {
    title: "Payroll Runs",
    dataIndex: "payrollRunsCount",
    key: "runs",
    align: "right",
  },
];

export default function CashBondReport() {
  const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
  const { data = [], isLoading, refetch } = useCashBondReport(asOf);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  // "add" = toolbar entry for any employee (e.g. an opening balance for someone with no cash
  // bond collected in this system yet); a target = adjusting one row's total.
  const [adjustModal, setAdjustModal] = useState<
    "add" | BalanceAdjustTarget | null
  >(null);
  const { mutateAsync: adjust, isPending: isAdjusting } = useAdjustCashBond();

  const handleAdjustSubmit = async (values: BalanceAdjustSubmitValues) => {
    try {
      await adjust(values);
      message.success(
        adjustModal === "add" ? "Entry added." : "Cash bond adjusted.",
      );
      setAdjustModal(null);
    } catch {
      // The request error (e.g. nothing left to remove) is already shown by the HTTP client.
    }
  };

  const displayColumns: ColumnsType<CashBondReportResponse> = [
    ...columns,
    {
      title: "",
      key: "adjust",
      width: 48,
      fixed: "right",
      render: (_, r) => (
        <PermissionGate permission="Payroll Reports:Edit">
          <Tooltip title="Adjust cash bond">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              aria-label="Adjust cash bond"
              onClick={() =>
                setAdjustModal({
                  employeeId: r.employeeId,
                  employeeName: r.fullName,
                  balance: r.totalCollected,
                })
              }
            />
          </Tooltip>
        </PermissionGate>
      ),
    },
  ];

  return (
    <>
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.CASH_BOND_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.CASH_BOND_SUBTITLE}
        data={employeeFilter.filtered}
        loading={isLoading}
        columns={displayColumns}
        onRefresh={() => refetch()}
        rowKey={(r) => r.employeeId}
        exportFileName="cash-bond-tracking"
        exportHeaders={EXPORT_HEADERS}
        exportRows={toRows}
        extraActions={
          <Space>
            <PermissionGate permission="Payroll Reports:Edit">
              <Tooltip title="Add entry (e.g. opening balance)">
                <Button
                  icon={<PlusOutlined />}
                  aria-label="Add cash bond entry"
                  onClick={() => setAdjustModal("add")}
                />
              </Tooltip>
            </PermissionGate>
          </Space>
        }
        filters={
          <Form layout="vertical">
            <div className="flex items-end gap-4 flex-wrap">
              <Form.Item label="As Of" className="mb-0 w-56">
                <DatePicker
                  className="w-full"
                  value={dayjs(asOf)}
                  allowClear={false}
                  onChange={(date) =>
                    date && setAsOf(date.format("YYYY-MM-DD"))
                  }
                />
              </Form.Item>
              <ReportNameFilter
                label="Employee"
                options={employeeFilter.options}
                value={employeeFilter.selected}
                onChange={employeeFilter.setSelected}
              />
            </div>
          </Form>
        }
      />

      <BalanceAdjustModal
        open={adjustModal !== null}
        onClose={() => setAdjustModal(null)}
        target={adjustModal === "add" ? null : adjustModal}
        onSubmit={handleAdjustSubmit}
        isSubmitting={isAdjusting}
        showEntryDate
      />
    </>
  );
}

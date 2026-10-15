import { useState } from "react";
import { Button, DatePicker, Form, Tooltip, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import { EmployeeScopeFilters } from "../../components/employee-scope-filters/employee-scope-filters";
import type { EmployeeScopeFilter } from "../../models/api/request/employee-scope-filter.model";
import {
  BalanceAdjustModal,
  type BalanceAdjustSubmitValues,
} from "../../components/balance-adjust-modal/balance-adjust-modal";
import { LedgerDrawer } from "../../components/ledger-drawer/ledger-drawer";
import {
  useAdjustLeaveCredits,
  useLeaveEntries,
  useLeaveLedger,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { LeaveCreditsBalanceResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const leaveName = (r: LeaveCreditsBalanceResponse) =>
  r.leaveDescription || r.leaveCode;

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Leave Type",
  "Granted",
  "Used",
  "Reserved",
  "Balance",
  "Available to File",
];

const toRows = (records: LeaveCreditsBalanceResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    leaveName(r),
    fmt(r.granted),
    fmt(r.used),
    fmt(r.reserved),
    fmt(r.balance),
    fmt(r.availableToFile),
  ]);

export default function LeaveLedger() {
  const [year, setYear] = useState(dayjs().year());
  const [messageApi, contextHolder] = message.useMessage();

  // Optional: nothing selected means every employee, as before.
  const [scope, setScope] = useState<EmployeeScopeFilter>({});

  const { data = [], isLoading, refetch } = useLeaveLedger(year, scope);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);
  const leaveTypeFilter = useReportNameFilter(
    employeeFilter.filtered,
    leaveName,
  );

  // The row whose ledger details are open; its Adjust lives inside the drawer.
  const [viewing, setViewing] = useState<LeaveCreditsBalanceResponse | null>(
    null,
  );
  const { data: entries = [], isFetching: entriesLoading } = useLeaveEntries(
    viewing?.employeeId,
    viewing?.leaveId,
    year,
  );
  // Keeps the drawer's balance current after an adjustment refetches the list.
  const viewingRow =
    data.find(
      (r) =>
        r.employeeId === viewing?.employeeId && r.leaveId === viewing?.leaveId,
    ) ?? viewing;

  const [adjustOpen, setAdjustOpen] = useState(false);
  const { mutateAsync: adjustCredits, isPending: isAdjusting } =
    useAdjustLeaveCredits();

  // The credits API sets a new balance; the server records the difference as a signed
  // Adjustment entry, so an Add/Remove amount is sent as balance ± amount.
  const handleAdjustSubmit = async (values: BalanceAdjustSubmitValues) => {
    if (!viewingRow) return;
    try {
      await adjustCredits({
        employeeId: viewingRow.employeeId,
        leaveId: viewingRow.leaveId,
        year,
        newBalance: values.isAddition
          ? viewingRow.balance + values.amount
          : Math.max(viewingRow.balance - values.amount, 0),
        particulars: values.particulars,
      });
      messageApi.success("Leave credits balance updated.");
      setAdjustOpen(false);
    } catch {
      messageApi.error("Failed to update the balance. Please try again.");
    }
  };

  const columns: ColumnsType<LeaveCreditsBalanceResponse> = [
    {
      title: "Employee No",
      dataIndex: "employeeNo",
      key: "no",
      width: 120,
      fixed: "left",
    },
    { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
    {
      title: "Leave Type",
      key: "leaveType",
      width: 180,
      render: (_, r) => leaveName(r),
    },
    {
      title: "Granted",
      dataIndex: "granted",
      key: "granted",
      align: "right",
      render: fmt,
    },
    {
      title: "Used",
      dataIndex: "used",
      key: "used",
      align: "right",
      render: fmt,
    },
    {
      title: "Reserved",
      dataIndex: "reserved",
      key: "reserved",
      align: "right",
      render: fmt,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right",
      render: (v: number) => <strong>{fmt(v)}</strong>,
    },
    {
      title: "Available to File",
      dataIndex: "availableToFile",
      key: "available",
      align: "right",
      render: fmt,
    },
    {
      title: "",
      key: "view",
      width: 48,
      fixed: "right",
      render: (_, r) => (
        <Tooltip title="View ledger">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            aria-label="View leave ledger"
            onClick={() => setViewing(r)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.LEAVE_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.LEAVE_SUBTITLE}
        data={leaveTypeFilter.filtered}
        loading={isLoading}
        columns={columns}
        onRefresh={() => refetch()}
        rowKey={(r) => `${r.employeeId}-${r.leaveId}`}
        exportFileName={`leave-ledger-${year}`}
        exportHeaders={EXPORT_HEADERS}
        exportRows={toRows}
        filters={
          <Form layout="vertical">
            <div className="flex items-end gap-4 flex-wrap">
              <Form.Item label="Year" className="mb-0 w-44">
                <DatePicker
                  picker="year"
                  className="w-full"
                  value={dayjs().year(year)}
                  allowClear={false}
                  onChange={(date) => date && setYear(date.year())}
                />
              </Form.Item>
              <ReportNameFilter
                label="Employee"
                options={employeeFilter.options}
                value={employeeFilter.selected}
                onChange={employeeFilter.setSelected}
              />
              <ReportNameFilter
                label="Leave Type"
                options={leaveTypeFilter.options}
                value={leaveTypeFilter.selected}
                onChange={leaveTypeFilter.setSelected}
              />
              <EmployeeScopeFilters value={scope} onChange={setScope} />
            </div>
          </Form>
        }
      />

      <LedgerDrawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={
          viewingRow
            ? `${viewingRow.fullName} — ${leaveName(viewingRow)} (${year})`
            : null
        }
        balanceLabel="Balance (days)"
        balance={viewingRow?.balance ?? 0}
        amountLabel="Days"
        entries={entries}
        loading={entriesLoading}
        onAdjust={() => setAdjustOpen(true)}
      />

      <BalanceAdjustModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        target={
          viewingRow
            ? {
                employeeId: viewingRow.employeeId,
                employeeName: `${viewingRow.fullName} — ${leaveName(viewingRow)} (${year})`,
                balance: viewingRow.balance,
              }
            : null
        }
        onSubmit={handleAdjustSubmit}
        isSubmitting={isAdjusting}
        amountLabel="Days"
        amountStep={0.25}
      />
    </>
  );
}

import { useState } from "react";
import { Button, DatePicker, Form, Space, Tooltip, message } from "antd";
import { EyeOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ClientFilter } from "../../components/client-filter/client-filter";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import {
  BalanceAdjustModal,
  type BalanceAdjustSubmitValues,
  type BalanceAdjustTarget,
} from "../../components/balance-adjust-modal/balance-adjust-modal";
import { LedgerDrawer } from "../../components/ledger-drawer/ledger-drawer";
import {
  useAdjustCashBond,
  useCashBondEntries,
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
    r.cashBondRate,
    r.adjustments,
    r.collectedFromPayroll,
    r.totalCollected,
    r.payrollRunsCount,
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
  const [clientId, setClientId] = useState<string | undefined>();
  const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
  const { data = [], isLoading, refetch } = useCashBondReport(asOf, clientId);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  // The row whose ledger details are open; its Adjust lives inside the drawer.
  const [viewing, setViewing] = useState<CashBondReportResponse | null>(null);
  const { data: entries = [], isFetching: entriesLoading } = useCashBondEntries(
    viewing?.employeeId,
    asOf,
  );
  // Keeps the drawer's balance current after an adjustment refetches the list.
  const viewingRow =
    data.find((r) => r.employeeId === viewing?.employeeId) ?? viewing;

  // "add" = toolbar entry for any employee (e.g. an opening balance for someone with no cash
  // bond collected in this system yet); a target = adjusting the viewed employee's total.
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
      key: "view",
      width: 48,
      fixed: "right",
      render: (_, r) => (
        <Tooltip title="View ledger">
          <Button
            size="small"
            type="text"
            icon={<EyeOutlined />}
            aria-label="View cash bond ledger"
            onClick={() => setViewing(r)}
          />
        </Tooltip>
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
        totals={{
          fields: ["adjustments", "collectedFromPayroll", "totalCollected"],
          exportHeaders: [
            "Beginning / Adjustments",
            "From Payroll",
            "Total Collected",
          ],
        }}
        exportIntegerHeaders={["Payroll Runs"]}
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
              <ClientFilter value={clientId} onChange={setClientId} />
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

      <LedgerDrawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewingRow?.fullName}
        balanceLabel={`Total collected as of ${dayjs(asOf).format("MMM DD, YYYY")}`}
        balance={viewingRow?.totalCollected ?? 0}
        entries={entries}
        loading={entriesLoading}
        onAdjust={() =>
          viewingRow &&
          setAdjustModal({
            employeeId: viewingRow.employeeId,
            employeeName: viewingRow.fullName,
            balance: viewingRow.totalCollected,
          })
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

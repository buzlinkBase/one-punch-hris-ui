import { useState } from "react";
import { Button, DatePicker, Form, Space, Tooltip, message } from "antd";
import { EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
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
  CashBondRateModal,
  type CashBondRateSubmitValues,
  type CashBondRateTarget,
} from "../../components/cash-bond-rate-modal/cash-bond-rate-modal";
import { CashBondRateHistory } from "../../components/cash-bond-rate-history/cash-bond-rate-history";
import {
  useAdjustCashBond,
  useCashBondEntries,
  useCashBondReport,
  useChangeCashBondRate,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { CashBondReportResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { formatMoney } from "@/shared/utils/money.util";

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Cash Bond Rate",
  "Beginning / Adjustments",
  "From Payroll",
  "Refunded",
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
    r.refunded,
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
    render: formatMoney,
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
    render: (v: number) => (v !== 0 ? formatMoney(v) : ""),
  },
  {
    title: "From Payroll",
    dataIndex: "collectedFromPayroll",
    key: "fromPayroll",
    align: "right",
    render: formatMoney,
  },
  {
    title: (
      <Tooltip title="Paid back to the employee in their Last Pay">
        Refunded
      </Tooltip>
    ),
    dataIndex: "refunded",
    key: "refunded",
    align: "right",
    render: (v: number) => (v !== 0 ? formatMoney(v) : ""),
  },
  {
    title: "Total Collected",
    dataIndex: "totalCollected",
    key: "collected",
    align: "right",
    render: (v: number) => <strong>{formatMoney(v)}</strong>,
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

  // The employee whose per-run rate is being edited (applies from the next payroll run).
  const [rateTarget, setRateTarget] = useState<CashBondRateTarget | null>(null);
  const { mutateAsync: changeRate, isPending: isChangingRate } =
    useChangeCashBondRate();

  const openRateModal = (r: CashBondReportResponse) =>
    setRateTarget({
      employeeId: r.employeeId,
      employeeName: r.fullName,
      currentRate: r.cashBondRate,
    });

  const handleRateSubmit = async (values: CashBondRateSubmitValues) => {
    try {
      const change = await changeRate(values);
      message.success(
        change
          ? "Cash bond rate updated. It applies from the next payroll."
          : "The rate is unchanged.",
      );
      setRateTarget(null);
    } catch {
      // The request error is already shown by the HTTP client.
    }
  };

  const displayColumns: ColumnsType<CashBondReportResponse> = [
    ...columns,
    {
      title: "",
      key: "view",
      width: 88,
      fixed: "right",
      render: (_, r) => (
        <Space size={0}>
          <PermissionGate permission="Payroll Reports:Edit">
            <Tooltip title="Edit rate (applies from the next payroll)">
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                aria-label="Edit cash bond rate"
                onClick={() => openRateModal(r)}
              />
            </Tooltip>
          </PermissionGate>
          <Tooltip title="View ledger">
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              aria-label="View cash bond ledger"
              onClick={() => setViewing(r)}
            />
          </Tooltip>
        </Space>
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
          fields: [
            "adjustments",
            "collectedFromPayroll",
            "refunded",
            "totalCollected",
          ],
          exportHeaders: [
            "Beginning / Adjustments",
            "From Payroll",
            "Refunded",
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
        extraTab={{
          key: "rate-history",
          label: "Rate history",
          content: <CashBondRateHistory employeeId={viewing?.employeeId} />,
        }}
      />

      <CashBondRateModal
        open={rateTarget !== null}
        onClose={() => setRateTarget(null)}
        target={rateTarget}
        onSubmit={handleRateSubmit}
        isSubmitting={isChangingRate}
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

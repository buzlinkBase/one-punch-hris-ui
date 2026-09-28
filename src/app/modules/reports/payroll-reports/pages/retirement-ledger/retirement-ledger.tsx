import { useState } from "react";
import { Button, DatePicker, Form, Space, Tooltip, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import {
  BalanceAdjustModal,
  type BalanceAdjustSubmitValues,
  type BalanceAdjustTarget,
} from "../../components/balance-adjust-modal/balance-adjust-modal";
import { LedgerDrawer } from "../../components/ledger-drawer/ledger-drawer";
import {
  buildFundSummaryColumns,
  fundSummaryExport,
} from "../../components/fund-summary-columns/fund-summary-columns";
import {
  useAdjustRetirement,
  useRetirementEntries,
  useRetirementLedger,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { FundLedgerSummaryResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const LABELS = { added: "Accrued", deducted: "Paid Out" };
const EXPORT = fundSummaryExport(LABELS);

export default function RetirementLedger() {
  const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
  const { data = [], isLoading, refetch } = useRetirementLedger(asOf);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  // The row whose ledger details are open; its Adjust lives inside the drawer.
  const [viewing, setViewing] = useState<FundLedgerSummaryResponse | null>(
    null,
  );
  const { data: entries = [], isFetching: entriesLoading } =
    useRetirementEntries(viewing?.employeeId, asOf);
  // Keeps the drawer's balance current after an adjustment refetches the list.
  const viewingRow =
    data.find((r) => r.employeeId === viewing?.employeeId) ?? viewing;

  // "add" = toolbar entry for any employee (e.g. an opening balance); a target = the viewed
  // employee. Unlike Uniform Allowance there is no general-purpose Release here -- retirement is
  // paid out through Last Pay at separation (IncludeRetirementPayout).
  const [adjustModal, setAdjustModal] = useState<
    "add" | BalanceAdjustTarget | null
  >(null);
  const { mutateAsync: adjust, isPending: isAdjusting } = useAdjustRetirement();

  const handleAdjustSubmit = async (values: BalanceAdjustSubmitValues) => {
    try {
      await adjust(values);
      message.success(
        adjustModal === "add" ? "Entry added." : "Balance adjusted.",
      );
      setAdjustModal(null);
    } catch {
      message.error("Failed to save. Please try again.");
    }
  };

  return (
    <>
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.RETIREMENT_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.RETIREMENT_SUBTITLE}
        data={employeeFilter.filtered}
        loading={isLoading}
        columns={buildFundSummaryColumns(LABELS, setViewing)}
        onRefresh={() => refetch()}
        rowKey={(r) => r.employeeId}
        exportFileName={`retirement-ledger-${asOf}`}
        exportHeaders={EXPORT.headers}
        exportRows={EXPORT.rows}
        extraActions={
          <Space>
            <PermissionGate permission="Payroll Reports:Edit">
              <Tooltip title="Add entry (e.g. opening balance)">
                <Button
                  icon={<PlusOutlined />}
                  aria-label="Add retirement entry"
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

      <LedgerDrawer
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewingRow?.fullName}
        balanceLabel={`Balance as of ${dayjs(asOf).format("MMM DD, YYYY")}`}
        balance={viewingRow?.balance ?? 0}
        entries={entries}
        loading={entriesLoading}
        onAdjust={() =>
          viewingRow &&
          setAdjustModal({
            employeeId: viewingRow.employeeId,
            employeeName: viewingRow.fullName,
            balance: viewingRow.balance,
          })
        }
      />

      <BalanceAdjustModal
        open={adjustModal !== null}
        onClose={() => setAdjustModal(null)}
        target={adjustModal === "add" ? null : adjustModal}
        onSubmit={handleAdjustSubmit}
        isSubmitting={isAdjusting}
      />
    </>
  );
}

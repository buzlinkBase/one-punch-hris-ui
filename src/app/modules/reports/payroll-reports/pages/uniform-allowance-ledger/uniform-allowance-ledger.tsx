import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";
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
  useAdjustUniformAllowance,
  useReleaseUniformAllowance,
  useUniformAllowanceBalances,
  useUniformAllowanceEntries,
  useUniformAllowanceLedger,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { FundLedgerSummaryResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { authStorage } from "@/core/auth/auth-storage";

const { Text } = Typography;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const LABELS = { added: "Accrued", deducted: "Released" };
const EXPORT = fundSummaryExport(LABELS);

export default function UniformAllowanceLedger() {
  const [asOf, setAsOf] = useState(dayjs().format("YYYY-MM-DD"));
  const { data = [], isLoading, refetch } = useUniformAllowanceLedger(asOf);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  // The row whose ledger details are open; its Adjust lives inside the drawer.
  const [viewing, setViewing] = useState<FundLedgerSummaryResponse | null>(
    null,
  );
  const { data: entries = [], isFetching: entriesLoading } =
    useUniformAllowanceEntries(viewing?.employeeId, asOf);
  // Keeps the drawer's balance current after an adjustment refetches the list.
  const viewingRow =
    data.find((r) => r.employeeId === viewing?.employeeId) ?? viewing;

  // "add" = toolbar entry with an employee picker (e.g. seeding an opening balance for someone
  // adopting this system mid-year); a target = the viewed employee.
  const [adjustModal, setAdjustModal] = useState<
    "add" | BalanceAdjustTarget | null
  >(null);
  const { mutateAsync: adjust, isPending: isAdjusting } =
    useAdjustUniformAllowance();

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

  // ── Release (batch disbursement for a period) ────────────────────────────────
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [releaseEmployeeIds, setReleaseEmployeeIds] = useState<string[]>([]);
  const [releaseAmounts, setReleaseAmounts] = useState<Record<string, number>>(
    {},
  );
  const [releasePeriodDate, setReleasePeriodDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [releaseParticulars, setReleaseParticulars] = useState("");
  const { data: balances = [], isFetching: isLoadingBalances } =
    useUniformAllowanceBalances(releaseEmployeeIds);
  const { mutateAsync: releaseBatch, isPending: isReleasing } =
    useReleaseUniformAllowance();

  const balanceByEmployee = Object.fromEntries(
    balances.map((b) => [b.employeeId, b.balance]),
  );

  // releaseAmounts only ever holds amounts HR explicitly edited -- an employee's displayed/
  // submitted amount falls back to their current balance inline wherever it's read, so there's
  // no need to sync a "merged" copy of it via an effect.
  const amountFor = (employeeId: string) =>
    releaseAmounts[employeeId] ?? balanceByEmployee[employeeId] ?? 0;

  const openRelease = () => {
    setReleaseEmployeeIds([]);
    setReleaseAmounts({});
    setReleasePeriodDate(dayjs().format("YYYY-MM-DD"));
    setReleaseParticulars("");
    setReleaseOpen(true);
  };

  const handleReleaseSubmit = async () => {
    if (releaseEmployeeIds.length === 0) {
      message.warning("Select at least one employee.");
      return;
    }
    if (!releaseParticulars.trim()) {
      message.warning("A reason/particulars is required.");
      return;
    }
    try {
      const result = await releaseBatch({
        releases: releaseEmployeeIds.map((employeeId) => ({
          employeeId,
          amount: amountFor(employeeId),
        })),
        periodDate: releasePeriodDate,
        particulars: releaseParticulars,
      });
      if (result.clampedEmployeeIds.length > 0) {
        message.warning(
          `${result.clampedEmployeeIds.length} employee(s) had their amount reduced to match their available balance.`,
        );
      } else {
        message.success("Released.");
      }
      setReleaseOpen(false);
    } catch {
      message.error("Failed to release. Please try again.");
    }
  };

  const employeeNameById = Object.fromEntries(
    data.map((r) => [r.employeeId, r.fullName]),
  );

  return (
    <>
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.UNIFORM_ALLOWANCE_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.UNIFORM_ALLOWANCE_SUBTITLE}
        data={employeeFilter.filtered}
        loading={isLoading}
        columns={buildFundSummaryColumns(LABELS, setViewing)}
        onRefresh={() => refetch()}
        rowKey={(r) => r.employeeId}
        exportFileName={`uniform-allowance-ledger-${asOf}`}
        exportHeaders={EXPORT.headers}
        exportRows={EXPORT.rows}
        extraActions={
          <Space>
            <PermissionGate permission="Payroll Reports:Edit">
              <Tooltip title="Add entry (e.g. opening balance)">
                <Button
                  icon={<PlusOutlined />}
                  aria-label="Add uniform allowance entry"
                  onClick={() => setAdjustModal("add")}
                />
              </Tooltip>
            </PermissionGate>
            <PermissionGate permission="Payroll Reports:Edit">
              <Tooltip title="Release allowance">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  aria-label="Release allowance"
                  onClick={openRelease}
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

      {/* Release modal */}
      <Modal
        title="Release Uniform Allowance"
        open={releaseOpen}
        onCancel={() => setReleaseOpen(false)}
        onOk={handleReleaseSubmit}
        okText="Release"
        confirmLoading={isReleasing}
        okButtonProps={{
          disabled: !authStorage.hasAnyPermission("Payroll Reports:Edit"),
        }}
        width={640}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="Employees" required>
            <Select
              mode="multiple"
              showSearch
              placeholder="Select employees to release for"
              className="w-full"
              value={releaseEmployeeIds}
              onChange={setReleaseEmployeeIds}
              options={employeeFilter.options.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Period Date" required>
            <DatePicker
              className="w-full"
              value={dayjs(releasePeriodDate)}
              allowClear={false}
              onChange={(date) =>
                date && setReleasePeriodDate(date.format("YYYY-MM-DD"))
              }
            />
          </Form.Item>
          <Form.Item label="Reason / Particulars" required>
            <Input.TextArea
              rows={2}
              value={releaseParticulars}
              onChange={(e) => setReleaseParticulars(e.target.value)}
              placeholder="e.g. H1 2026 uniform issuance"
            />
          </Form.Item>

          {releaseEmployeeIds.length > 0 && (
            <Table
              size="small"
              loading={isLoadingBalances}
              dataSource={releaseEmployeeIds.map((id) => ({ employeeId: id }))}
              rowKey="employeeId"
              pagination={false}
              columns={[
                {
                  title: "Employee",
                  key: "name",
                  render: (_, row) =>
                    employeeNameById[row.employeeId] ?? row.employeeId,
                },
                {
                  title: "Current Balance",
                  key: "balance",
                  align: "right",
                  render: (_, row) =>
                    fmt(balanceByEmployee[row.employeeId] ?? 0),
                },
                {
                  title: "Release Amount",
                  key: "amount",
                  width: 160,
                  render: (_, row) => (
                    <InputNumber
                      size="small"
                      className="w-full"
                      min={0}
                      max={balanceByEmployee[row.employeeId] ?? undefined}
                      precision={2}
                      value={amountFor(row.employeeId)}
                      onChange={(v) =>
                        setReleaseAmounts((prev) => ({
                          ...prev,
                          [row.employeeId]: v ?? 0,
                        }))
                      }
                    />
                  ),
                },
              ]}
            />
          )}
          <Space direction="vertical" className="mt-2">
            <Text type="secondary" className="text-xs">
              Each amount defaults to that employee&apos;s current balance and
              can be lowered to release only part of it. An amount that exceeds
              the balance at the time of release is automatically capped.
            </Text>
          </Space>
        </Form>
      </Modal>
    </>
  );
}

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
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { EditOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import {
  BalanceAdjustModal,
  type BalanceAdjustTarget,
} from "../../components/balance-adjust-modal/balance-adjust-modal";
import {
  useUniformAllowanceLedger,
  useAdjustUniformAllowance,
  useReleaseUniformAllowance,
  useUniformAllowanceBalances,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { UniformAllowanceLedgerResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Text } = Typography;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const ENTRY_TYPE_COLOR: Record<string, string> = {
  Accrual: "blue",
  Adjustment: "orange",
  Release: "green",
};

const EXPORT_HEADERS = [
  "Employee No",
  "Full Name",
  "Entry Type",
  "Entry Date",
  "Add",
  "Less",
  "Balance",
  "Particulars",
];

const toRows = (records: UniformAllowanceLedgerResponse[]) =>
  records.map((r) => [
    r.employeeNo,
    r.fullName,
    r.entryType,
    r.entryDate,
    fmt(r.add),
    fmt(r.less),
    fmt(r.balance),
    r.particulars,
  ]);

const columns: ColumnsType<UniformAllowanceLedgerResponse> = [
  {
    title: "Employee No",
    dataIndex: "employeeNo",
    key: "no",
    width: 120,
    fixed: "left",
  },
  { title: "Full Name", dataIndex: "fullName", key: "name", width: 180 },
  {
    title: "Type",
    dataIndex: "entryType",
    key: "type",
    width: 100,
    render: (v: string) => <Tag color={ENTRY_TYPE_COLOR[v]}>{v}</Tag>,
  },
  {
    title: "Entry Date",
    dataIndex: "entryDate",
    key: "date",
    width: 120,
    render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
  },
  {
    title: "Add",
    dataIndex: "add",
    key: "add",
    align: "right",
    render: (v: number) => (v > 0 ? fmt(v) : ""),
  },
  {
    title: "Less",
    dataIndex: "less",
    key: "less",
    align: "right",
    render: (v: number) => (v > 0 ? fmt(v) : ""),
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    align: "right",
    render: (v: number) => <strong>{fmt(v)}</strong>,
  },
  {
    title: "Particulars",
    dataIndex: "particulars",
    key: "particulars",
  },
];

export default function UniformAllowanceLedger() {
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("year").format("YYYY-MM-DD"),
    dayjs().endOf("year").format("YYYY-MM-DD"),
  ]);
  const {
    data = [],
    isLoading,
    refetch,
  } = useUniformAllowanceLedger(range[0], range[1]);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  // ── Add / Edit (shared modal — Add has no target, Edit's target is the clicked row) ──────
  // "add" opens the modal with an employee picker (e.g. seeding an opening balance for someone
  // adopting this system mid-year); a BalanceAdjustTarget opens it pre-filled from a row.
  const [adjustModal, setAdjustModal] = useState<
    "add" | BalanceAdjustTarget | null
  >(null);
  const { mutateAsync: adjust, isPending: isAdjusting } =
    useAdjustUniformAllowance();

  const handleAdjustSubmit = async (values: {
    employeeId: string;
    amount: number;
    isAddition: boolean;
    particulars: string;
  }) => {
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

  const displayColumns: ColumnsType<UniformAllowanceLedgerResponse> = [
    ...columns,
    {
      title: "",
      key: "adjust",
      width: 48,
      fixed: "right",
      render: (_, r) => (
        <Tooltip title="Adjust balance">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              setAdjustModal({
                employeeId: r.employeeId,
                employeeName: r.fullName,
                balance: r.balance,
              })
            }
          />
        </Tooltip>
      ),
    },
  ];

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
        columns={displayColumns}
        onRefresh={() => refetch()}
        rowKey={(r) => `${r.employeeId}-${r.entryType}-${r.entryDate}`}
        exportFileName={`uniform-allowance-ledger-${range[0]}-to-${range[1]}`}
        exportHeaders={EXPORT_HEADERS}
        exportRows={toRows}
        extraActions={
          <Space>
            <Tooltip title="Add entry">
              <Button
                icon={<PlusOutlined />}
                onClick={() => setAdjustModal("add")}
              />
            </Tooltip>
            <Tooltip title="Release allowance">
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={openRelease}
              />
            </Tooltip>
          </Space>
        }
        filters={
          <Form layout="vertical">
            <div className="flex items-end gap-4 flex-wrap">
              <Form.Item
                label="Date Range"
                className="mb-0"
                style={{ maxWidth: 360 }}
              >
                <MobileRangePicker
                  style={{ width: "100%" }}
                  value={[dayjs(range[0]), dayjs(range[1])]}
                  onChange={(dates) => {
                    if (dates)
                      setRange([
                        dates[0]?.format("YYYY-MM-DD") ?? "",
                        dates[1]?.format("YYYY-MM-DD") ?? "",
                      ]);
                  }}
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
      />

      {/* Release modal */}
      <Modal
        title="Release Uniform Allowance"
        open={releaseOpen}
        onCancel={() => setReleaseOpen(false)}
        onOk={handleReleaseSubmit}
        okText="Release"
        confirmLoading={isReleasing}
        width={640}
        destroyOnClose
      >
        <Form layout="vertical">
          <Form.Item label="Employees" required>
            <Select
              mode="multiple"
              showSearch
              placeholder="Select employees to release for"
              style={{ width: "100%" }}
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
              style={{ width: "100%" }}
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
                      style={{ width: "100%" }}
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

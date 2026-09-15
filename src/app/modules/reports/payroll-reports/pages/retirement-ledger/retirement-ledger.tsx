import { useState } from "react";
import { Button, Form, Space, Tag, Tooltip, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { PayrollReportShell } from "../../components/payroll-report-shell/payroll-report-shell";
import { ReportNameFilter } from "../../components/report-name-filter/report-name-filter";
import {
  BalanceAdjustModal,
  type BalanceAdjustTarget,
} from "../../components/balance-adjust-modal/balance-adjust-modal";
import {
  useRetirementLedger,
  useAdjustRetirement,
} from "../../hooks/use-payroll-reports-queries";
import { useReportNameFilter } from "../../hooks/use-report-name-filter";
import type { RetirementLedgerResponse } from "../../models/api/response/payroll-reports.model";
import { PAYROLL_REPORTS_LABEL } from "../../constants/label.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

const ENTRY_TYPE_COLOR: Record<string, string> = {
  Accrual: "blue",
  Adjustment: "orange",
  Payout: "green",
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

const toRows = (records: RetirementLedgerResponse[]) =>
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

const columns: ColumnsType<RetirementLedgerResponse> = [
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

export default function RetirementLedger() {
  const [range, setRange] = useState<[string, string]>([
    dayjs().startOf("year").format("YYYY-MM-DD"),
    dayjs().endOf("year").format("YYYY-MM-DD"),
  ]);
  const {
    data = [],
    isLoading,
    refetch,
  } = useRetirementLedger(range[0], range[1]);
  const employeeFilter = useReportNameFilter(data, (r) => r.fullName);

  // Add/Edit only -- unlike Uniform Allowance, Retirement has no general-purpose Release here;
  // its payout is specifically wired through Last Pay at separation (IncludeRetirementPayout).
  const [adjustModal, setAdjustModal] = useState<
    "add" | BalanceAdjustTarget | null
  >(null);
  const { mutateAsync: adjust, isPending: isAdjusting } = useAdjustRetirement();

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

  const displayColumns: ColumnsType<RetirementLedgerResponse> = [
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

  return (
    <>
      <PayrollReportShell
        title={PAYROLL_REPORTS_LABEL.RETIREMENT_TITLE}
        subtitle={PAYROLL_REPORTS_LABEL.RETIREMENT_SUBTITLE}
        data={employeeFilter.filtered}
        loading={isLoading}
        columns={displayColumns}
        onRefresh={() => refetch()}
        rowKey={(r) =>
          `${r.employeeId}-${r.entryType}-${r.entryDate}-${r.payrollId ?? "manual"}`
        }
        exportFileName={`retirement-ledger-${range[0]}-to-${range[1]}`}
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
    </>
  );
}

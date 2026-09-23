import { useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import {
  useDtrBatches,
  useCalculatePayroll,
  useGeneratePayroll,
} from "../../hooks/use-for-payroll-queries";
import type { DtrBatchModel } from "../../models/api/response/dtr-batch-response.model";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";
import {
  otPay,
  ndPay,
  ndotDisplayPay,
  basicPay,
  holidayPay,
} from "../../utils/ot-nd-pay.util";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "../../constants/label.const";
import type { ErrorResponse } from "@/shared/types/api-response.model";
import DtrBatchPreviewModal from "../../components/dtr-batch-preview-modal";
import PayrollRunPostModal from "../../components/payroll-run-post-modal";
import TimeHourPayResultsModal from "../../components/time-hour-pay-results-modal";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Text } = Typography;

// ValidationException messages (e.g. "A Pay/Release Date is required...") land in
// data.detail via GlobalExceptionHandler — surface that instead of a generic fallback.
const getErrorDetail = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? ((err.response?.data as ErrorResponse | undefined)?.data?.detail ??
      fallback)
    : fallback;

const fmt = (n: number) =>
  n?.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) ?? "0.00";
const fmtDate = (d: string) =>
  d ? dayjs(d.replace(/Z$/, "")).format("MMM DD, YYYY") : "—";

const BAND_CLASS = {
  earnings: "bg-emerald-50 dark:bg-emerald-950/30",
  deductions: "bg-rose-50 dark:bg-rose-950/30",
  attendance: "bg-amber-50 dark:bg-amber-950/30",
};

// Applies a band's background className to every leaf column in it, so the
// whole column group (header + body cells) reads as one colored band.
const withBand = (
  columns: ColumnsType<PayrollRunResult>,
  className: string,
): ColumnsType<PayrollRunResult> =>
  columns.map((c) => ({
    ...c,
    className: [c.className, className].filter(Boolean).join(" "),
  }));

export default function ForPayrollGenerateTab() {
  const { token } = theme.useToken();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<PayrollRunResult[] | null>(null);
  const [previewBatchCode, setPreviewBatchCode] = useState<string | null>(null);
  const [payDate, setPayDate] = useState<string | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [dailyBreakdownRow, setDailyBreakdownRow] =
    useState<PayrollRunResult | null>(null);

  const {
    data: allBatches = [],
    isLoading,
    isFetching,
    refetch,
  } = useDtrBatches(dateRange?.[0], dateRange?.[1]);
  // Already processed — a payroll run (draft or posted) already exists for this batch — so
  // it has nothing left to do here; keep the list to only what's actually runnable instead
  // of showing it disabled with a tag.
  const batches = allBatches.filter((b) => !b.isPayrollGenerated);
  const { mutate: calculate, isPending: calculating } = useCalculatePayroll();
  const { mutate: generate, isPending: generating } = useGeneratePayroll();

  const canRun = selected.length > 0;

  const clearSelection = () => setSelected([]);

  const buildPayload = (remarks?: string) => ({
    batchCodes: selected,
    payDate,
    remarks,
  });

  const runPayroll = () => {
    if (!canRun) return;
    calculate(buildPayload(), {
      onSuccess: (res) => {
        setResults(res.data);
        message.success(`Preview: ${res.total} employee(s) calculated.`);
      },
      onError: (err) =>
        message.error(getErrorDetail(err, "Payroll calculation failed.")),
    });
  };

  const handleConfirmGenerate = (remarks: string) => {
    generate(buildPayload(remarks), {
      onSuccess: (res) => {
        setResults(res.data);
        setPostModalOpen(false);
        message.success(
          `Payroll generated and saved for ${res.total} employee(s).`,
        );
      },
      onError: (err) =>
        message.error(getErrorDetail(err, "Payroll generation failed.")),
    });
  };

  const batchColumns: ColumnsType<DtrBatchModel> = [
    {
      title: "Batch Code",
      dataIndex: "code",
      key: "code",
      width: 220,
      render: (v) => (
        <Text code className="whitespace-nowrap">
          {v}
        </Text>
      ),
    },
    {
      title: "Period",
      key: "period",
      width: 190,
      render: (_, r) => `${fmtDate(r.fromDate)} — ${fmtDate(r.toDate)}`,
    },
    {
      title: "Posting Description",
      dataIndex: "postingDescription",
      key: "postingDescription",
      width: 220,
      ellipsis: { showTitle: false },
      render: (v?: string | null) =>
        v ? (
          <Tooltip title={v}>
            <Text type="secondary">{v}</Text>
          </Tooltip>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      render: (_, r) => (
        <Tag color={APPROVAL_STATUS_COLOR[r.approvalStatus ?? ""] ?? "default"}>
          {APPROVAL_STATUS_LABEL[r.approvalStatus ?? ""] ?? "Approved"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "view",
      width: 40,
      render: (_, r) => (
        <Tooltip title="View DTR contents">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setPreviewBatchCode(r.code)}
          />
        </Tooltip>
      ),
    },
  ];

  const resultColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "",
      key: "viewDaily",
      width: 40,
      render: (_, r) =>
        r.timeHourPayResults?.length ? (
          <Tooltip title="View daily pay breakdown">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDailyBreakdownRow(r)}
            />
          </Tooltip>
        ) : null,
    },
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
    },
    {
      title: "Salary Type",
      dataIndex: "salaryType",
      key: "salaryType",
      width: 100,
      render: (v: PayrollRunResult["salaryType"]) => (
        <Tag color={v === "FIXED" ? "blue" : "default"}>
          {v === "FIXED" ? "Fixed" : "Variable"}
        </Tag>
      ),
    },
    {
      title: "Daily Rate",
      dataIndex: "dailyRate",
      key: "dailyRate",
      width: 100,
      align: "right",
      render: fmt,
    },
    {
      title: "Earnings",
      key: "earnings-band",
      className: BAND_CLASS.earnings,
      children: withBand(
        [
          {
            title: "Basic",
            key: "basicPay",
            align: "right",
            render: (_, r) => fmt(basicPay(r)),
          },
          {
            title: "OT",
            key: "overtimePay",
            align: "right",
            render: (_, r) => fmt(otPay(r)),
          },
          {
            title: "ND",
            key: "nd",
            align: "right",
            render: (_, r) => fmt(ndPay(r)),
          },
          {
            title: "NDOT",
            key: "ndot",
            align: "right",
            // "—" under Additive mode: that pay now lives in OT/ND above instead — see
            // ot-nd-pay.util.ts.
            render: (_, r) => {
              const v = ndotDisplayPay(r);
              return v === null ? "—" : fmt(v);
            },
          },
          {
            title: "Rest Day",
            dataIndex: "restDayPay",
            key: "restDayPay",
            align: "right",
            render: fmt,
          },
          {
            title: "Holiday",
            key: "holidayPay",
            align: "right",
            render: (_, r) => fmt(holidayPay(r)),
          },
          {
            title: "Allowances",
            dataIndex: "totalRegularAllowances",
            key: "allowances",
            align: "right",
            render: fmt,
          },
          {
            title: "COLA",
            dataIndex: "cola",
            key: "cola",
            align: "right",
            render: fmt,
          },
          {
            title: "Bonuses",
            dataIndex: "totalBonuses",
            key: "bonuses",
            align: "right",
            render: fmt,
          },
          {
            title: "Commissions",
            dataIndex: "totalCommissions",
            key: "commissions",
            align: "right",
            render: fmt,
          },
          {
            title: "De Minimis",
            dataIndex: "totalDeminimises",
            key: "deminimis",
            align: "right",
            render: fmt,
          },
          {
            title: "Other Income",
            dataIndex: "totalOtherIncome",
            key: "otherIncome",
            align: "right",
            render: fmt,
          },
          {
            title: "Reimbursement",
            dataIndex: "reimbursement",
            key: "reimbursement",
            align: "right",
            render: fmt,
          },
          {
            title: "Gross",
            dataIndex: "grossIncome",
            key: "grossIncome",
            align: "right",
            render: fmt,
            className: "font-semibold",
          },
        ],
        BAND_CLASS.earnings,
      ),
    },
    {
      title: "Deductions",
      key: "deductions-band",
      className: BAND_CLASS.deductions,
      children: withBand(
        [
          {
            title: "SSS",
            dataIndex: "sssContribution",
            key: "sss",
            align: "right",
            render: fmt,
          },
          {
            title: "PhilHealth",
            dataIndex: "philHealthContribution",
            key: "phic",
            align: "right",
            render: fmt,
          },
          {
            title: "Pag-IBIG",
            dataIndex: "pagIbigContribution",
            key: "hdmf",
            align: "right",
            render: fmt,
          },
          {
            title: "W-Tax",
            dataIndex: "withholdingTax",
            key: "tax",
            align: "right",
            render: fmt,
          },
          {
            title: "Other Ded.",
            dataIndex: "otherDeductions",
            key: "otherDed",
            align: "right",
            render: fmt,
          },
        ],
        BAND_CLASS.deductions,
      ),
    },
    {
      title: "Attendance",
      key: "attendance-band",
      className: BAND_CLASS.attendance,
      children: withBand(
        [
          {
            title: "Late",
            dataIndex: "lateAmount",
            key: "lateAmount",
            align: "right",
            render: fmt,
          },
          {
            title: "UT",
            dataIndex: "underTimeAmount",
            key: "underTimeAmount",
            align: "right",
            render: fmt,
          },
          {
            title: "Absent",
            key: "absent",
            align: "right",
            render: (_, r) => fmt(r.absences),
          },
        ],
        BAND_CLASS.attendance,
      ),
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      align: "right",
      fixed: "right",
      render: (v: number) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {fmt(v)}
        </Text>
      ),
    },
  ];

  const totalNetPay = results?.reduce((s, r) => s + r.netPay, 0) ?? 0;
  const totalGross = results?.reduce((s, r) => s + r.grossIncome, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Space>
          <Button
            icon={<ReloadOutlined spin={isFetching} />}
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          />
          <Tooltip title="Pay/Release Date — only required when Company Policy's cross-month statutory posting is set to use the pay date">
            <DatePicker
              size="middle"
              placeholder="Pay/Release Date"
              value={payDate ? dayjs(payDate) : null}
              onChange={(date) =>
                setPayDate(date ? date.format("YYYY-MM-DD") : null)
              }
            />
          </Tooltip>
          <PermissionGate permission="Payroll Run:Create">
            <Tooltip title={!canRun ? "Select at least one posted batch" : ""}>
              <Button
                icon={<PlayCircleOutlined />}
                onClick={runPayroll}
                loading={calculating}
                disabled={!canRun}
              >
                Preview
              </Button>
            </Tooltip>
          </PermissionGate>
          <PermissionGate permission="Payroll Run:Create">
            <Tooltip
              title={
                !canRun
                  ? "Select at least one posted batch"
                  : "Calculate & save to payroll register"
              }
            >
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => setPostModalOpen(true)}
                loading={generating}
                disabled={!canRun}
              >
                Save Payroll
              </Button>
            </Tooltip>
          </PermissionGate>
        </Space>
      </div>

      <Card size="small" title="DTR Batches">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <MobileRangePicker
            size="small"
            value={
              dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null
            }
            onChange={(dates) =>
              setDateRange(
                dates
                  ? [
                      dates[0]?.format("YYYY-MM-DD") ?? "",
                      dates[1]?.format("YYYY-MM-DD") ?? "",
                    ]
                  : null,
              )
            }
          />
          <Space size="small">
            <Button
              size="small"
              onClick={clearSelection}
              disabled={selected.length === 0}
            >
              Clear
            </Button>
          </Space>
        </div>
        <Table
          rowKey="code"
          dataSource={batches}
          columns={batchColumns}
          loading={isLoading}
          size="small"
          pagination={false}
          scroll={{ x: "max-content" }}
          rowSelection={{
            selectedRowKeys: selected,
            onChange: (keys) => setSelected(keys as string[]),
            // Visible but unselectable until the DTR batch itself clears its own approval --
            // Payroll generation is blocked server-side for an unapproved batch anyway (see
            // PayrollProcessorService.GenerateAsync), so surfacing that here up front avoids a
            // wasted round-trip. A legacy batch with no approvalStatus at all (predates
            // DTRBatch) is treated as already-Approved, same convention as the Status tag above.
            getCheckboxProps: (record) => ({
              disabled:
                !!record.approvalStatus && record.approvalStatus !== "Approved",
            }),
          }}
        />
      </Card>

      {results && (
        <Card
          title={
            <Space>
              <span>Payroll Results</span>
              <Tag color="green">{results.length} employees</Tag>
            </Space>
          }
          extra={
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-8">
              <Statistic
                title="Total Gross"
                value={totalGross}
                precision={2}
                prefix="₱"
                valueStyle={{ fontSize: 14 }}
              />
              <Statistic
                title="Total Net Pay"
                value={totalNetPay}
                precision={2}
                prefix="₱"
                valueStyle={{ fontSize: 14, color: token.colorPrimary }}
              />
            </div>
          }
        >
          <div style={{ overflowX: "auto" }}>
            <Table
              rowKey="employeeId"
              dataSource={results}
              columns={resultColumns}
              size="small"
              pagination={{ pageSize: 50, showSizeChanger: false }}
              scroll={{ x: "max-content" }}
              summary={(rows) => {
                const sum = (pick: (r: PayrollRunResult) => number) =>
                  rows.reduce((s, r) => s + (pick(r) ?? 0), 0);

                const totals = {
                  basic: sum(basicPay),
                  ot: sum(otPay),
                  nd: sum(ndPay),
                  ndot: sum((r) => ndotDisplayPay(r) ?? 0),
                  restDay: sum((r) => r.restDayPay),
                  holiday: sum(holidayPay),
                  allowances: sum((r) => r.totalRegularAllowances),
                  cola: sum((r) => r.cola),
                  bonuses: sum((r) => r.totalBonuses),
                  commissions: sum((r) => r.totalCommissions),
                  deminimis: sum((r) => r.totalDeminimises),
                  otherIncome: sum((r) => r.totalOtherIncome),
                  reimbursement: sum((r) => r.reimbursement),
                  gross: sum((r) => r.grossIncome),
                  sss: sum((r) => r.sssContribution),
                  phic: sum((r) => r.philHealthContribution),
                  hdmf: sum((r) => r.pagIbigContribution),
                  tax: sum((r) => r.withholdingTax),
                  otherDed: sum((r) => r.otherDeductions),
                  late: sum((r) => r.lateAmount),
                  ut: sum((r) => r.underTimeAmount),
                  absent: sum((r) => r.absences),
                  net: sum((r) => r.netPay),
                };
                const cells = [
                  totals.basic,
                  totals.ot,
                  totals.nd,
                  totals.ndot,
                  totals.restDay,
                  totals.holiday,
                  totals.allowances,
                  totals.cola,
                  totals.bonuses,
                  totals.commissions,
                  totals.deminimis,
                  totals.otherIncome,
                  totals.reimbursement,
                  totals.gross,
                  totals.sss,
                  totals.phic,
                  totals.hdmf,
                  totals.tax,
                  totals.otherDed,
                  totals.late,
                  totals.ut,
                  totals.absent,
                ];
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    {cells.map((val, i) => (
                      <Table.Summary.Cell key={i} index={i + 4} align="right">
                        <strong>{fmt(val)}</strong>
                      </Table.Summary.Cell>
                    ))}
                    <Table.Summary.Cell index={cells.length + 4} align="right">
                      <Text strong style={{ color: token.colorPrimary }}>
                        {fmt(totals.net)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </Card>
      )}

      <DtrBatchPreviewModal
        open={!!previewBatchCode}
        batchCode={previewBatchCode}
        onClose={() => setPreviewBatchCode(null)}
      />

      <TimeHourPayResultsModal
        open={!!dailyBreakdownRow}
        onClose={() => setDailyBreakdownRow(null)}
        employeeName={dailyBreakdownRow?.fullName}
        results={dailyBreakdownRow?.timeHourPayResults ?? []}
      />

      <PayrollRunPostModal
        open={postModalOpen}
        batchCount={selected.length}
        isSaving={generating}
        onClose={() => setPostModalOpen(false)}
        onConfirm={handleConfirmGenerate}
      />
    </div>
  );
}

import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
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
import type { ErrorResponse } from "@/shared/types/api-response.model";
import DtrBatchPreviewModal from "../../components/dtr-batch-preview-modal";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title, Text } = Typography;

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

export default function ForPayrollList() {
  const { token } = theme.useToken();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<PayrollRunResult[] | null>(null);
  const [previewBatchCode, setPreviewBatchCode] = useState<string | null>(null);
  const [payDate, setPayDate] = useState<string | null>(null);

  const {
    data: batches = [],
    isLoading,
    isFetching,
    refetch,
  } = useDtrBatches(dateRange?.[0], dateRange?.[1]);
  const { mutate: calculate, isPending: calculating } = useCalculatePayroll();
  const { mutate: generate, isPending: generating } = useGeneratePayroll();

  const canRun = selected.size > 0;

  const toggleSelect = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const selectAll = () =>
    setSelected(
      new Set(batches.filter((b) => !b.isPayrollGenerated).map((b) => b.code)),
    );

  const clearSelection = () => setSelected(new Set());

  const buildPayload = () => ({ batchCodes: [...selected], payDate });

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

  const generatePayroll = () => {
    if (!canRun) return;
    generate(buildPayload(), {
      onSuccess: (res) => {
        setResults(res.data);
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
      title: "",
      key: "check",
      width: 40,
      render: (_, r) => (
        <Tooltip
          title={
            r.isPayrollGenerated
              ? "Payroll has already been generated from this batch."
              : ""
          }
        >
          <Checkbox
            checked={selected.has(r.code)}
            disabled={r.isPayrollGenerated}
            onChange={() => toggleSelect(r.code)}
          />
        </Tooltip>
      ),
    },
    {
      title: "Batch Code",
      dataIndex: "code",
      key: "code",
      width: 220,
      render: (v, r) => (
        <Space size={4}>
          <Text code className="whitespace-nowrap">
            {v}
          </Text>
          {r.isPayrollGenerated && (
            <Tag color="default" className="whitespace-nowrap">
              Payroll Generated
            </Tag>
          )}
        </Space>
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
      title: "Employee",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      fixed: "left",
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
            dataIndex: "basicPay",
            key: "basicPay",
            align: "right",
            render: fmt,
          },
          {
            title: "OT",
            dataIndex: "overtimePay",
            key: "overtimePay",
            align: "right",
            render: fmt,
          },
          {
            title: "ND",
            dataIndex: "nightDifferentialPay",
            key: "nd",
            align: "right",
            render: fmt,
          },
          {
            title: "NDOT",
            dataIndex: "nightDifferentialOTPay",
            key: "ndot",
            align: "right",
            render: fmt,
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
            dataIndex: "holidayPay",
            key: "holidayPay",
            align: "right",
            render: fmt,
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
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Payroll Run
            </Title>
            <p className="page-toolbar-subtitle">
              Select posted DTR batches and run payroll calculation.
            </p>
          </div>
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
            <Tooltip title={!canRun ? "Select at least one posted batch" : ""}>
              <Button
                icon={<PlayCircleOutlined />}
                onClick={runPayroll}
                loading={calculating}
                disabled={!canRun}
              >
                Preview ({selected.size})
              </Button>
            </Tooltip>
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
                onClick={generatePayroll}
                loading={generating}
                disabled={!canRun}
              >
                Generate Payroll
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>

      <Card size="small" className="mb-4" title="DTR Batches">
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
            <Button size="small" onClick={selectAll}>
              Select All
            </Button>
            <Button
              size="small"
              onClick={clearSelection}
              disabled={selected.size === 0}
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
          rowClassName={(r) =>
            selected.has(r.code) ? "ant-table-row-selected" : ""
          }
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
                  basic: sum((r) => r.basicPay),
                  ot: sum((r) => r.overtimePay),
                  nd: sum((r) => r.nightDifferentialPay),
                  ndot: sum((r) => r.nightDifferentialOTPay),
                  restDay: sum((r) => r.restDayPay),
                  holiday: sum((r) => r.holidayPay),
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
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    {cells.map((val, i) => (
                      <Table.Summary.Cell key={i} index={i + 3} align="right">
                        <strong>{fmt(val)}</strong>
                      </Table.Summary.Cell>
                    ))}
                    <Table.Summary.Cell index={cells.length + 3} align="right">
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
    </div>
  );
}

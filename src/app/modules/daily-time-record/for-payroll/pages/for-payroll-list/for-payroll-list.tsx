import { useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Row,
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
  PlayCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useDtrBatches,
  useCalculatePayroll,
  useGeneratePayroll,
} from "../../hooks/use-for-payroll-queries";
import type { DtrBatchModel } from "../../models/api/response/dtr-batch-response.model";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const fmt = (n: number) =>
  n?.toLocaleString("en-PH", { minimumFractionDigits: 2 }) ?? "0.00";
const fmtDate = (d: string) =>
  d ? dayjs(d.replace(/Z$/, "")).format("MMM DD, YYYY") : "—";

export default function ForPayrollList() {
  const { token } = theme.useToken();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<PayrollRunResult[] | null>(null);

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

  const selectAll = () => setSelected(new Set(batches.map((b) => b.code)));

  const clearSelection = () => setSelected(new Set());

  const buildPayload = () => ({ batchCodes: [...selected] });

  const runPayroll = () => {
    if (!canRun) return;
    calculate(buildPayload(), {
      onSuccess: (res) => {
        setResults(res.data);
        message.success(`Preview: ${res.total} employee(s) calculated.`);
      },
      onError: () => message.error("Payroll calculation failed."),
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
      onError: () => message.error("Payroll generation failed."),
    });
  };

  const batchColumns: ColumnsType<DtrBatchModel> = [
    {
      title: "",
      key: "check",
      width: 40,
      render: (_, r) => (
        <Checkbox
          checked={selected.has(r.code)}
          onChange={() => toggleSelect(r.code)}
        />
      ),
    },
    {
      title: "Batch Code",
      dataIndex: "code",
      key: "code",
      render: (v) => <Text code>{v}</Text>,
    },
    {
      title: "Period",
      key: "period",
      render: (_, r) => `${fmtDate(r.fromDate)} — ${fmtDate(r.toDate)}`,
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
      title: "Basic",
      dataIndex: "basicSalary",
      key: "basicSalary",
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
      title: "Other Income",
      dataIndex: "totalOtherIncome",
      key: "otherIncome",
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
    {
      title: "Late/UT",
      key: "lateCut",
      align: "right",
      render: (_, r) => fmt(r.lateAmount + r.underTimeAmount),
    },
    {
      title: "Absent",
      key: "absent",
      align: "right",
      render: (_, r) => fmt(r.absences),
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

      <Card
        size="small"
        className="mb-4"
        title={
          <Space>
            <span>DTR Batches</span>
            <RangePicker
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
          </Space>
        }
        extra={
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
        }
      >
        <Table
          rowKey="code"
          dataSource={batches}
          columns={batchColumns}
          loading={isLoading}
          size="small"
          pagination={false}
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
            <Row gutter={32}>
              <Col>
                <Statistic
                  title="Total Gross"
                  value={totalGross}
                  precision={2}
                  prefix="₱"
                  valueStyle={{ fontSize: 14 }}
                />
              </Col>
              <Col>
                <Statistic
                  title="Total Net Pay"
                  value={totalNetPay}
                  precision={2}
                  prefix="₱"
                  valueStyle={{ fontSize: 14, color: token.colorPrimary }}
                />
              </Col>
            </Row>
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
                const totals = {
                  basic: rows.reduce((s, r) => s + r.basicSalary, 0),
                  ot: rows.reduce((s, r) => s + r.overtimePay, 0),
                  nd: rows.reduce((s, r) => s + r.nightDifferentialPay, 0),
                  holiday: rows.reduce((s, r) => s + r.holidayPay, 0),
                  allowances: rows.reduce(
                    (s, r) => s + r.totalRegularAllowances,
                    0,
                  ),
                  otherIncome: rows.reduce((s, r) => s + r.totalOtherIncome, 0),
                  gross: rows.reduce((s, r) => s + r.grossIncome, 0),
                  sss: rows.reduce((s, r) => s + r.sssContribution, 0),
                  phic: rows.reduce((s, r) => s + r.philHealthContribution, 0),
                  hdmf: rows.reduce((s, r) => s + r.pagIbigContribution, 0),
                  tax: rows.reduce((s, r) => s + r.withholdingTax, 0),
                  otherDed: rows.reduce((s, r) => s + r.otherDeductions, 0),
                  lateCut: rows.reduce(
                    (s, r) => s + r.lateAmount + r.underTimeAmount,
                    0,
                  ),
                  absent: rows.reduce((s, r) => s + r.absences, 0),
                  net: rows.reduce((s, r) => s + r.netPay, 0),
                };
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    {[
                      totals.basic,
                      totals.ot,
                      totals.nd,
                      totals.holiday,
                      totals.allowances,
                      totals.otherIncome,
                      totals.gross,
                      totals.sss,
                      totals.phic,
                      totals.hdmf,
                      totals.tax,
                      totals.otherDed,
                      totals.lateCut,
                      totals.absent,
                    ].map((val, i) => (
                      <Table.Summary.Cell key={i} index={i + 1} align="right">
                        <strong>{fmt(val)}</strong>
                      </Table.Summary.Cell>
                    ))}
                    <Table.Summary.Cell index={15} align="right">
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
    </div>
  );
}

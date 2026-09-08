import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import {
  useGenerateLastPay,
  usePayrolls,
  usePostPayrollBatch,
  useDeletePayrollBatch,
  useAvailableSalaryAdjustments,
  useAvailableOtherIncome,
  useLastPayAttendanceWarnings,
} from "../../hooks/use-for-payroll-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";
import type {
  AvailableSalaryAdjustment,
  AvailableOtherIncome,
} from "../../models/api/response/last-pay-review.model";
import type { ErrorResponse } from "@/shared/types/api-response.model";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";

const { Title, Text } = Typography;

// Separation statuses that make an employee eligible for Last Pay — must match the backend's
// EmployeeService.SeparatedStatuses filter (GetSeparatedEmployeesForLastPayAsync).
const SEPARATED_STATUSES = ["Terminated", "Resigned", "Retired", "Deceased"];

// Last Pay isn't annual like 13th month — there's no natural year to scope the existing-runs
// table by, so it queries a wide, effectively-unbounded range instead.
const RUNS_FROM = "2000-01-01";
const RUNS_TO = dayjs().add(1, "year").format("YYYY-MM-DD");

// ValidationException messages (e.g. "already been generated for one or more selected
// employees") land in data.detail via GlobalExceptionHandler — surface that instead of a
// generic fallback.
const getErrorDetail = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? ((err.response?.data as ErrorResponse | undefined)?.data?.detail ??
      fallback)
    : fallback;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function GenerateLastPay() {
  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [payDate, setPayDate] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [results, setResults] = useState<PayrollRunResult[]>([]);

  const { data: rawEmployees = [] } = useEmployees();
  const separatedEmployeeOptions = useMemo(
    () =>
      rawEmployees
        .filter(
          (e) =>
            SEPARATED_STATUSES.includes(e.employmentStatus) && e.dateResigned,
        )
        .map((e) => ({
          value: e.id,
          label: `${e.firstName} ${e.lastName} — ${e.employmentStatus} (${dayjs(e.dateResigned).format("MMM DD, YYYY")})`,
        })),
    [rawEmployees],
  );

  const employeeNameById = useMemo(
    () =>
      Object.fromEntries(
        rawEmployees.map((e) => [e.id, `${e.firstName} ${e.lastName}`]),
      ) as Record<string, string>,
    [rawEmployees],
  );

  // Review step — which optional components to fold into this run. 13th month and leave
  // conversion default to included (matching the backend's original always-include
  // behavior); Salary Adjustments/Other Income default to every currently-available item
  // once fetched, and HR can uncheck specific rows before generating.
  const [includeThirteenthMonth, setIncludeThirteenthMonth] = useState(true);
  const [includeLeaveConversion, setIncludeLeaveConversion] = useState(true);
  const [selectedAdjustmentIds, setSelectedAdjustmentIds] = useState<string[]>(
    [],
  );
  const [selectedOtherIncomeIds, setSelectedOtherIncomeIds] = useState<
    string[]
  >([]);

  const { data: adjustmentsData, isFetching: isLoadingAdjustments } =
    useAvailableSalaryAdjustments(employeeIds);
  const { data: otherIncomeData, isFetching: isLoadingOtherIncome } =
    useAvailableOtherIncome(employeeIds);
  const { data: attendanceWarningsData } =
    useLastPayAttendanceWarnings(employeeIds);

  const availableAdjustments = adjustmentsData?.data ?? [];
  const availableOtherIncome = otherIncomeData?.data ?? [];
  const attendanceWarnings = attendanceWarningsData?.data ?? [];

  // Re-defaults to "everything available" whenever the fetched set changes (a different
  // employee selection, or a row that got consumed elsewhere) — HR's unchecks only need to
  // survive within one review session, not across a re-fetch. Adjusting state during render
  // (React's documented pattern for this) instead of in an effect, which would cause an
  // extra render pass on every fetch.
  const adjustmentIdsKey = availableAdjustments.map((a) => a.id).join(",");
  const [prevAdjustmentIdsKey, setPrevAdjustmentIdsKey] = useState("");
  if (adjustmentIdsKey !== prevAdjustmentIdsKey) {
    setPrevAdjustmentIdsKey(adjustmentIdsKey);
    setSelectedAdjustmentIds(availableAdjustments.map((a) => a.id));
  }

  const otherIncomeIdsKey = availableOtherIncome.map((a) => a.id).join(",");
  const [prevOtherIncomeIdsKey, setPrevOtherIncomeIdsKey] = useState("");
  if (otherIncomeIdsKey !== prevOtherIncomeIdsKey) {
    setPrevOtherIncomeIdsKey(otherIncomeIdsKey);
    setSelectedOtherIncomeIds(availableOtherIncome.map((a) => a.id));
  }

  const { mutateAsync: generate, isPending: isGenerating } =
    useGenerateLastPay();

  const handleGenerate = async () => {
    if (employeeIds.length === 0) {
      message.warning("Select at least one separated employee.");
      return;
    }
    try {
      const response = await generate({
        employeeIds,
        payDate: payDate ?? undefined,
        remarks: remarks || undefined,
        includeThirteenthMonth,
        includeLeaveConversion,
        salaryAdjustmentIds: selectedAdjustmentIds,
        otherIncomeScheduleIds: selectedOtherIncomeIds,
      });
      setResults(response.data);
      message.success(
        `Generated Last Pay for ${response.total} employee${response.total !== 1 ? "s" : ""}.`,
      );
      refetchRunsPayrolls();
    } catch (err) {
      message.error(
        getErrorDetail(err, "Failed to generate Last Pay. Please try again."),
      );
    }
  };

  // Existing Last Pay drafts/posted runs — reuses the same GET /payrolls the regular Payroll
  // Summary screen already queries, filtered client-side to this run type.
  const { data: runsPayrolls, refetch: refetchRunsPayrolls } = usePayrolls({
    from: RUNS_FROM,
    to: RUNS_TO,
  });

  const lastPayRows = useMemo(
    () => (runsPayrolls?.data ?? []).filter((r) => r.payrollType === "LastPay"),
    [runsPayrolls],
  );

  const batchGroups = useMemo(() => {
    const map = new Map<
      string,
      { payrollBatchId: string; rows: PayrollRunResult[] }
    >();
    for (const r of lastPayRows) {
      if (!r.id || !r.payrollBatchId) continue;
      if (!map.has(r.payrollBatchId))
        map.set(r.payrollBatchId, {
          payrollBatchId: r.payrollBatchId,
          rows: [],
        });
      map.get(r.payrollBatchId)!.rows.push(r);
    }
    return Array.from(map.values())
      .map((g) => ({
        payrollBatchId: g.payrollBatchId,
        count: g.rows.length,
        allPosted: g.rows.every((r) => r.isPosted),
        hasPosted: g.rows.some((r) => r.isPosted),
        payDate: g.rows[0].payDate,
        remarks: g.rows[0].remarks,
        totalGross: g.rows.reduce((s, r) => s + r.grossIncome, 0),
        totalNet: g.rows.reduce((s, r) => s + r.netPay, 0),
      }))
      .sort((a, b) => b.payrollBatchId.localeCompare(a.payrollBatchId));
  }, [lastPayRows]);

  const { mutateAsync: postPayrollBatch, isPending: isPostingBatch } =
    usePostPayrollBatch();
  const { mutateAsync: deletePayrollBatch, isPending: isDeletingBatch } =
    useDeletePayrollBatch();

  const handlePostBatch = async (payrollBatchId: string, count: number) => {
    try {
      await postPayrollBatch(payrollBatchId);
      message.success(
        `Posted Last Pay — ${count} record${count !== 1 ? "s" : ""} locked in as final.`,
      );
      refetchRunsPayrolls();
    } catch {
      message.error("Failed to post this run. Please try again.");
    }
  };

  const handleDeleteBatch = async (payrollBatchId: string, count: number) => {
    try {
      await deletePayrollBatch(payrollBatchId);
      message.success(
        `Deleted Last Pay draft — ${count} record${count !== 1 ? "s" : ""} removed.`,
      );
      refetchRunsPayrolls();
    } catch {
      message.error("Failed to delete this run. Please try again.");
    }
  };

  // Opens the payslip PDF in a new tab (same convention as Payroll Summary's per-row print)
  // — PayslipDocument.cs renders a dedicated "LAST PAY" layout for these rows.
  const handlePrintPayslip = async (record: PayrollRunResult) => {
    if (!record.id) {
      message.error("This record has no printable payslip yet.");
      return;
    }
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        `${buildApiUrl(API_PREFIX.hrms, "payrolls")}/${record.id}/print`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(blob);
      if (printTab) printTab.location.href = url;
    } catch {
      printTab?.close();
      message.error("Failed to generate the payslip. Please try again.");
    }
  };

  const employeeColumns: ColumnsType<PayrollRunResult> = [
    { title: "Employee", dataIndex: "fullName", key: "name" },
    {
      title: "Gross (13th Mo. + Leave Conv.)",
      dataIndex: "grossIncome",
      key: "gross",
      align: "right",
      render: fmt,
    },
    {
      title: "Non-Taxable",
      dataIndex: "nonTaxableBenefits",
      key: "nonTaxable",
      align: "right",
      render: fmt,
    },
    {
      title: "Taxable Excess",
      dataIndex: "taxableBenefits",
      key: "taxable",
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
      title: "Outstanding Loans",
      dataIndex: "totalLoans",
      key: "loans",
      align: "right",
      render: fmt,
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "net",
      align: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => (
        <Tag color={r.isPosted ? "success" : "default"}>
          {r.isPosted ? "Posted" : "Draft"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "print",
      width: 48,
      render: (_, r) => (
        <Tooltip title="Print payslip">
          <Button
            type="text"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintPayslip(r)}
          />
        </Tooltip>
      ),
    },
  ];

  const resultColumns: ColumnsType<PayrollRunResult> = [
    { title: "Employee", dataIndex: "fullName", key: "name" },
    {
      title: "Gross (13th Mo. + Leave Conv.)",
      dataIndex: "grossIncome",
      key: "gross",
      align: "right",
      render: fmt,
    },
    {
      title: "Non-Taxable",
      dataIndex: "nonTaxableBenefits",
      key: "nonTaxable",
      align: "right",
      render: fmt,
    },
    {
      title: "Taxable Excess",
      dataIndex: "taxableBenefits",
      key: "taxable",
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
      title: "Outstanding Loans",
      dataIndex: "totalLoans",
      key: "loans",
      align: "right",
      render: fmt,
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "net",
      align: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Generate Last Pay
            </Title>
            <p className="page-toolbar-subtitle">
              Computes a separated employee&apos;s prorated 13th month pay and
              leave credit cash conversion, nets outstanding loans off Net Pay,
              and creates an editable draft. Final wages for days actually
              worked still go through the regular Generate Payroll flow.
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={24} md={14}>
              <Form.Item label="Separated Employee(s)">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Select separated employees (Terminated, Resigned, Retired, Deceased)"
                  options={separatedEmployeeOptions}
                  value={employeeIds}
                  onChange={setEmployeeIds}
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <Form.Item label="Pay/Release Date (optional)">
                <DatePicker
                  style={{ width: "100%" }}
                  value={payDate ? dayjs(payDate) : null}
                  onChange={(date) =>
                    setPayDate(date ? date.format("YYYY-MM-DD") : null)
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="Remarks (optional)">
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Final settlement"
                />
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isGenerating}
            onClick={handleGenerate}
          >
            Generate Last Pay
          </Button>
        </Form>
      </Card>

      {employeeIds.length > 0 && (
        <Card className="mb-4" title="Review Components to Include">
          {attendanceWarnings.length > 0 && (
            <Alert
              className="mb-4"
              type="warning"
              showIcon
              message="Posted attendance found after the last regular payroll"
              description={
                <ul className="mb-0 pl-4">
                  {attendanceWarnings.map((w) => (
                    <li key={w.employeeId}>
                      {w.fullName} — {w.unpaidAttendanceDayCount} posted DTR day
                      {w.unpaidAttendanceDayCount !== 1 ? "s" : ""} between{" "}
                      {w.lastRegularPayPeriodEnd
                        ? dayjs(w.lastRegularPayPeriodEnd).format(
                            "MMM DD, YYYY",
                          )
                        : "hire date"}{" "}
                      and separation (
                      {dayjs(w.separationDate).format("MMM DD, YYYY")}) . Run a
                      regular payroll for that final cutoff first, or these days
                      go unpaid.
                    </li>
                  ))}
                </ul>
              }
            />
          )}

          <Space size="large" className="mb-4">
            <Checkbox
              checked={includeThirteenthMonth}
              onChange={(e) => setIncludeThirteenthMonth(e.target.checked)}
            >
              Include prorated 13th month pay{" "}
              <Tooltip title="Prorated 13th month pay counts any pay period that started on or before the employee's separation date — even if the period's nominal end date falls after it, since the basic pay in it is already capped to their actual last day worked.">
                <InfoCircleOutlined className="text-(--ant-color-text-tertiary)" />
              </Tooltip>
            </Checkbox>
            <Checkbox
              checked={includeLeaveConversion}
              onChange={(e) => setIncludeLeaveConversion(e.target.checked)}
            >
              Include leave credit cash conversion
            </Checkbox>
          </Space>

          <Text strong className="mb-2 block">
            Pending Salary Adjustments
          </Text>
          <Table<AvailableSalaryAdjustment>
            className="mb-4"
            rowKey="id"
            size="small"
            loading={isLoadingAdjustments}
            dataSource={availableAdjustments}
            pagination={false}
            locale={{ emptyText: "No pending salary adjustments." }}
            rowSelection={{
              selectedRowKeys: selectedAdjustmentIds,
              onChange: (keys) => setSelectedAdjustmentIds(keys as string[]),
            }}
            columns={[
              {
                title: "Employee",
                key: "employee",
                render: (_, r) => employeeNameById[r.employeeId] ?? "—",
              },
              { title: "Type", dataIndex: "adjustmentType", key: "type" },
              {
                title: "Date",
                dataIndex: "payrollDate",
                key: "date",
                render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
              },
              {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                align: "right",
                render: fmt,
              },
              {
                title: "Remarks",
                dataIndex: "remarks",
                key: "remarks",
                render: (v?: string) => v || "—",
              },
            ]}
          />

          <Text strong className="mb-2 block">
            Pending Other Income
          </Text>
          <Table<AvailableOtherIncome>
            rowKey="id"
            size="small"
            loading={isLoadingOtherIncome}
            dataSource={availableOtherIncome}
            pagination={false}
            locale={{ emptyText: "No pending other income." }}
            rowSelection={{
              selectedRowKeys: selectedOtherIncomeIds,
              onChange: (keys) => setSelectedOtherIncomeIds(keys as string[]),
            }}
            columns={[
              {
                title: "Employee",
                key: "employee",
                render: (_, r) => employeeNameById[r.employeeId] ?? "—",
              },
              {
                title: "Income",
                key: "income",
                render: (_, r) => r.income?.name ?? "—",
              },
              {
                title: "Date",
                dataIndex: "date",
                key: "date",
                render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
              },
              {
                title: "Amount",
                dataIndex: "amount",
                key: "amount",
                align: "right",
                render: fmt,
              },
              {
                title: "Taxable",
                dataIndex: "isTaxable",
                key: "isTaxable",
                render: (v: boolean) => (
                  <Tag color={v ? "orange" : "default"}>
                    {v ? "Taxable" : "Non-Taxable"}
                  </Tag>
                ),
              },
              {
                title: "Notes",
                dataIndex: "notes",
                key: "notes",
                render: (v?: string) => v || "—",
              },
            ]}
          />
        </Card>
      )}

      {results.length > 0 && (
        <>
          <Row gutter={16} className="mb-4">
            <Col>
              <Card size="small">
                <Statistic title="Employees" value={results.length} />
              </Card>
            </Col>
            <Col>
              <Card size="small">
                <Statistic
                  title="Total Gross"
                  value={results.reduce((s, r) => s + r.grossIncome, 0)}
                  precision={2}
                  prefix="₱"
                />
              </Card>
            </Col>
            <Col>
              <Card size="small">
                <Statistic
                  title="Total Net Pay"
                  value={results.reduce((s, r) => s + r.netPay, 0)}
                  precision={2}
                  prefix="₱"
                />
              </Card>
            </Col>
          </Row>
          <Card className="mb-4" title="Just Generated">
            <Table
              rowKey="employeeId"
              size="small"
              dataSource={results}
              columns={resultColumns}
              pagination={{ pageSize: 50, showSizeChanger: false }}
            />
          </Card>
        </>
      )}

      <Card title="Last Pay Runs">
        <Table
          rowKey="payrollBatchId"
          size="small"
          dataSource={batchGroups}
          pagination={false}
          scroll={{ x: "max-content" }}
          expandable={{
            expandedRowRender: (g) => (
              <Table
                rowKey="employeeId"
                size="small"
                pagination={false}
                dataSource={lastPayRows.filter(
                  (r) => r.payrollBatchId === g.payrollBatchId,
                )}
                columns={employeeColumns}
              />
            ),
          }}
          columns={[
            {
              title: "Employees",
              dataIndex: "count",
              key: "count",
              align: "right",
            },
            {
              title: "Total Gross",
              dataIndex: "totalGross",
              key: "totalGross",
              align: "right",
              render: fmt,
            },
            {
              title: "Total Net",
              dataIndex: "totalNet",
              key: "totalNet",
              align: "right",
              render: fmt,
            },
            {
              title: "Payout Date",
              key: "payDate",
              render: (_, g) =>
                g.payDate ? dayjs(g.payDate).format("MMM DD, YYYY") : "—",
            },
            {
              title: "Remarks",
              key: "remarks",
              ellipsis: { showTitle: false },
              render: (_, g) =>
                g.remarks ? (
                  <Tooltip title={g.remarks}>
                    <Text type="secondary">{g.remarks}</Text>
                  </Tooltip>
                ) : (
                  <Text type="secondary">—</Text>
                ),
            },
            {
              title: "Status",
              key: "status",
              render: (_, g) => (
                <Tag color={g.allPosted ? "success" : "default"}>
                  {g.allPosted ? "Posted" : "Draft"}
                </Tag>
              ),
            },
            {
              title: "",
              key: "actions",
              render: (_, g) => (
                <Space size={4}>
                  <Popconfirm
                    title="Post this Last Pay run?"
                    description={`Locks all ${g.count} record${g.count !== 1 ? "s" : ""} in as final.`}
                    okText="Post"
                    cancelText="Cancel"
                    disabled={g.allPosted}
                    onConfirm={() => handlePostBatch(g.payrollBatchId, g.count)}
                  >
                    <Button
                      size="small"
                      icon={<CheckCircleOutlined />}
                      disabled={g.allPosted}
                      loading={isPostingBatch}
                    >
                      Post
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Delete this Last Pay draft?"
                    description={`This removes all ${g.count} record${g.count !== 1 ? "s" : ""} in this run.`}
                    okText="Delete"
                    okButtonProps={{ danger: true }}
                    cancelText="Cancel"
                    disabled={g.hasPosted}
                    onConfirm={() =>
                      handleDeleteBatch(g.payrollBatchId, g.count)
                    }
                  >
                    <Tooltip
                      title={
                        g.hasPosted
                          ? "This run has been posted and can no longer be deleted."
                          : undefined
                      }
                    >
                      <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        disabled={g.hasPosted}
                        loading={isDeletingBatch}
                      >
                        Delete
                      </Button>
                    </Tooltip>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  Button,
  Card,
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
  EyeOutlined,
  InfoCircleOutlined,
  LockOutlined,
  PrinterOutlined,
  SaveOutlined,
  UnlockOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  usePreviewYearEndAdjustment,
  useGenerateYearEndAdjustment,
  usePayrolls,
  usePostPayrollBatch,
  useDeletePayrollBatch,
} from "../../hooks/use-for-payroll-queries";
import { useYearLocks, useReopenYear } from "../../hooks/use-year-lock-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";
import type { TaxAnnualizationPreview } from "../../models/api/response/tax-annualization-preview.model";
import type { ErrorResponse } from "@/shared/types/api-response.model";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";

const { Title, Text } = Typography;

// ValidationException messages (e.g. "already been generated for every eligible employee")
// land in data.detail via GlobalExceptionHandler — surface that instead of a generic fallback.
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

export default function GenerateYearEndAdjustment() {
  const [year, setYear] = useState(dayjs().year());
  const [payrollGroupIds, setPayrollGroupIds] = useState<string[]>([]);
  const [payDate, setPayDate] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [preview, setPreview] = useState<TaxAnnualizationPreview[]>([]);
  const [results, setResults] = useState<PayrollRunResult[]>([]);

  const { data: payrollGroups = [] } = usePayrollGroups();
  const payrollGroupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: p.code || p.name,
  }));

  const { mutateAsync: previewRun, isPending: isPreviewing } =
    usePreviewYearEndAdjustment();
  const { mutateAsync: generate, isPending: isGenerating } =
    useGenerateYearEndAdjustment();

  // "Data Immutability" — once a Year-End Tax Adjustment is posted for a year, that year's
  // payroll data locks (see YearLockService); an admin can explicitly reopen it here.
  const { data: yearLocks = [] } = useYearLocks();
  const { mutateAsync: reopenYear, isPending: isReopening } = useReopenYear();
  const lockedYears = yearLocks.filter((y) => y.isLocked);

  const handleReopenYear = async (lockYear: number) => {
    try {
      await reopenYear(lockYear);
      message.success(`${lockYear} has been reopened.`);
    } catch (err) {
      message.error(
        getErrorDetail(err, "Failed to reopen this year. Please try again."),
      );
    }
  };

  const buildPayload = () => ({
    year,
    payrollGroupIds: payrollGroupIds.length ? payrollGroupIds : undefined,
    payDate: payDate ?? undefined,
    remarks: remarks || undefined,
  });

  const handlePreview = async () => {
    try {
      const response = await previewRun(buildPayload());
      setResults([]);
      setPreview(response.data);
      if (response.data.length === 0) {
        message.info(`No employees with posted payroll found for ${year}.`);
      }
    } catch (err) {
      message.error(
        getErrorDetail(
          err,
          "Failed to compute the Year-End Tax Adjustment preview. Please try again.",
        ),
      );
    }
  };

  const handleGenerate = async () => {
    try {
      const response = await generate(buildPayload());
      setResults(response.data);
      message.success(
        `Generated Year-End Tax Adjustment for ${response.total} employee${response.total !== 1 ? "s" : ""}.`,
      );
      refetchYearPayrolls();
    } catch (err) {
      message.error(
        getErrorDetail(
          err,
          "Failed to generate the Year-End Tax Adjustment. Please try again.",
        ),
      );
    }
  };

  // Existing Year-End Tax Adjustment drafts/posted runs for the selected year — reuses the
  // same GET /payrolls the regular Payroll Summary screen already queries, scoped to the full
  // calendar year and filtered client-side to this run type.
  const { data: yearPayrolls, refetch: refetchYearPayrolls } = usePayrolls({
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  });

  const adjustmentRows = useMemo(
    () =>
      (yearPayrolls?.data ?? []).filter(
        (r) => r.payrollType === "YearEndAdjustment",
      ),
    [yearPayrolls],
  );

  const batchGroups = useMemo(() => {
    const map = new Map<
      string,
      { payrollBatchId: string; rows: PayrollRunResult[] }
    >();
    for (const r of adjustmentRows) {
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
        totalAdjustment: g.rows.reduce((s, r) => s + r.withholdingTax, 0),
        totalNet: g.rows.reduce((s, r) => s + r.netPay, 0),
      }))
      .sort((a, b) => b.payrollBatchId.localeCompare(a.payrollBatchId));
  }, [adjustmentRows]);

  const { mutateAsync: postPayrollBatch, isPending: isPostingBatch } =
    usePostPayrollBatch();
  const { mutateAsync: deletePayrollBatch, isPending: isDeletingBatch } =
    useDeletePayrollBatch();

  const handlePostBatch = async (payrollBatchId: string, count: number) => {
    try {
      await postPayrollBatch(payrollBatchId);
      message.success(
        `Posted Year-End Tax Adjustment — ${count} record${count !== 1 ? "s" : ""} locked in as final.`,
      );
      refetchYearPayrolls();
    } catch {
      message.error("Failed to post this run. Please try again.");
    }
  };

  const handleDeleteBatch = async (payrollBatchId: string, count: number) => {
    try {
      await deletePayrollBatch(payrollBatchId);
      message.success(
        `Deleted Year-End Tax Adjustment draft — ${count} record${count !== 1 ? "s" : ""} removed.`,
      );
      refetchYearPayrolls();
    } catch {
      message.error("Failed to delete this run. Please try again.");
    }
  };

  // Opens the payslip PDF in a new tab (same convention as Payroll Summary's per-row print)
  // — PayslipDocument.cs renders a dedicated "YEAR-END TAX ADJUSTMENT" layout for these rows.
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

  const adjustmentTag = (amount: number, isRefund: boolean) => (
    <Tag color={isRefund ? "blue" : "orange"}>
      {isRefund ? "Refund" : "Collection"} {fmt(Math.abs(amount))}
    </Tag>
  );

  const previewColumns: ColumnsType<TaxAnnualizationPreview> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      render: (name: string, r) => (
        <Space size={4}>
          {name}
          {r.hasPriorEmployerData && (
            <Tooltip
              title={`Includes prior employer: Gross ${fmt(r.priorEmployerGrossIncome)}, Tax Withheld ${fmt(r.priorEmployerTaxWithheld)}`}
            >
              <InfoCircleOutlined style={{ color: "#1677ff" }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: "Annual Gross",
      dataIndex: "annualGrossIncome",
      key: "gross",
      align: "right",
      render: fmt,
    },
    {
      title: "Annual Taxable Income",
      dataIndex: "annualTaxableIncome",
      key: "taxable",
      align: "right",
      render: fmt,
    },
    {
      title: "Annual Tax Due",
      dataIndex: "annualTaxDue",
      key: "due",
      align: "right",
      render: fmt,
    },
    {
      title: "Tax Withheld (YTD)",
      dataIndex: "annualWithholdingTaxYTD",
      key: "withheld",
      align: "right",
      render: fmt,
    },
    {
      title: "Adjustment",
      key: "adjustment",
      align: "right",
      render: (_, r) =>
        r.isMinimumWageEarner
          ? "—"
          : adjustmentTag(r.adjustmentAmount, r.isRefund),
    },
    {
      title: "",
      key: "flags",
      render: (_, r) => (
        <Space size={4}>
          {r.isMinimumWageEarner && <Tag>Excluded — MWE</Tag>}
          {r.isUnclassified && (
            <Tooltip title="Branch/Region minimum-wage setup couldn't be resolved for this employee — defaulted to non-MWE.">
              <Tag color="warning">Unclassified</Tag>
            </Tooltip>
          )}
          {r.exceedsLargeCollectionWarning && (
            <Tooltip title="This collection is larger than the configured multiple of the employee's average monthly net pay (see Payroll Settings). Review before generating — Generate is not blocked.">
              <Tag color="error" icon={<WarningOutlined />}>
                Large Collection
              </Tag>
            </Tooltip>
          )}
          {r.alreadyGenerated && (
            <Tag color="processing">Already Generated</Tag>
          )}
        </Space>
      ),
    },
  ];

  const employeeColumns: ColumnsType<PayrollRunResult> = [
    { title: "Employee", dataIndex: "fullName", key: "name" },
    {
      title: "Adjustment Amount",
      dataIndex: "withholdingTax",
      key: "adjustment",
      align: "right",
      render: (v: number) =>
        v < 0 ? (
          <Tag color="blue">Refund {fmt(Math.abs(v))}</Tag>
        ) : (
          <Tag color="orange">Collection {fmt(v)}</Tag>
        ),
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
        <PermissionGate permission="Payroll Summary:Export">
          <Tooltip title="Print payslip">
            <Button
              type="text"
              size="small"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintPayslip(r)}
            />
          </Tooltip>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Year-End Tax Adjustment
            </Title>
            <p className="page-toolbar-subtitle">
              Recomputes each employee&apos;s true annual income tax against the
              Annual Tax Table, nets it against the withholding tax already
              collected for the year, and creates an editable refund or
              additional-collection draft. Minimum Wage Earners are excluded
              automatically.
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-4">
        <Form layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={6} md={4}>
              <Form.Item label="Year">
                <DatePicker
                  picker="year"
                  style={{ width: "100%" }}
                  value={dayjs().year(year)}
                  allowClear={false}
                  onChange={(date) => date && setYear(date.year())}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Payroll Group (optional — all eligible employees if empty)">
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="All payroll groups"
                  options={payrollGroupOptions}
                  value={payrollGroupIds}
                  onChange={setPayrollGroupIds}
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
            <Col xs={24} sm={12} md={8}>
              <Form.Item label="Remarks (optional)">
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. 2026 Year-End Tax Adjustment"
                />
              </Form.Item>
            </Col>
          </Row>
          <PermissionGate permission="Year-End Adjustment Run:Create">
            <Space>
              <Button
                icon={<EyeOutlined />}
                loading={isPreviewing}
                onClick={handlePreview}
              >
                Preview
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={isGenerating}
                disabled={preview.length === 0}
                onClick={handleGenerate}
              >
                Generate Year-End Tax Adjustment
              </Button>
            </Space>
          </PermissionGate>
        </Form>
      </Card>

      {lockedYears.length > 0 && (
        <Card className="mb-4" title="Locked Years" size="small">
          <Space direction="vertical" style={{ width: "100%" }}>
            {lockedYears.map((y) => (
              <div
                key={y.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Space>
                  <LockOutlined />
                  <Text strong>{y.year}</Text>
                  {y.lockedAt && (
                    <Text type="secondary">
                      Locked {dayjs(y.lockedAt).format("MMM DD, YYYY")}
                    </Text>
                  )}
                </Space>
                <Popconfirm
                  title={`Reopen ${y.year}?`}
                  description="This allows new or edited payroll for this year again. Use with caution."
                  okText="Reopen"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancel"
                  onConfirm={() => handleReopenYear(y.year)}
                >
                  <Button
                    size="small"
                    icon={<UnlockOutlined />}
                    loading={isReopening}
                  >
                    Reopen
                  </Button>
                </Popconfirm>
              </div>
            ))}
          </Space>
        </Card>
      )}

      {preview.length > 0 && results.length === 0 && (
        <Card className="mb-4" title={`Preview — ${year}`}>
          <Table
            rowKey="employeeId"
            size="small"
            dataSource={preview}
            columns={previewColumns}
            pagination={{ pageSize: 50, showSizeChanger: false }}
            scroll={{ x: "max-content" }}
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
                  title="Total Collections"
                  value={results
                    .filter((r) => r.withholdingTax > 0)
                    .reduce((s, r) => s + r.withholdingTax, 0)}
                  precision={2}
                  prefix="₱"
                />
              </Card>
            </Col>
            <Col>
              <Card size="small">
                <Statistic
                  title="Total Refunds"
                  value={Math.abs(
                    results
                      .filter((r) => r.withholdingTax < 0)
                      .reduce((s, r) => s + r.withholdingTax, 0),
                  )}
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
              columns={employeeColumns}
              pagination={{ pageSize: 50, showSizeChanger: false }}
            />
          </Card>
        </>
      )}

      <Card title={`Year-End Tax Adjustment Runs — ${year}`}>
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
                dataSource={adjustmentRows.filter(
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
              title: "Net Adjustment",
              dataIndex: "totalAdjustment",
              key: "totalAdjustment",
              align: "right",
              render: fmt,
            },
            {
              title: "Total Net Pay",
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
                  <PermissionGate permission="Year-End Adjustment Run:Approve">
                    <Popconfirm
                      title="Post this Year-End Tax Adjustment run?"
                      description={`Locks all ${g.count} record${g.count !== 1 ? "s" : ""} in as final.`}
                      okText="Post"
                      cancelText="Cancel"
                      disabled={g.allPosted}
                      onConfirm={() =>
                        handlePostBatch(g.payrollBatchId, g.count)
                      }
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
                  </PermissionGate>
                  <PermissionGate permission="Year-End Adjustment Run:Create">
                    <Popconfirm
                      title="Delete this Year-End Tax Adjustment draft?"
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
                  </PermissionGate>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}

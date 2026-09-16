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
  PrinterOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import {
  useGenerateThirteenthMonth,
  usePayrolls,
  usePostPayrollBatch,
  useDeletePayrollBatch,
} from "../../hooks/use-for-payroll-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";
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

export default function GenerateThirteenthMonth() {
  const [year, setYear] = useState(dayjs().year());
  const [payrollGroupIds, setPayrollGroupIds] = useState<string[]>([]);
  const [payDate, setPayDate] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [results, setResults] = useState<PayrollRunResult[]>([]);

  const { data: payrollGroups = [] } = usePayrollGroups();
  const payrollGroupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: p.code || p.name,
  }));

  const { mutateAsync: generate, isPending: isGenerating } =
    useGenerateThirteenthMonth();

  const handleGenerate = async () => {
    try {
      const response = await generate({
        year,
        payrollGroupIds: payrollGroupIds.length ? payrollGroupIds : undefined,
        payDate: payDate ?? undefined,
        remarks: remarks || undefined,
      });
      setResults(response.data);
      message.success(
        `Generated 13th Month Pay for ${response.total} employee${response.total !== 1 ? "s" : ""}.`,
      );
      refetchYearPayrolls();
    } catch (err) {
      message.error(
        getErrorDetail(
          err,
          "Failed to generate 13th Month Pay. Please try again.",
        ),
      );
    }
  };

  // Existing 13th month drafts/posted runs for the selected year — reuses the same GET
  // /payrolls the regular Payroll Summary screen already queries, scoped to the full
  // calendar year and filtered client-side to this run type.
  const { data: yearPayrolls, refetch: refetchYearPayrolls } = usePayrolls({
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  });

  const thirteenthMonthRows = useMemo(
    () =>
      (yearPayrolls?.data ?? []).filter(
        (r) => r.payrollType === "ThirteenthMonth",
      ),
    [yearPayrolls],
  );

  const batchGroups = useMemo(() => {
    const map = new Map<
      string,
      { payrollBatchId: string; rows: PayrollRunResult[] }
    >();
    for (const r of thirteenthMonthRows) {
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
  }, [thirteenthMonthRows]);

  const { mutateAsync: postPayrollBatch, isPending: isPostingBatch } =
    usePostPayrollBatch();
  const { mutateAsync: deletePayrollBatch, isPending: isDeletingBatch } =
    useDeletePayrollBatch();

  const handlePostBatch = async (payrollBatchId: string, count: number) => {
    try {
      await postPayrollBatch(payrollBatchId);
      message.success(
        `Posted 13th Month Pay — ${count} record${count !== 1 ? "s" : ""} locked in as final.`,
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
        `Deleted 13th Month Pay draft — ${count} record${count !== 1 ? "s" : ""} removed.`,
      );
      refetchYearPayrolls();
    } catch {
      message.error("Failed to delete this run. Please try again.");
    }
  };

  // Opens the payslip PDF in a new tab (same convention as Payroll Summary's per-row print)
  // — PayslipDocument.cs renders a dedicated "13TH MONTH PAY" layout for these rows.
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
      title: "13th Month Pay",
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

  const resultColumns: ColumnsType<PayrollRunResult> = [
    { title: "Employee", dataIndex: "fullName", key: "name" },
    {
      title: "13th Month Pay",
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
              Generate 13th Month Pay
            </Title>
            <p className="page-toolbar-subtitle">
              Computes each eligible employee&apos;s total basic pay earned in
              the year ÷ 12, splits it against the non-taxable ceiling, and
              creates an editable draft — not subject to SSS/PhilHealth/
              Pag-IBIG.
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
                  placeholder="e.g. 2026 13th Month Pay"
                />
              </Form.Item>
            </Col>
          </Row>
          <PermissionGate permission="13th Month Run:Create">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={isGenerating}
              onClick={handleGenerate}
            >
              Generate 13th Month Pay
            </Button>
          </PermissionGate>
        </Form>
      </Card>

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
                  title="Total 13th Month Pay"
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

      <Card title={`13th Month Pay Runs — ${year}`}>
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
                dataSource={thirteenthMonthRows.filter(
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
                  <PermissionGate permission="13th Month Run:Approve">
                    <Popconfirm
                      title="Post this 13th Month Pay run?"
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
                  <PermissionGate permission="13th Month Run:Create">
                    <Popconfirm
                      title="Delete this 13th Month Pay draft?"
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

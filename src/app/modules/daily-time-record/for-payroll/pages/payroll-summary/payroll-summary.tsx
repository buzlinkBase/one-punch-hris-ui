import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Modal,
  Popconfirm,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import {
  ReloadOutlined,
  FileTextOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  usePayrolls,
  usePostPayrollBatch,
  useDeletePayrollBatch,
} from "../../hooks/use-for-payroll-queries";
import type { PayrollRunResult } from "../../models/api/response/payroll-run-result.model";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import {
  buildFlatCsv,
  buildFlatExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";

const { Title, Text } = Typography;

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });
const fmtH = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }) + " h";

// Holiday-category totals, mirroring PayslipDocument.cs's formulas exactly — each folds
// its own base + OT + ND + NDOT tiers into one figure; "Holiday Duty" excludes the
// unworked portion of Legal Holiday pay, and "Double Legal" folds in the rest-day variant.
function holidayDuty(r: PayrollRunResult) {
  return (
    (r.legalPay ?? 0) -
    (r.legalHolidayUnworkedPay ?? 0) +
    (r.legalOTPay ?? 0) +
    (r.legalNDPay ?? 0) +
    (r.legalNDOTPay ?? 0)
  );
}
function restLegalTotal(r: PayrollRunResult) {
  return (
    (r.restLegalPay ?? 0) +
    (r.restLegalOTPay ?? 0) +
    (r.restLegalNDPay ?? 0) +
    (r.restLegalNDOTPay ?? 0)
  );
}
function restSpecialTotal(r: PayrollRunResult) {
  return (
    (r.restSpecialPay ?? 0) +
    (r.restSpecialOTPay ?? 0) +
    (r.restSpecialNDPay ?? 0) +
    (r.restSpecialNDOTPay ?? 0)
  );
}
function specialTotal(r: PayrollRunResult) {
  return (
    (r.specialPay ?? 0) +
    (r.specialOTPay ?? 0) +
    (r.specialNDPay ?? 0) +
    (r.specialNDOTPay ?? 0)
  );
}
function doubleLegalTotal(r: PayrollRunResult) {
  return (
    (r.doubleLegalPay ?? 0) +
    (r.doubleLegalOTPay ?? 0) +
    (r.doubleLegalNDPay ?? 0) +
    (r.doubleLegalNDOTPay ?? 0)
  );
}
function restDoubleLegalTotal(r: PayrollRunResult) {
  return (
    (r.restDoubleLegalPay ?? 0) +
    (r.restDoubleLegalOTPay ?? 0) +
    (r.restDoubleLegalNDPay ?? 0) +
    (r.restDoubleLegalNDOTPay ?? 0)
  );
}
function restDayTotal(r: PayrollRunResult) {
  return (
    (r.restDayPay ?? 0) +
    (r.restDayOTPay ?? 0) +
    (r.restDayNDPay ?? 0) +
    (r.restDayNDOTPay ?? 0)
  );
}

export default function PayrollSummary() {
  const { token } = theme.useToken();
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().startOf("month").format("YYYY-MM-DD"),
    dayjs().endOf("month").format("YYYY-MM-DD"),
  ]);

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = usePayrolls({
    from: dateRange[0],
    to: dateRange[1],
  });

  const results = useMemo<PayrollRunResult[]>(
    () => response?.data ?? [],
    [response],
  );

  // Every row from one Generate run shares a PayrollBatchId (the id of its PayrollBatch
  // header row) — grouped here so Post/Delete act on the whole run in one action instead of
  // one employee at a time. This is a run-level transaction, not a per-employee one: an
  // employee's payroll was never generated on its own, so it isn't posted or deleted on its
  // own either (and deleting per-row wouldn't even unblock regenerating — GenerateAsync
  // blocks re-running a DTR batch while ANY row from it still exists).
  const batchGroups = useMemo(() => {
    const map = new Map<
      string,
      { payrollBatchId: string; rows: PayrollRunResult[] }
    >();
    for (const r of results) {
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
        fromDate: g.rows[0].payPeriodStart,
        toDate: g.rows[0].payPeriodEnd,
        payDate: g.rows[0].payDate,
        remarks: g.rows[0].remarks,
      }))
      .sort((a, b) => b.payrollBatchId.localeCompare(a.payrollBatchId));
  }, [results]);

  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const { mutateAsync: postPayrollBatch, isPending: isPostingBatch } =
    usePostPayrollBatch();
  const { mutateAsync: deletePayrollBatch, isPending: isDeletingBatch } =
    useDeletePayrollBatch();

  const handlePostBatch = async (payrollBatchId: string, count: number) => {
    try {
      await postPayrollBatch(payrollBatchId);
      message.success(
        `Posted the full payroll run — ${count} record${count !== 1 ? "s" : ""} locked in as final.`,
      );
    } catch {
      message.error("Failed to post this payroll run. Please try again.");
    }
  };

  const handleDeleteBatch = async (payrollBatchId: string, count: number) => {
    try {
      await deletePayrollBatch(payrollBatchId);
      message.success(
        `Deleted the full payroll run — ${count} record${count !== 1 ? "s" : ""} removed. You can regenerate it now.`,
      );
    } catch {
      message.error("Failed to delete this payroll run. Please try again.");
    }
  };

  const handlePrintPayslip = async (record: PayrollRunResult) => {
    if (!record.id) {
      message.error("This payroll record has no printable payslip yet.");
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

  const handlePrintSummary = async () => {
    if (!results.length) {
      message.info("No data to print. Adjust the date range first.");
      return;
    }
    const printTab = window.open("about:blank", "_blank");
    try {
      const blob = await httpClient.get<Blob>(
        `${buildApiUrl(API_PREFIX.hrms, "payrolls")}/print-summary`,
        {
          params: { from: dateRange[0], to: dateRange[1] },
          responseType: "blob",
        },
      );
      const url = URL.createObjectURL(blob);
      if (printTab) printTab.location.href = url;
    } catch {
      printTab?.close();
      message.error("Failed to generate the report. Please try again.");
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────

  const EXPORT_HEADERS = [
    "Employee",
    "Period Start",
    "Period End",
    "Salary Type",
    "Daily Rate",
    "Basic",
    "OT Pay",
    "OT Premium",
    "ND Pay",
    "ND Premium",
    "ND-OT Pay",
    "Rest Day",
    "Paid Leave",
    "Legal Holiday (Unworked)",
    "Legal Holiday Duty (Worked)",
    "Rest Day + Legal Holiday",
    "Special Holiday",
    "Rest Day + Special Holiday",
    "Double Legal Holiday",
    "Rest Day + Double Legal Holiday",
    "Holiday Total",
    "COLA",
    "Allowances",
    "Bonuses",
    "Commissions",
    "De Minimis",
    "Other Income",
    "Reimbursement",
    "Gross Income",
    "SSS",
    "PhilHealth",
    "Pag-IBIG",
    "W-Tax",
    "Loans",
    "Other Deductions",
    "Late",
    "Under Time",
    "Absent",
    "Total Deductions",
    "Net Pay",
    "ER SSS",
    "ER PhilHealth",
    "ER Pag-IBIG",
    "EC",
  ];

  const buildExportRows = () =>
    results.map((r) => [
      r.fullName,
      r.payPeriodStart ? dayjs(r.payPeriodStart).format("YYYY-MM-DD") : "",
      r.payPeriodEnd ? dayjs(r.payPeriodEnd).format("YYYY-MM-DD") : "",
      r.salaryType,
      fmt(r.dailyRate),
      fmt(r.basicPay),
      fmt(r.overtimePay),
      fmt(r.otPremiumPay ?? 0),
      fmt(r.nightDifferentialPay),
      fmt(r.ndPremiumPay ?? 0),
      fmt(r.nightDifferentialOTPay),
      fmt(restDayTotal(r)),
      r.salaryType === "FIXED"
        ? fmt(r.nonCompanyPaidLeaves ?? 0)
        : fmt(r.paidLeaves ?? 0),
      fmt(r.legalHolidayUnworkedPay ?? 0),
      fmt(holidayDuty(r)),
      fmt(restLegalTotal(r)),
      fmt(specialTotal(r)),
      fmt(restSpecialTotal(r)),
      fmt(doubleLegalTotal(r)),
      fmt(restDoubleLegalTotal(r)),
      fmt(r.holidayPay),
      fmt(r.cola),
      fmt(r.totalRegularAllowances),
      fmt(r.totalBonuses),
      fmt(r.totalCommissions),
      fmt(r.totalDeminimises),
      fmt(r.totalOtherIncome),
      fmt(r.reimbursement),
      fmt(r.grossIncome),
      fmt(r.sssContribution),
      fmt(r.philHealthContribution),
      fmt(r.pagIbigContribution),
      fmt(r.withholdingTax),
      fmt(r.totalLoans),
      fmt(r.otherDeductions - r.totalLoans),
      fmt(r.lateAmount),
      fmt(r.underTimeAmount),
      fmt(r.absences),
      fmt(r.totalDeductions),
      fmt(r.netPay),
      fmt(r.employerSSSContribution),
      fmt(r.employerPhilHealthContribution),
      fmt(r.employerPagIbigContribution),
      fmt(r.employerECContribution),
    ]);

  const handleExport = (format: "csv" | "excel") => {
    if (!results.length) {
      message.info("No data to export. Adjust the date range first.");
      return;
    }
    const rows = buildExportRows();
    const suffix = `${dateRange[0]}_${dateRange[1]}`;
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(EXPORT_HEADERS, rows),
        `payroll-summary-${suffix}.csv`,
        "text/plain",
      );
    } else {
      triggerDownload(
        buildFlatExcel(EXPORT_HEADERS, rows),
        `payroll-summary-${suffix}.xls`,
        "application/vnd.ms-excel;charset=utf-8;",
      );
    }
  };

  const exportMenuItems: MenuProps["items"] = [
    { key: "csv", label: "Export as CSV", onClick: () => handleExport("csv") },
    {
      key: "excel",
      label: "Export as Excel",
      onClick: () => handleExport("excel"),
    },
  ];

  const totals = useMemo(
    () => ({
      gross: results.reduce((s, r) => s + r.grossIncome, 0),
      net: results.reduce((s, r) => s + r.netPay, 0),
      sss: results.reduce((s, r) => s + r.sssContribution, 0),
      phic: results.reduce((s, r) => s + r.philHealthContribution, 0),
      hdmf: results.reduce((s, r) => s + r.pagIbigContribution, 0),
      tax: results.reduce((s, r) => s + r.withholdingTax, 0),
      ot: results.reduce((s, r) => s + r.overtimePay, 0),
      nd: results.reduce((s, r) => s + r.nightDifferentialPay, 0),
      regHours: results.reduce((s, r) => s + r.regularNetHours, 0),
    }),
    [results],
  );

  const statusColumn: ColumnsType<PayrollRunResult>[number] = {
    title: "Status",
    key: "status",
    width: 90,
    render: (_, r) =>
      r.id ? (
        <Tag color={r.isPosted ? "success" : "default"}>
          {r.isPosted ? "Posted" : "Draft"}
        </Tag>
      ) : null,
  };

  // Print is the only per-row action left — Post/Delete are run-level transactions handled
  // via the "Post / Delete Payroll Run" toolbar button and its batch modal below.
  const actionsColumn: ColumnsType<PayrollRunResult>[number] = {
    title: "",
    key: "actions",
    width: 48,
    fixed: "right",
    render: (_, r) => (
      <Tooltip
        title={r.id ? "Print payslip" : "Not yet available for this record"}
      >
        <Button
          type="text"
          size="small"
          icon={<PrinterOutlined />}
          disabled={!r.id}
          onClick={() => handlePrintPayslip(r)}
        />
      </Tooltip>
    ),
  };

  const earningsColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
    },
    statusColumn,
    {
      title: "Salary Type",
      dataIndex: "salaryType",
      key: "salaryType",
      render: (v: string) => (v === "FIXED" ? "Fixed" : "Variable"),
    },
    {
      title: "Daily Rate",
      dataIndex: "dailyRate",
      key: "dailyRate",
      align: "right",
      render: fmt,
    },
    {
      title: "Period Start",
      dataIndex: "payPeriodStart",
      key: "from",
      render: (v: string) => (v ? dayjs(v).format("MMM DD") : "—"),
    },
    {
      title: "Period End",
      dataIndex: "payPeriodEnd",
      key: "to",
      render: (v: string) => (v ? dayjs(v).format("MMM DD, YYYY") : "—"),
    },
    {
      title: "Basic",
      dataIndex: "basicPay",
      key: "basic",
      align: "right",
      render: fmt,
    },
    {
      title: "OT Pay",
      dataIndex: "overtimePay",
      key: "ot",
      align: "right",
      render: fmt,
    },
    {
      title: "ND Pay",
      dataIndex: "nightDifferentialPay",
      key: "nd",
      align: "right",
      render: fmt,
    },
    {
      title: "Rest Day",
      key: "restDay",
      align: "right",
      render: (_, r) => fmt(restDayTotal(r)),
    },
    {
      title: "Paid Leave",
      key: "paidLeaves",
      align: "right",
      // FIXED's Basic Pay already embeds Company-funded paid leave (see
      // PayrollProcessorService.ComputeAllowances), so only the Government/Shared/Other
      // slice is still a real addition to Gross for FIXED — the full amount only applies
      // to VARIABLE, whose Basic Pay never includes leave-day pay.
      render: (_, r) =>
        r.salaryType === "FIXED"
          ? r.nonCompanyPaidLeaves
            ? fmt(r.nonCompanyPaidLeaves)
            : "—"
          : fmt(r.paidLeaves ?? 0),
    },
    {
      title: "Holiday Total",
      dataIndex: "holidayPay",
      key: "hol",
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
      title: "Allowances",
      dataIndex: "totalRegularAllowances",
      key: "allow",
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
      key: "other",
      align: "right",
      render: fmt,
    },
    {
      title: "Reimbursement",
      dataIndex: "reimbursement",
      key: "reimb",
      align: "right",
      render: fmt,
    },
    {
      title: "Gross",
      dataIndex: "grossIncome",
      key: "gross",
      align: "right",
      fixed: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
    actionsColumn,
  ];

  const holidayColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
    },
    {
      title: "Legal Holiday (Unworked)",
      key: "legalUnworked",
      align: "right",
      render: (_, r) => fmt(r.legalHolidayUnworkedPay ?? 0),
    },
    {
      title: "Legal Holiday Duty (Worked)",
      key: "holidayDuty",
      align: "right",
      render: (_, r) => fmt(holidayDuty(r)),
    },
    {
      title: "Rest Day + Legal Holiday",
      key: "restLegal",
      align: "right",
      render: (_, r) => fmt(restLegalTotal(r)),
    },
    {
      title: "Special Holiday",
      key: "special",
      align: "right",
      render: (_, r) => fmt(specialTotal(r)),
    },
    {
      title: "Rest Day + Special Holiday",
      key: "restSpecial",
      align: "right",
      render: (_, r) => fmt(restSpecialTotal(r)),
    },
    {
      title: "Double Legal Holiday",
      key: "doubleLegal",
      align: "right",
      render: (_, r) => fmt(doubleLegalTotal(r)),
    },
    {
      title: "Rest Day + Double Legal Holiday",
      key: "restDoubleLegal",
      align: "right",
      render: (_, r) => fmt(restDoubleLegalTotal(r)),
    },
    {
      title: "Holiday Total",
      dataIndex: "holidayPay",
      key: "hol",
      align: "right",
      fixed: "right",
      render: (v: number) => <Text strong>{fmt(v)}</Text>,
    },
  ];

  const deductionsColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
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
      title: "Loans",
      dataIndex: "totalLoans",
      key: "loans",
      align: "right",
      render: fmt,
    },
    {
      title: "Other Deductions",
      key: "otherDed",
      align: "right",
      render: (_, r) => fmt(r.otherDeductions - r.totalLoans),
    },
    {
      title: "Late/UT",
      key: "late",
      align: "right",
      render: (_, r) => fmt(r.lateAmount + r.underTimeAmount),
    },
    {
      title: "Absent",
      dataIndex: "absences",
      key: "abs",
      align: "right",
      render: fmt,
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "net",
      align: "right",
      fixed: "right",
      render: (v: number) => (
        <Text strong style={{ color: token.colorPrimary }}>
          {fmt(v)}
        </Text>
      ),
    },
  ];

  const hoursColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
    },
    {
      title: "Regular",
      dataIndex: "regularNetHours",
      key: "reg",
      align: "right",
      render: fmtH,
    },
    {
      title: "Reg OT",
      dataIndex: "regularOTHours",
      key: "regot",
      align: "right",
      render: fmtH,
    },
    {
      title: "Reg ND",
      dataIndex: "regularNDHours",
      key: "regnd",
      align: "right",
      render: fmtH,
    },
    {
      title: "Reg ND-OT",
      dataIndex: "regularNDOTHours",
      key: "regndot",
      align: "right",
      render: fmtH,
    },
    {
      title: "Rest Day",
      dataIndex: "restDayHours",
      key: "rd",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD OT",
      dataIndex: "restDayOTHours",
      key: "rdot",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD ND",
      dataIndex: "restDayNDHours",
      key: "rdnd",
      align: "right",
      render: fmtH,
    },
    {
      title: "Legal Hol",
      dataIndex: "legalHolHours",
      key: "lh",
      align: "right",
      render: fmtH,
    },
    {
      title: "Legal OT",
      dataIndex: "legalHolOTHours",
      key: "lhot",
      align: "right",
      render: fmtH,
    },
    {
      title: "Legal ND",
      dataIndex: "legalHolNightDiffHours",
      key: "lhnd",
      align: "right",
      render: fmtH,
    },
    {
      title: "Special Hol",
      dataIndex: "specialHolHours",
      key: "sh",
      align: "right",
      render: fmtH,
    },
    {
      title: "Special OT",
      dataIndex: "specialHolOTHours",
      key: "shot",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Legal",
      dataIndex: "restLegalDayHours",
      key: "rdlh",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Legal OT",
      dataIndex: "restLegalDayOTHours",
      key: "rdlhot",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Special",
      dataIndex: "restSpecialDayHours",
      key: "rdsh",
      align: "right",
      render: fmtH,
    },
    {
      title: "RD+Special OT",
      dataIndex: "restSpecialDayOTHours",
      key: "rdshot",
      align: "right",
      render: fmtH,
    },
    {
      title: "OT Total Hr",
      dataIndex: "overtimeHour",
      key: "ottotal",
      align: "right",
      fixed: "right",
      render: fmtH,
    },
  ];

  const erColumns: ColumnsType<PayrollRunResult> = [
    { title: "Employee", dataIndex: "fullName", key: "name", width: 160 },
    {
      title: "ER SSS",
      dataIndex: "employerSSSContribution",
      key: "ersss",
      align: "right",
      render: fmt,
    },
    {
      title: "ER PhilHealth",
      dataIndex: "employerPhilHealthContribution",
      key: "erphic",
      align: "right",
      render: fmt,
    },
    {
      title: "ER Pag-IBIG",
      dataIndex: "employerPagIbigContribution",
      key: "erhdmf",
      align: "right",
      render: fmt,
    },
    {
      title: "EC",
      dataIndex: "employerECContribution",
      key: "ec",
      align: "right",
      render: fmt,
    },
    {
      title: "Total ER Cost",
      key: "ertotal",
      align: "right",
      render: (_, r) =>
        fmt(
          r.employerSSSContribution +
            r.employerPhilHealthContribution +
            r.employerPagIbigContribution +
            r.employerECContribution,
        ),
    },
  ];

  const tableProps = {
    rowKey: "employeeId",
    loading: isLoading,
    size: "small" as const,
    scroll: { x: "max-content" as const },
    pagination: { pageSize: 50, showSizeChanger: false },
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Payroll Summary
            </Title>
            <p className="page-toolbar-subtitle">
              View generated payroll records with full earnings, deductions, and
              hour breakdown.
            </p>
          </div>
          <Space wrap>
            <MobileRangePicker
              value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
              onChange={(dates) => {
                if (dates)
                  setDateRange([
                    dates[0]?.format("YYYY-MM-DD") ?? "",
                    dates[1]?.format("YYYY-MM-DD") ?? "",
                  ]);
              }}
            />
            <Button
              icon={<ReloadOutlined spin={isFetching} />}
              onClick={() => refetch()}
              loading={isFetching && !isLoading}
            />
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!results.length}
            >
              <Button icon={<DownloadOutlined />} disabled={!results.length}>
                Export
              </Button>
            </Dropdown>
            <Button
              icon={<PrinterOutlined />}
              disabled={!results.length}
              onClick={handlePrintSummary}
            >
              Print
            </Button>
            <Button
              icon={<CheckCircleOutlined />}
              disabled={!batchGroups.length}
              onClick={() => setBatchModalOpen(true)}
            >
              Post / Delete Payroll Run
            </Button>
          </Space>
        </div>
      </div>

      {results.length > 0 && (
        <Row gutter={16} className="mb-4">
          <Col>
            <Card size="small">
              <Statistic
                title="Employees"
                value={results.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total Gross"
                value={totals.gross}
                precision={2}
                prefix="₱"
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total Net Pay"
                value={totals.net}
                precision={2}
                prefix="₱"
                valueStyle={{ color: token.colorPrimary }}
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Total OT Pay"
                value={totals.ot}
                precision={2}
                prefix="₱"
              />
            </Card>
          </Col>
          <Col>
            <Card size="small">
              <Statistic
                title="Regular Hours"
                value={totals.regHours}
                precision={2}
                suffix="h"
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Tabs
          items={[
            {
              key: "earnings",
              label: "Earnings",
              children: (
                <Table
                  dataSource={results}
                  columns={earningsColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "holidays",
              label: "Holiday Breakdown",
              children: (
                <Table
                  dataSource={results}
                  columns={holidayColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "deductions",
              label: "Deductions & Net",
              children: (
                <Table
                  dataSource={results}
                  columns={deductionsColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "hours",
              label: "Hours Breakdown",
              children: (
                <Table
                  dataSource={results}
                  columns={hoursColumns}
                  {...tableProps}
                />
              ),
            },
            {
              key: "er",
              label: "Employer Contributions",
              children: (
                <Table
                  dataSource={results}
                  columns={erColumns}
                  {...tableProps}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="Payroll Run"
        open={batchModalOpen}
        onCancel={() => setBatchModalOpen(false)}
        footer={null}
        width={800}
      >
        <p className="mb-4">
          Each row below is one Generate run for the selected date range. Post
          locks a run in as final; Delete removes every employee&apos;s payroll
          in it along with its SSS/PhilHealth/Pag-IBIG/W-Tax contribution
          records, so you can regenerate it from the same DTR batch(es). Both
          act on the whole run, not one employee at a time.
        </p>
        <Table
          rowKey="payrollBatchId"
          size="small"
          dataSource={batchGroups}
          pagination={false}
          scroll={{ x: "max-content" }}
          columns={[
            {
              title: "Period",
              key: "period",
              render: (_, g) =>
                `${dayjs(g.fromDate).format("MMM DD")} – ${dayjs(g.toDate).format("MMM DD, YYYY")}`,
            },
            {
              title: "Payout Date",
              key: "payDate",
              render: (_, g) =>
                g.payDate ? dayjs(g.payDate).format("MMM DD, YYYY") : "—",
            },
            {
              title: "Employees",
              dataIndex: "count",
              key: "count",
              align: "right",
            },
            {
              title: "Remarks",
              key: "remarks",
              width: 200,
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
                <Tag
                  color={
                    g.allPosted
                      ? "success"
                      : g.hasPosted
                        ? "warning"
                        : "default"
                  }
                >
                  {g.allPosted
                    ? "Posted"
                    : g.hasPosted
                      ? "Partially Posted"
                      : "Draft"}
                </Tag>
              ),
            },
            {
              title: "",
              key: "actions",
              render: (_, g) => (
                <Space size={4}>
                  <Popconfirm
                    title="Post this entire payroll run?"
                    description={`Locks all ${g.count} record${g.count !== 1 ? "s" : ""} in this run as final.`}
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
                    title="Delete this entire payroll run?"
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
      </Modal>
    </div>
  );
}

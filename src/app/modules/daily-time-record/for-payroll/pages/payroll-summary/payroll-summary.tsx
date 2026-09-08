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
  downloadMultiSheetExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";

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
  const defaultCutoff = getSemiMonthlyCutoff();
  const [dateRange, setDateRange] = useState<[string, string]>([
    defaultCutoff.fromDate,
    defaultCutoff.toDate,
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
    "1x Payout (Company)",
    "1x Payout (Government)",
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
    "Total ER Cost",
    "Regular Hrs",
    "Reg OT Hrs",
    "Reg ND Hrs",
    "Reg ND-OT Hrs",
    "Rest Day Hrs",
    "RD OT Hrs",
    "RD ND Hrs",
    "RD ND-OT Hrs",
    "Legal Hol Hrs",
    "Legal OT Hrs",
    "Legal ND Hrs",
    "Legal ND-OT Hrs",
    "Special Hol Hrs",
    "Special OT Hrs",
    "Special ND Hrs",
    "Special ND-OT Hrs",
    "RD+Legal Hrs",
    "RD+Legal OT Hrs",
    "RD+Legal ND Hrs",
    "RD+Legal ND-OT Hrs",
    "RD+Special Hrs",
    "RD+Special OT Hrs",
    "RD+Special ND Hrs",
    "RD+Special ND-OT Hrs",
    "Double Legal Hrs",
    "Double Legal OT Hrs",
    "Double Legal ND Hrs",
    "Double Legal ND-OT Hrs",
    "RD+Double Legal Hrs",
    "RD+Double Legal OT Hrs",
    "RD+Double Legal ND Hrs",
    "RD+Double Legal ND-OT Hrs",
    "OB Hrs",
    "Paid Leave Hrs",
    "Unpaid Leave Hrs",
    "OT Total Hrs",
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
      fmt(r.companyFundedLeavePay ?? 0),
      fmt(r.governmentFundedLeavePay ?? 0),
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
      fmt(
        r.employerSSSContribution +
          r.employerPhilHealthContribution +
          r.employerPagIbigContribution +
          r.employerECContribution,
      ),
      fmt(r.regularNetHours ?? 0),
      fmt(r.regularOTHours ?? 0),
      fmt(r.regularNDHours ?? 0),
      fmt(r.regularNDOTHours ?? 0),
      fmt(r.restDayHours ?? 0),
      fmt(r.restDayOTHours ?? 0),
      fmt(r.restDayNDHours ?? 0),
      fmt(r.restDayNDOTHours ?? 0),
      fmt(r.legalHolHours ?? 0),
      fmt(r.legalHolOTHours ?? 0),
      fmt(r.legalHolNightDiffHours ?? 0),
      fmt(r.legalHolNightDiffOTHours ?? 0),
      fmt(r.specialHolHours ?? 0),
      fmt(r.specialHolOTHours ?? 0),
      fmt(r.specialHolNightDiffHours ?? 0),
      fmt(r.specialHolNightDiffOTHours ?? 0),
      fmt(r.restLegalDayHours ?? 0),
      fmt(r.restLegalDayOTHours ?? 0),
      fmt(r.restLegalDayNDHours ?? 0),
      fmt(r.restLegalDayNDOTHours ?? 0),
      fmt(r.restSpecialDayHours ?? 0),
      fmt(r.restSpecialDayOTHours ?? 0),
      fmt(r.restSpecialDayNDHours ?? 0),
      fmt(r.restSpecialDayNDOTHours ?? 0),
      fmt(r.doubleLegalHours ?? 0),
      fmt(r.doubleLegalOTHours ?? 0),
      fmt(r.doubleLegalNDHours ?? 0),
      fmt(r.doubleLegalNDOTHours ?? 0),
      fmt(r.restDoubleLegalHours ?? 0),
      fmt(r.restDoubleLegalOTHours ?? 0),
      fmt(r.restDoubleLegalNDHours ?? 0),
      fmt(r.restDoubleLegalNDOTHours ?? 0),
      fmt(r.obHours ?? 0),
      fmt(r.paidLeaveHours ?? 0),
      fmt(r.unpaidLeaveHours ?? 0),
      fmt(r.overtimeHours ?? 0),
    ]);

  // Per-tab sheet definitions for the Excel export — headers/rows mirror each tab's own
  // columns exactly (earningsColumns/holidayColumns/deductionsColumns/hoursColumns/
  // erColumns above), so "1 tab here, 1 sheet in Excel."
  const EARNINGS_HEADERS = [
    "Employee",
    "Status",
    "Salary Type",
    "Daily Rate",
    "Period Start",
    "Period End",
    "Basic",
    "OT Pay",
    "ND Pay",
    "Rest Day",
    "Paid Leave",
    "1x Payout (Co)",
    "1x Payout (Gov)",
    "Holiday Total",
    "COLA",
    "Allowances",
    "Bonuses",
    "Commissions",
    "De Minimis",
    "Other Income",
    "Reimbursement",
    "Gross",
  ];
  const buildEarningsRows = () =>
    results.map((r) => [
      r.fullName,
      r.id ? (r.isPosted ? "Posted" : "Draft") : "",
      r.salaryType === "FIXED" ? "Fixed" : "Variable",
      fmt(r.dailyRate),
      r.payPeriodStart ? dayjs(r.payPeriodStart).format("YYYY-MM-DD") : "",
      r.payPeriodEnd ? dayjs(r.payPeriodEnd).format("YYYY-MM-DD") : "",
      fmt(r.basicPay),
      fmt(r.overtimePay),
      fmt(r.nightDifferentialPay),
      fmt(restDayTotal(r)),
      r.salaryType === "FIXED"
        ? fmt(r.nonCompanyPaidLeaves ?? 0)
        : fmt(r.paidLeaves ?? 0),
      fmt(r.companyFundedLeavePay ?? 0),
      fmt(r.governmentFundedLeavePay ?? 0),
      fmt(r.holidayPay),
      fmt(r.cola),
      fmt(r.totalRegularAllowances),
      fmt(r.totalBonuses),
      fmt(r.totalCommissions),
      fmt(r.totalDeminimises),
      fmt(r.totalOtherIncome),
      fmt(r.reimbursement),
      fmt(r.grossIncome),
    ]);

  const HOLIDAY_HEADERS = [
    "Employee",
    "Legal Holiday (Unworked)",
    "Legal Holiday Duty (Worked)",
    "Rest Day + Legal Holiday",
    "Special Holiday",
    "Rest Day + Special Holiday",
    "Double Legal Holiday",
    "Rest Day + Double Legal Holiday",
    "Holiday Total",
  ];
  const buildHolidayRows = () =>
    results.map((r) => [
      r.fullName,
      fmt(r.legalHolidayUnworkedPay ?? 0),
      fmt(holidayDuty(r)),
      fmt(restLegalTotal(r)),
      fmt(specialTotal(r)),
      fmt(restSpecialTotal(r)),
      fmt(doubleLegalTotal(r)),
      fmt(restDoubleLegalTotal(r)),
      fmt(r.holidayPay),
    ]);

  const DEDUCTIONS_HEADERS = [
    "Employee",
    "SSS",
    "PhilHealth",
    "Pag-IBIG",
    "W-Tax",
    "Loans",
    "Other Deductions",
    "Late/UT",
    "Absent",
    "Net Pay",
  ];
  const buildDeductionsRows = () =>
    results.map((r) => [
      r.fullName,
      fmt(r.sssContribution),
      fmt(r.philHealthContribution),
      fmt(r.pagIbigContribution),
      fmt(r.withholdingTax),
      fmt(r.totalLoans),
      fmt(r.otherDeductions - r.totalLoans),
      fmt(r.lateAmount + r.underTimeAmount),
      fmt(r.absences),
      fmt(r.netPay),
    ]);

  const ER_HEADERS = [
    "Employee",
    "ER SSS",
    "ER PhilHealth",
    "ER Pag-IBIG",
    "EC",
    "Total ER Cost",
  ];
  const buildErRows = () =>
    results.map((r) => [
      r.fullName,
      fmt(r.employerSSSContribution),
      fmt(r.employerPhilHealthContribution),
      fmt(r.employerPagIbigContribution),
      fmt(r.employerECContribution),
      fmt(
        r.employerSSSContribution +
          r.employerPhilHealthContribution +
          r.employerPagIbigContribution +
          r.employerECContribution,
      ),
    ]);

  const HOURS_HEADERS = [
    "Employee",
    "Regular",
    "Reg OT",
    "Reg ND",
    "Reg ND-OT",
    "Rest Day",
    "RD OT",
    "RD ND",
    "RD ND-OT",
    "Legal Hol",
    "Legal OT",
    "Legal ND",
    "Legal ND-OT",
    "Special Hol",
    "Special OT",
    "Special ND",
    "Special ND-OT",
    "RD+Legal",
    "RD+Legal OT",
    "RD+Legal ND",
    "RD+Legal ND-OT",
    "RD+Special",
    "RD+Special OT",
    "RD+Special ND",
    "RD+Special ND-OT",
    "Double Legal",
    "Double Legal OT",
    "Double Legal ND",
    "Double Legal ND-OT",
    "RD+Double Legal",
    "RD+Double Legal OT",
    "RD+Double Legal ND",
    "RD+Double Legal ND-OT",
    "OB Hrs",
    "Paid Leave Hrs",
    "Unpaid Leave Hrs",
    "OT Total Hr",
  ];
  const buildHoursRows = () =>
    results.map((r) => [
      r.fullName,
      fmt(r.regularNetHours ?? 0),
      fmt(r.regularOTHours ?? 0),
      fmt(r.regularNDHours ?? 0),
      fmt(r.regularNDOTHours ?? 0),
      fmt(r.restDayHours ?? 0),
      fmt(r.restDayOTHours ?? 0),
      fmt(r.restDayNDHours ?? 0),
      fmt(r.restDayNDOTHours ?? 0),
      fmt(r.legalHolHours ?? 0),
      fmt(r.legalHolOTHours ?? 0),
      fmt(r.legalHolNightDiffHours ?? 0),
      fmt(r.legalHolNightDiffOTHours ?? 0),
      fmt(r.specialHolHours ?? 0),
      fmt(r.specialHolOTHours ?? 0),
      fmt(r.specialHolNightDiffHours ?? 0),
      fmt(r.specialHolNightDiffOTHours ?? 0),
      fmt(r.restLegalDayHours ?? 0),
      fmt(r.restLegalDayOTHours ?? 0),
      fmt(r.restLegalDayNDHours ?? 0),
      fmt(r.restLegalDayNDOTHours ?? 0),
      fmt(r.restSpecialDayHours ?? 0),
      fmt(r.restSpecialDayOTHours ?? 0),
      fmt(r.restSpecialDayNDHours ?? 0),
      fmt(r.restSpecialDayNDOTHours ?? 0),
      fmt(r.doubleLegalHours ?? 0),
      fmt(r.doubleLegalOTHours ?? 0),
      fmt(r.doubleLegalNDHours ?? 0),
      fmt(r.doubleLegalNDOTHours ?? 0),
      fmt(r.restDoubleLegalHours ?? 0),
      fmt(r.restDoubleLegalOTHours ?? 0),
      fmt(r.restDoubleLegalNDHours ?? 0),
      fmt(r.restDoubleLegalNDOTHours ?? 0),
      fmt(r.obHours ?? 0),
      fmt(r.paidLeaveHours ?? 0),
      fmt(r.unpaidLeaveHours ?? 0),
      fmt(r.overtimeHours ?? 0),
    ]);

  const handleExport = (format: "csv" | "excel") => {
    if (!results.length) {
      message.info("No data to export. Adjust the date range first.");
      return;
    }
    const suffix = `${dateRange[0]}_${dateRange[1]}`;
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(EXPORT_HEADERS, buildExportRows()),
        `payroll-summary-${suffix}.csv`,
      );
    } else {
      // One worksheet per tab, matching what's on screen exactly.
      downloadMultiSheetExcel(
        [
          {
            name: "Earnings",
            headers: EARNINGS_HEADERS,
            rows: buildEarningsRows(),
          },
          {
            name: "Holiday Breakdown",
            headers: HOLIDAY_HEADERS,
            rows: buildHolidayRows(),
          },
          {
            name: "Deductions & Net",
            headers: DEDUCTIONS_HEADERS,
            rows: buildDeductionsRows(),
          },
          {
            name: "Employer Contributions",
            headers: ER_HEADERS,
            rows: buildErRows(),
          },
          {
            name: "Hours Breakdown",
            headers: HOURS_HEADERS,
            rows: buildHoursRows(),
          },
        ],
        `payroll-summary-${suffix}.xlsx`,
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
      regHours: results.reduce((s, r) => s + (r.regularNetHours ?? 0), 0),
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
      // FIXED's Basic Pay already covers every day incl. Company-funded paid leave (see
      // PayrollProcessorService.ComputeAllowances), so showing the full amount again would
      // double it up — FIXED shows only the informational Government/Shared/Other slice
      // instead (does not add to Gross). VARIABLE's Basic Pay never includes leave-day pay,
      // so the full amount is shown and does add to Gross.
      render: (_, r) => {
        const value =
          r.salaryType === "FIXED"
            ? r.nonCompanyPaidLeaves
              ? fmt(r.nonCompanyPaidLeaves)
              : "—"
            : fmt(r.paidLeaves ?? 0);
        return r.paidLeaveBreakdown ? (
          <Tooltip title={r.paidLeaveBreakdown}>{value}</Tooltip>
        ) : (
          value
        );
      },
    },
    {
      title: "1x Payout (Co)",
      key: "oneTimeCompany",
      align: "right",
      render: (_, r) =>
        r.companyFundedLeavePay ? (
          <Tooltip title={r.oneTimePayoutBreakdown}>
            {fmt(r.companyFundedLeavePay)}
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      title: "1x Payout (Gov)",
      key: "oneTimeGov",
      align: "right",
      render: (_, r) =>
        r.governmentFundedLeavePay ? (
          <Tooltip title={r.oneTimePayoutBreakdown}>
            {fmt(r.governmentFundedLeavePay)}
          </Tooltip>
        ) : (
          "—"
        ),
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

  // Full Hrs/OT/ND/ND-OT breakdown per pay category, mirroring the DTR Detail table's
  // grouping exactly (dtr-detail-table.tsx) so Payroll Summary has the same granularity
  // once DTR rows are rolled up into a run — see backend ComputeHoursBreakdown.
  const hourCol = (
    title: string,
    dataIndex: keyof PayrollRunResult,
    key: string,
  ): ColumnsType<PayrollRunResult>[number] => ({
    title,
    dataIndex,
    key,
    align: "right",
    render: fmtH,
  });

  const hoursColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "Employee",
      dataIndex: "fullName",
      key: "name",
      width: 160,
      fixed: "left",
    },
    hourCol("Regular", "regularNetHours", "reg"),
    hourCol("Reg OT", "regularOTHours", "regot"),
    hourCol("Reg ND", "regularNDHours", "regnd"),
    hourCol("Reg ND-OT", "regularNDOTHours", "regndot"),
    hourCol("Rest Day", "restDayHours", "rd"),
    hourCol("RD OT", "restDayOTHours", "rdot"),
    hourCol("RD ND", "restDayNDHours", "rdnd"),
    hourCol("RD ND-OT", "restDayNDOTHours", "rdndot"),
    hourCol("Legal Hol", "legalHolHours", "lh"),
    hourCol("Legal OT", "legalHolOTHours", "lhot"),
    hourCol("Legal ND", "legalHolNightDiffHours", "lhnd"),
    hourCol("Legal ND-OT", "legalHolNightDiffOTHours", "lhndot"),
    hourCol("Special Hol", "specialHolHours", "sh"),
    hourCol("Special OT", "specialHolOTHours", "shot"),
    hourCol("Special ND", "specialHolNightDiffHours", "shnd"),
    hourCol("Special ND-OT", "specialHolNightDiffOTHours", "shndot"),
    hourCol("RD+Legal", "restLegalDayHours", "rdlh"),
    hourCol("RD+Legal OT", "restLegalDayOTHours", "rdlhot"),
    hourCol("RD+Legal ND", "restLegalDayNDHours", "rdlhnd"),
    hourCol("RD+Legal ND-OT", "restLegalDayNDOTHours", "rdlhndot"),
    hourCol("RD+Special", "restSpecialDayHours", "rdsh"),
    hourCol("RD+Special OT", "restSpecialDayOTHours", "rdshot"),
    hourCol("RD+Special ND", "restSpecialDayNDHours", "rdshnd"),
    hourCol("RD+Special ND-OT", "restSpecialDayNDOTHours", "rdshndot"),
    hourCol("Double Legal", "doubleLegalHours", "dl"),
    hourCol("Double Legal OT", "doubleLegalOTHours", "dlot"),
    hourCol("Double Legal ND", "doubleLegalNDHours", "dlnd"),
    hourCol("Double Legal ND-OT", "doubleLegalNDOTHours", "dlndot"),
    hourCol("RD+Double Legal", "restDoubleLegalHours", "rdl"),
    hourCol("RD+Double Legal OT", "restDoubleLegalOTHours", "rdlot"),
    hourCol("RD+Double Legal ND", "restDoubleLegalNDHours", "rdlnd"),
    hourCol("RD+Double Legal ND-OT", "restDoubleLegalNDOTHours", "rdlndot"),
    hourCol("OB Hrs", "obHours", "ob"),
    hourCol("Paid Leave Hrs", "paidLeaveHours", "pl"),
    hourCol("Unpaid Leave Hrs", "unpaidLeaveHours", "upl"),
    {
      title: "OT Total Hr",
      dataIndex: "overtimeHours",
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

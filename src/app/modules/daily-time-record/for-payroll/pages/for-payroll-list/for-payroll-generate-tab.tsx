import { useMemo, useState, type ReactNode } from "react";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Modal,
  Select,
  Space,
  Statistic,
  Switch,
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
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useCalculatePayroll,
  useGeneratePayroll,
  usePayrollReadiness,
} from "../../hooks/use-for-payroll-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import type {
  PayrollNotReadyEmployee,
  PayrollRunResult,
} from "../../models/api/response/payroll-run-result.model";
import {
  otPay,
  ndPay,
  ndotDisplayPay,
  basicPay,
  holidayPay,
} from "../../utils/ot-nd-pay.util";
import PayrollRunPostModal from "../../components/payroll-run-post-modal";
import TimeHourPayResultsModal from "../../components/time-hour-pay-results-modal";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";
import { deductionReasonText } from "../../constants/label.const";
import PayrollReadinessOverview from "../../components/payroll-readiness-overview";
import PayrollReadinessTable from "../../components/payroll-readiness-table";
import {
  buildReadinessRows,
  isPayable,
} from "../../utils/payroll-readiness.util";
import { formatMoney } from "@/shared/utils/money.util";
import { apiErrorMessage } from "@/core/http/api-error";

const { Text } = Typography;

// Hidden for now -- flip back to true to show the Pay/Release Date picker again.
const SHOW_PAY_RELEASE_DATE = false;

// Matches on the group's code or its description.
const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean; fullLabel?: string },
) => {
  const q = input.toLowerCase();
  return (
    String(option?.label ?? "")
      .toLowerCase()
      .includes(q) ||
    String(option?.fullLabel ?? "")
      .toLowerCase()
      .includes(q)
  );
};

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

// Red asterisk in front of a required filter.
const RequiredField = ({ children }: { children: ReactNode }) => {
  const { token } = theme.useToken();
  return (
    <span className="inline-flex items-center gap-1">
      <span style={{ color: token.colorError }}>*</span>
      {children}
    </span>
  );
};

export default function ForPayrollGenerateTab() {
  const { token } = theme.useToken();
  // Starts on the current semi-monthly cutoff so the readiness overview shows right away.
  const [dateRange, setDateRange] = useState<[string, string] | null>(() => {
    const { fromDate, toDate } = getSemiMonthlyCutoff();
    return [fromDate, toDate];
  });
  const [payrollGroupId, setPayrollGroupId] = useState<string | null>(null);
  // Optional narrowing of the group by the employee's own client / department tags (not the
  // ones stamped on their DTR). Empty = no narrowing.
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [departmentIds, setDepartmentIds] = useState<string[]>([]);
  // Who this run pays, picked in the readiness table. null = not touched since the scope last
  // changed, which means "everyone Ready" (and keeps following the list as it refetches).
  const [pickedIds, setPickedIds] = useState<string[] | null>(null);
  const [results, setResults] = useState<PayrollRunResult[] | null>(null);
  // The shown results were saved (not a preview), so their Deductions switches no longer apply.
  const [resultsSaved, setResultsSaved] = useState(false);
  // Per-employee choice of whether THIS run takes the deductions, overriding the company rule:
  // true = take them here, false = leave them to another run. Employees not listed follow the rule.
  const [deductionOverrides, setDeductionOverrides] = useState<
    Record<string, boolean>
  >({});
  const [notReady, setNotReady] = useState<PayrollNotReadyEmployee[]>([]);
  const [payDate, setPayDate] = useState<string | null>(null);
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [notReadyOpen, setNotReadyOpen] = useState(false);
  const [dailyBreakdownRow, setDailyBreakdownRow] =
    useState<PayrollRunResult | null>(null);

  const { data: payrollGroups = [], isLoading: groupsLoading } =
    usePayrollGroups();
  // Same as DTR generation: the dropdown lists "code - description", the selected value shows
  // the code only.
  const payrollGroupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: p.code || p.name,
    fullLabel: p.code ? p.name : undefined,
  }));
  const { data: allEmployees = [], isLoading: employeesLoading } =
    useEmployees();
  const { data: clients = [] } = useClients();
  const { data: departments = [] } = useDepartments();
  // Memoized so the dropdowns aren't handed a brand-new options array on every render.
  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c.id, label: c.name })),
    [clients],
  );
  const clientNameOf = (id?: string | null) =>
    (id && clients.find((c) => c.id === id)?.name) || "No client";
  const departmentOptions = useMemo(
    () => departments.map((d) => ({ value: d.id, label: d.name })),
    [departments],
  );
  // Client / department narrowing, from the employee's own tags. Applies to the employee list and,
  // normally, the server's readiness rows (which carry the same tags).
  const matchesNarrowing = (e: {
    clientId?: string | null;
    departmentId?: string | null;
  }) =>
    (clientIds.length === 0 ||
      (!!e.clientId && clientIds.includes(e.clientId))) &&
    (departmentIds.length === 0 ||
      (!!e.departmentId && departmentIds.includes(e.departmentId)));
  const matchesDepartment = (e: { departmentId?: string | null }) =>
    departmentIds.length === 0 ||
    (!!e.departmentId && departmentIds.includes(e.departmentId));

  const {
    data: readinessData,
    isFetching: readinessLoading,
    refetch: refetchReadiness,
  } = usePayrollReadiness(dateRange?.[0], dateRange?.[1], clientIds);
  const readiness = useMemo(() => readinessData?.rows ?? [], [readinessData]);
  // When payroll runs per client by the client each day was worked for, the server already
  // narrowed the rows to the chosen clients: a reliever whose own client is another one still
  // belongs here, so their client tag must not filter them out again.
  const dayClientMode = readinessData?.dayClientMode ?? false;
  // Every group's rows for the cutoff (overview tiles), then the selected group's (table).
  const allReadinessRows = useMemo(
    () =>
      dateRange
        ? buildReadinessRows(
            readiness.filter(
              dayClientMode ? matchesDepartment : matchesNarrowing,
            ),
            allEmployees.filter(matchesNarrowing),
            dateRange[0],
            dateRange[1],
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      readiness,
      dayClientMode,
      allEmployees,
      dateRange,
      clientIds,
      departmentIds,
    ],
  );
  const groupRows = useMemo(
    () => allReadinessRows.filter((r) => r.payrollGroupId === payrollGroupId),
    [allReadinessRows, payrollGroupId],
  );
  // The effective selection: what the user picked (minus anyone no longer payable, e.g. paid by a
  // run since), or every Ready employee by default.
  const employeeIds = useMemo(() => {
    const payable = new Set(
      groupRows.filter((r) => isPayable(r.status)).map((r) => r.employeeId),
    );
    return pickedIds
      ? pickedIds.filter((id) => payable.has(id))
      : groupRows.filter((r) => r.status === "Ready").map((r) => r.employeeId);
  }, [groupRows, pickedIds]);

  const selectedGroupLabel =
    payrollGroupOptions.find((o) => o.value === payrollGroupId)?.label ?? "";
  const { mutate: calculate, isPending: calculating } = useCalculatePayroll();
  const { mutate: generate, isPending: generating } = useGeneratePayroll();

  // Payroll group, date range and at least one ready employee are required.
  const hasScope = !!payrollGroupId && !!dateRange?.[0] && !!dateRange?.[1];
  const canRun = hasScope && employeeIds.length > 0;
  const runHint = !hasScope
    ? "Select a date range and a payroll group"
    : "Select at least one ready employee below";

  // A different group or range makes the shown results/warnings stale, and resets the pick back
  // to "everyone Ready".
  const clearResults = () => {
    setResults(null);
    setResultsSaved(false);
    setDeductionOverrides({});
    setNotReady([]);
    setPickedIds(null);
  };

  const buildPayload = (
    remarks?: string,
    overrides: Record<string, boolean> = deductionOverrides,
  ) => {
    // Only people in this run matter; a choice for someone no longer selected is dropped.
    const chosen = employeeIds.filter((id) => id in overrides);
    const carry = chosen.filter((id) => overrides[id]);
    const skip = chosen.filter((id) => !overrides[id]);
    return {
      fromDate: dateRange?.[0],
      toDate: dateRange?.[1],
      payrollGroupId,
      employeeIds,
      clientIds: clientIds.length ? clientIds : undefined,
      departmentIds: departmentIds.length ? departmentIds : undefined,
      carryDeductionEmployeeIds: carry.length ? carry : undefined,
      skipDeductionEmployeeIds: skip.length ? skip : undefined,
      payDate,
      remarks,
    };
  };

  const runPayroll = (
    overrides: Record<string, boolean> = deductionOverrides,
    quiet = false,
  ) => {
    if (!canRun) return;
    calculate(buildPayload(undefined, overrides), {
      onSuccess: (res) => {
        setResults(res.data);
        setResultsSaved(false);
        setNotReady(res.notReady ?? []);
        if (!quiet)
          message.success(`Preview: ${res.total} employee(s) calculated.`);
      },
      onError: (err) =>
        message.error(apiErrorMessage(err, "Payroll calculation failed.")),
    });
  };

  // Switching an employee's deductions on/off for this run re-previews so the totals, net pay and
  // every other employee's reason ("taken in another run") reflect the choice.
  const toggleDeductions = (employeeId: string, takeHere: boolean) => {
    const next = { ...deductionOverrides, [employeeId]: takeHere };
    setDeductionOverrides(next);
    runPayroll(next, true);
  };

  const handleConfirmGenerate = (remarks: string) => {
    generate(buildPayload(remarks), {
      onSuccess: (res) => {
        setResults(res.data);
        setResultsSaved(true);
        setNotReady([]);
        setPickedIds(null);
        setPostModalOpen(false);
        message.success(
          `Payroll generated and saved for ${res.total} employee(s).`,
        );
      },
      onError: (err) =>
        message.error(apiErrorMessage(err, "Payroll generation failed.")),
    });
  };

  // The company policy "which payroll run takes the deductions" is on, so each row says whether this
  // run takes that employee's deductions or pays earnings only (another run takes them).
  const showCarrier = !!results?.some((r) => r.deductionCarrierReason);
  const earningsOnlyCount =
    results?.filter((r) => r.isDeductionCarrier === false).length ?? 0;
  // Columns before the first earnings band: view, employee, [deductions], salary type, daily rate.
  const leadColumns = showCarrier ? 5 : 4;

  const deductionsColumn: ColumnsType<PayrollRunResult>[number] = {
    title: "Deductions",
    key: "deductionCarrier",
    width: 170,
    render: (_, r) => {
      if (!r.deductionCarrierReason) return null;
      const takesHere = r.isDeductionCarrier !== false;
      const takenElsewhere = r.deductionCarrierReason === "ClaimedElsewhere";
      return (
        <Space size={6}>
          <Tooltip title={deductionReasonText(r.deductionCarrierReason)}>
            <Tag color={takesHere ? "green" : "default"} className="m-0">
              {takesHere ? "Taken here" : "Earnings only"}
            </Tag>
          </Tooltip>
          <Tooltip
            title={
              takenElsewhere
                ? deductionReasonText("ClaimedElsewhere")
                : resultsSaved
                  ? "This run is saved. Delete it to change where deductions are taken."
                  : takesHere
                    ? "Leave this employee's deductions to another run"
                    : "Take this employee's deductions in this run"
            }
          >
            <Switch
              size="small"
              checked={takesHere}
              disabled={takenElsewhere || resultsSaved || calculating}
              onChange={(checked) => toggleDeductions(r.employeeId, checked)}
            />
          </Tooltip>
          {takesHere && !!r.otherUnpaidDays && (
            <Tooltip
              title={`${r.otherUnpaidDays} day(s) worked for other clients this cutoff are not paid yet, so they are not counted in this run's contributions and tax. Run those clients first, or accept the difference.`}
            >
              <WarningOutlined className="text-amber-500" />
            </Tooltip>
          )}
        </Space>
      );
    },
  };

  const resultColumns: ColumnsType<PayrollRunResult> = [
    {
      title: "",
      key: "viewDaily",
      width: 40,
      render: (_, r) =>
        r.timeHourPayResults?.length ? (
          <Tooltip title="View daily pay breakdown">
            <Button
              aria-label="View daily pay breakdown"
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
      width: 220,
      render: (name: string, r) => (
        <div className="flex flex-col gap-1">
          <span>{name}</span>
          {!!r.otherClients?.length && (
            <div className="flex flex-wrap gap-y-1">
              {r.otherClients.map((c) => (
                <Tooltip
                  key={c.clientId ?? "none"}
                  title={
                    c.unpaidDays > 0
                      ? `Also worked ${c.workedDays} day(s) for this client this cutoff. ${c.unpaidDays} are not in any saved run yet.`
                      : `Also worked ${c.workedDays} day(s) for this client this cutoff. All are already in a saved run.`
                  }
                >
                  <Tag
                    color={c.unpaidDays > 0 ? "orange" : "default"}
                    className="text-xs"
                  >
                    Also: {clientNameOf(c.clientId)} · {c.workedDays}d
                    {c.unpaidDays > 0 ? ` (${c.unpaidDays} to run)` : " (run)"}
                  </Tag>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      ),
    },
    ...(showCarrier ? [deductionsColumn] : []),
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
      render: formatMoney,
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
            render: (_, r) => formatMoney(basicPay(r)),
          },
          {
            title: "OT",
            key: "overtimePay",
            align: "right",
            render: (_, r) => formatMoney(otPay(r)),
          },
          {
            title: "ND",
            key: "nd",
            align: "right",
            render: (_, r) => formatMoney(ndPay(r)),
          },
          {
            title: "NDOT",
            key: "ndot",
            align: "right",
            // "—" under Additive mode: that pay now lives in OT/ND above instead — see
            // ot-nd-pay.util.ts.
            render: (_, r) => {
              const v = ndotDisplayPay(r);
              return v === null ? "—" : formatMoney(v);
            },
          },
          {
            title: "Rest Day",
            dataIndex: "restDayPay",
            key: "restDayPay",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Holiday",
            key: "holidayPay",
            align: "right",
            render: (_, r) => formatMoney(holidayPay(r)),
          },
          {
            title: "Allowances",
            dataIndex: "totalRegularAllowances",
            key: "allowances",
            align: "right",
            render: formatMoney,
          },
          {
            title: "COLA",
            dataIndex: "cola",
            key: "cola",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Bonuses",
            dataIndex: "totalBonuses",
            key: "bonuses",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Commissions",
            dataIndex: "totalCommissions",
            key: "commissions",
            align: "right",
            render: formatMoney,
          },
          {
            title: "De Minimis",
            dataIndex: "totalDeminimises",
            key: "deminimis",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Other Income",
            dataIndex: "totalOtherIncome",
            key: "otherIncome",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Reimbursement",
            dataIndex: "reimbursement",
            key: "reimbursement",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Gross",
            dataIndex: "grossIncome",
            key: "grossIncome",
            align: "right",
            render: formatMoney,
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
            render: formatMoney,
          },
          {
            title: "PhilHealth",
            dataIndex: "philHealthContribution",
            key: "phic",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Pag-IBIG",
            dataIndex: "pagIbigContribution",
            key: "hdmf",
            align: "right",
            render: formatMoney,
          },
          {
            title: "W-Tax",
            dataIndex: "withholdingTax",
            key: "tax",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Cash Bond",
            dataIndex: "cashBondDeduction",
            key: "cashBond",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Other Deductions",
            dataIndex: "otherDeductions",
            key: "otherDed",
            align: "right",
            render: formatMoney,
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
            render: formatMoney,
          },
          {
            title: "UT",
            dataIndex: "underTimeAmount",
            key: "underTimeAmount",
            align: "right",
            render: formatMoney,
          },
          {
            title: "Absent",
            key: "absent",
            align: "right",
            render: (_, r) => formatMoney(r.absencesAmount),
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
          {formatMoney(v)}
        </Text>
      ),
    },
  ];

  const totalNetPay = results?.reduce((s, r) => s + r.netPay, 0) ?? 0;
  const totalGross = results?.reduce((s, r) => s + r.grossIncome, 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <Card size="small" title="Payroll Run Scope">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Space wrap>
            <RequiredField>
              <MobileRangePicker
                size="small"
                value={
                  dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null
                }
                onChange={(dates) => {
                  setDateRange(
                    dates
                      ? [
                          dates[0]?.format("YYYY-MM-DD") ?? "",
                          dates[1]?.format("YYYY-MM-DD") ?? "",
                        ]
                      : null,
                  );
                  clearResults();
                }}
              />
            </RequiredField>
            <RequiredField>
              <Select
                style={{ width: 200 }}
                size="small"
                showSearch
                filterOption={filterByLabel}
                placeholder="Payroll group"
                loading={groupsLoading}
                options={payrollGroupOptions}
                optionRender={(opt) =>
                  opt.data.fullLabel
                    ? `${opt.data.label} - ${opt.data.fullLabel}`
                    : String(opt.data.label ?? "")
                }
                value={payrollGroupId}
                onChange={(v) => {
                  setPayrollGroupId(v ?? null);
                  clearResults();
                }}
              />
            </RequiredField>
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              maxTagCount={1}
              maxTagPlaceholder={(omitted) => `+${omitted.length}`}
              style={{ width: 200 }}
              size="small"
              placeholder="All clients"
              options={clientOptions}
              value={clientIds}
              onChange={(v) => {
                setClientIds(v);
                clearResults();
              }}
            />
            <Select
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              maxTagCount={1}
              maxTagPlaceholder={(omitted) => `+${omitted.length}`}
              style={{ width: 200 }}
              size="small"
              placeholder="All departments"
              options={departmentOptions}
              value={departmentIds}
              onChange={(v) => {
                setDepartmentIds(v);
                clearResults();
              }}
            />
          </Space>
          <Space>
            {SHOW_PAY_RELEASE_DATE && (
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
            )}
            <PermissionGate permission="Payroll Run:Create">
              <Tooltip title={!canRun ? runHint : ""}>
                <Button
                  icon={<PlayCircleOutlined />}
                  onClick={() => runPayroll()}
                  loading={calculating}
                  disabled={!canRun}
                >
                  Preview{canRun ? ` (${employeeIds.length})` : ""}
                </Button>
              </Tooltip>
            </PermissionGate>
            <PermissionGate permission="Payroll Run:Create">
              <Tooltip
                title={
                  !canRun ? runHint : "Calculate & save to payroll register"
                }
              >
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => setPostModalOpen(true)}
                  loading={generating}
                  disabled={!canRun}
                >
                  Save Payroll{canRun ? ` (${employeeIds.length})` : ""}
                </Button>
              </Tooltip>
            </PermissionGate>
          </Space>
        </div>
      </Card>

      {dateRange && (
        <Card
          size="small"
          title={
            payrollGroupId
              ? `Who can be paid — ${selectedGroupLabel}`
              : "Who can be paid — pick a payroll group"
          }
          extra={
            <Space>
              {payrollGroupId && (
                <Text type="secondary" className="text-xs">
                  {employeeIds.length} selected
                </Text>
              )}
              <Tooltip title="Refresh — picks up DTR approved since this page opened">
                <Button
                  aria-label="Refresh — picks up DTR approved since this page opened"
                  size="small"
                  type="text"
                  icon={<ReloadOutlined />}
                  loading={readinessLoading}
                  onClick={() => refetchReadiness()}
                />
              </Tooltip>
            </Space>
          }
        >
          <div className="flex flex-col gap-4">
            <PayrollReadinessOverview
              groups={payrollGroupOptions}
              rows={allReadinessRows}
              loading={readinessLoading && !readiness.length}
              selectedGroupId={payrollGroupId}
              onSelect={(id) => {
                if (id === payrollGroupId) return;
                setPayrollGroupId(id);
                clearResults();
              }}
            />
            {payrollGroupId && (
              <PayrollReadinessTable
                rows={groupRows}
                loading={readinessLoading || employeesLoading}
                selectedIds={employeeIds}
                onSelectionChange={setPickedIds}
              />
            )}
          </div>
        </Card>
      )}

      {notReady.length > 0 && (
        <>
          <Alert
            type="warning"
            showIcon
            message={`${notReady.length} employee(s) not fully included`}
            action={
              <Button size="small" onClick={() => setNotReadyOpen(true)}>
                View details
              </Button>
            }
          />
          <Modal
            title={`${notReady.length} employee(s) not fully included`}
            open={notReadyOpen}
            onCancel={() => setNotReadyOpen(false)}
            footer={
              <Button type="primary" onClick={() => setNotReadyOpen(false)}>
                Close
              </Button>
            }
            width={720}
          >
            <ul className="m-0 pl-4 max-h-[60vh] overflow-y-auto">
              {notReady.map((e) => (
                <li key={`${e.employeeId}-${e.reason}`} className="mb-1">
                  <strong>{e.fullName || e.employeeId}</strong> —{" "}
                  {e.reason === "FixedSalaryAlreadyPaid"
                    ? "skipped: a payroll run already paid this cutoff's fixed salary. Delete that run to include their remaining days."
                    : `${e.unapprovedDays} day(s) still awaiting DTR approval${
                        e.batchCodes.length
                          ? ` (${e.batchCodes.join(", ")})`
                          : ""
                      }. They will be paid in a later run once approved.`}
                </li>
              ))}
            </ul>
          </Modal>
        </>
      )}

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
          {showCarrier && (
            <Alert
              type="info"
              showIcon
              className="mb-3"
              message={
                earningsOnlyCount > 0
                  ? `${earningsOnlyCount} employee(s) are paid earnings only in this run. Their government contributions, tax, loans and other income are taken in one run per cutoff.`
                  : "Every employee in this run has their deductions taken here. Government contributions, tax, loans and other income are taken in one run per cutoff."
              }
            />
          )}
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
                  cashBond: sum((r) => r.cashBondDeduction),
                  otherDed: sum((r) => r.otherDeductions),
                  late: sum((r) => r.lateAmount),
                  ut: sum((r) => r.underTimeAmount),
                  absent: sum((r) => r.absencesAmount),
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
                  totals.cashBond,
                  totals.otherDed,
                  totals.late,
                  totals.ut,
                  totals.absent,
                ];
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={leadColumns}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    {cells.map((val, i) => (
                      <Table.Summary.Cell
                        key={i}
                        index={i + leadColumns}
                        align="right"
                      >
                        <strong>{formatMoney(val)}</strong>
                      </Table.Summary.Cell>
                    ))}
                    <Table.Summary.Cell
                      index={cells.length + leadColumns}
                      align="right"
                    >
                      <Text strong style={{ color: token.colorPrimary }}>
                        {formatMoney(totals.net)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        </Card>
      )}

      <TimeHourPayResultsModal
        open={!!dailyBreakdownRow}
        onClose={() => setDailyBreakdownRow(null)}
        employeeName={dailyBreakdownRow?.fullName}
        results={dailyBreakdownRow?.timeHourPayResults ?? []}
      />

      <PayrollRunPostModal
        open={postModalOpen}
        summary={`${employeeIds.length} selected employee(s)${payrollGroupId ? ` of payroll group ${selectedGroupLabel}` : ""}, ${dateRange ? `${fmtDate(dateRange[0])} — ${fmtDate(dateRange[1])}` : ""}`}
        isSaving={generating}
        onClose={() => setPostModalOpen(false)}
        onConfirm={handleConfirmGenerate}
      />
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FileTextOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useCutoffTracker } from "../../hooks/use-for-payroll-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import CutoffStatementModal from "../cutoff-statement-modal";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";
import { getSemiMonthlyCutoff } from "@/shared/utils/cutoff.util";
import type {
  CutoffTrackerEmployee,
  CutoffTrackerClientDays,
} from "../../models/api/response/cutoff-tracker.model";

const { Text } = Typography;

type TrackerStatus = "carrier" | "missing" | "waiting";
type StatusFilter = "all" | TrackerStatus;

const NO_CLIENT_LABEL = "No client";

// "missing": days were already paid by a saved run, but no run took the deductions -- the one
// state that needs action. "waiting": nothing has been paid yet, so there is nothing to miss.
const statusOf = (e: CutoffTrackerEmployee): TrackerStatus => {
  if (e.carrier) return "carrier";
  return e.clients.some((c) => c.paidDays > 0) ? "missing" : "waiting";
};

const STATUS_META: Record<TrackerStatus, { label: string; color: string }> = {
  carrier: { label: "Deductions taken", color: "green" },
  missing: { label: "Paid, no deductions yet", color: "orange" },
  waiting: { label: "Waiting for a run", color: "default" },
};

const fmtDate = (d?: string | null) =>
  d ? dayjs(d.replace(/Z$/, "")).format("MMM DD, YYYY") : "—";

// Where each employee worked this cutoff and which saved run takes their deductions. Only meaningful
// when the company runs payroll per client with a "which run takes the deductions" rule (Company
// Settings); otherwise it just says so.
export default function CutoffTrackerTab() {
  const [dateRange, setDateRange] = useState<[string, string]>(() => {
    const { fromDate, toDate } = getSemiMonthlyCutoff();
    return [fromDate, toDate];
  });
  const [payrollGroupId, setPayrollGroupId] = useState<string | null>(null);
  // Most guards only ever work one client, so the tracker opens on the people it exists for.
  const [onlyMultiClient, setOnlyMultiClient] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [statementFor, setStatementFor] =
    useState<CutoffTrackerEmployee | null>(null);

  const { data, isFetching, refetch } = useCutoffTracker(
    dateRange[0],
    dateRange[1],
    payrollGroupId,
  );
  const { data: payrollGroups = [], isLoading: groupsLoading } =
    usePayrollGroups();
  const { data: clients = [] } = useClients();

  const clientName = useMemo(() => {
    const map = new Map(clients.map((c) => [c.id, c.name]));
    return (id?: string | null) =>
      id ? (map.get(id) ?? "Unknown client") : NO_CLIENT_LABEL;
  }, [clients]);

  const groupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: p.code || p.name,
  }));

  const employees = useMemo(() => data?.employees ?? [], [data]);
  const scoped = useMemo(
    () =>
      onlyMultiClient
        ? employees.filter((e) => e.clients.length > 1)
        : employees,
    [employees, onlyMultiClient],
  );
  const counts = useMemo(() => {
    const c: Record<TrackerStatus, number> = {
      carrier: 0,
      missing: 0,
      waiting: 0,
    };
    for (const e of scoped) c[statusOf(e)] += 1;
    return c;
  }, [scoped]);
  const rows = useMemo(
    () =>
      statusFilter === "all"
        ? scoped
        : scoped.filter((e) => statusOf(e) === statusFilter),
    [scoped, statusFilter],
  );

  const daysTag = (e: CutoffTrackerEmployee, c: CutoffTrackerClientDays) => {
    const isHome = c.clientId === e.homeClientId;
    return (
      <Tooltip
        key={c.clientId ?? "none"}
        title={`${c.workedDays} day(s) worked, ${c.unpaidApprovedDays} approved and not yet paid, ${c.paidDays} already paid${isHome ? ". This is the employee's own client." : ""}`}
      >
        <Tag color={c.unpaidApprovedDays > 0 ? "blue" : "default"}>
          {clientName(c.clientId)}
          {isHome ? " (own)" : ""} · {c.workedDays}d
          {c.unpaidApprovedDays > 0 ? ` · ${c.unpaidApprovedDays} unpaid` : ""}
        </Tag>
      </Tooltip>
    );
  };

  const columns: ColumnsType<CutoffTrackerEmployee> = [
    {
      title: "Employee",
      key: "employee",
      width: 220,
      render: (_, e) => (
        <div className="flex flex-col">
          <Text strong>{e.fullName || e.employeeId}</Text>
          {e.employeeNo && (
            <Text type="secondary" className="text-xs">
              {e.employeeNo}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Days worked per client",
      key: "clients",
      render: (_, e) => (
        <div className="flex flex-wrap gap-y-1">
          {e.clients.map((c) => daysTag(e, c))}
        </div>
      ),
    },
    {
      title: "Deductions",
      key: "status",
      width: 210,
      render: (_, e) => {
        const status = statusOf(e);
        const meta = STATUS_META[status];
        return (
          <Tooltip
            title={
              status === "missing"
                ? "Some of this employee's days are already paid, but no saved run takes their government contributions, tax, loans or other income for this cutoff. Open the run that should take them and switch Deductions on."
                : status === "waiting"
                  ? "No run has paid this employee yet. The rule you set in Company Settings picks the run when you preview."
                  : undefined
            }
          >
            <Tag color={meta.color}>{meta.label}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: "",
      key: "statement",
      width: 110,
      render: (_, e) => (
        <Button
          type="link"
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => setStatementFor(e)}
        >
          Statement
        </Button>
      ),
    },
    {
      title: "Taken in",
      key: "carrier",
      width: 260,
      render: (_, e) =>
        e.carrier ? (
          <div className="flex flex-col">
            <Text>{clientName(e.carrier.clientId)}</Text>
            <Text type="secondary" className="text-xs">
              {e.carrier.payDate
                ? `Pay date ${fmtDate(e.carrier.payDate)}`
                : "No pay date"}
              {e.carrier.remarks ? ` · ${e.carrier.remarks}` : ""}
            </Text>
          </div>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  const gated = !!data && data.mode !== "EveryRun";

  return (
    <div className="flex flex-col gap-4">
      <Card size="small" title="Cutoff Tracker">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Space wrap>
            <MobileRangePicker
              size="small"
              value={[dayjs(dateRange[0]), dayjs(dateRange[1])]}
              onChange={(dates) => {
                if (dates?.[0] && dates?.[1])
                  setDateRange([
                    dates[0].format("YYYY-MM-DD"),
                    dates[1].format("YYYY-MM-DD"),
                  ]);
              }}
            />
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              className="w-50"
              size="small"
              placeholder="All payroll groups"
              loading={groupsLoading}
              options={groupOptions}
              value={payrollGroupId}
              onChange={(v) => setPayrollGroupId(v ?? null)}
            />
            <Space size={6}>
              <Switch
                size="small"
                checked={onlyMultiClient}
                onChange={setOnlyMultiClient}
              />
              <Text className="text-xs">
                Only employees with several clients
              </Text>
            </Space>
          </Space>
          <Tooltip title="Refresh — picks up runs saved or deleted since this tab opened">
            <Button
              size="small"
              type="text"
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={() => refetch()}
            />
          </Tooltip>
        </div>
      </Card>

      {data && !gated && (
        <Alert
          type="info"
          showIcon
          message="Deductions are taken in every run"
          description="This tracker follows employees paid by several clients in one cutoff. Turn on a rule under Company Settings > Attendance & Payroll Policy > Employees Paid by Several Clients to take each employee's deductions in only one run."
        />
      )}

      {gated && (
        <Card size="small">
          <div className="flex flex-col gap-3">
            <Segmented<StatusFilter>
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: `All (${scoped.length})` },
                {
                  value: "missing",
                  label: `Paid, no deductions yet (${counts.missing})`,
                },
                {
                  value: "waiting",
                  label: `Waiting for a run (${counts.waiting})`,
                },
                {
                  value: "carrier",
                  label: `Deductions taken (${counts.carrier})`,
                },
              ]}
            />
            <Table
              rowKey="employeeId"
              size="small"
              loading={isFetching}
              dataSource={rows}
              columns={columns}
              pagination={{ pageSize: 50, showSizeChanger: false }}
              scroll={{ x: "max-content" }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      onlyMultiClient
                        ? "No employee worked for more than one client in this cutoff."
                        : "No worked days in this cutoff."
                    }
                  />
                ),
              }}
            />
          </div>
        </Card>
      )}

      <CutoffStatementModal
        open={!!statementFor}
        onClose={() => setStatementFor(null)}
        employeeId={statementFor?.employeeId}
        employeeName={statementFor?.fullName}
        from={dateRange[0]}
        to={dateRange[1]}
        clientName={clientName}
      />
    </div>
  );
}

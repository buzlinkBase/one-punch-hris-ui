import { useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Dropdown,
  Form,
  Select,
  Space,
  Tabs,
  Typography,
  message,
} from "antd";
import type { MenuProps } from "antd";
import {
  ClearOutlined,
  DownloadOutlined,
  FilterOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useRawAttendanceLogs,
  useRawColumnarLogs,
  useCleanRowLogs,
  useCleanColumnarLogs,
} from "../../hooks/use-raw-logs-queries";
import RawAttendanceTable from "../../components/raw-attendance-table";
import RawColumnarTable from "../../components/raw-columnar-table";
import CleanRowTable from "../../components/clean-row-table";
import CleanColumnarTable from "../../components/clean-columnar-table";
import { RAW_LOGS_LABEL } from "../../constants/label.const";
import type { RawLogsFilterRequest } from "../../models/api/response/raw-attendance-log.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import {
  buildFlatCsv,
  buildFlatExcel,
  triggerDownload,
} from "@/shared/utils/export.utils";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title, Text } = Typography;

const EMPTY_FILTER: RawLogsFilterRequest = {};

function currentSemiMonthlyRange(): { fromDate: string; toDate: string } {
  const today = dayjs();
  const day = today.date();
  if (day <= 15) {
    return {
      fromDate: today.startOf("month").format("YYYY-MM-DD"),
      toDate: today.date(15).format("YYYY-MM-DD"),
    };
  }
  return {
    fromDate: today.date(16).format("YYYY-MM-DD"),
    toDate: today.endOf("month").format("YYYY-MM-DD"),
  };
}

interface TabState {
  filter: RawLogsFilterRequest;
  key: number;
}

const notGeneratedYet = (
  <div className="py-8 text-center">
    <Text type="secondary">
      Set filters above and click Generate to load data.
    </Text>
  </div>
);

export default function RawLogsList() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("raw-attendance");
  const [pending, setPending] = useState<RawLogsFilterRequest>(
    currentSemiMonthlyRange,
  );

  // Each tab tracks its own committed filter + generate key independently.
  // Only Generate (not tab switching) populates a tab's state.
  const [tabStates, setTabStates] = useState<Record<string, TabState>>({});

  const seqRef = useRef(0);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: employees = [] } = useEmployeeFilter();

  // Per-tab query state helpers
  const ts = (tab: string) => tabStates[tab];
  const tabFilter = (tab: string) => ts(tab)?.filter ?? EMPTY_FILTER;
  const tabKey = (tab: string) => ts(tab)?.key ?? 0;
  const tabEnabled = (tab: string) => !!ts(tab);

  const { data: rawAttendanceLogs = [], isLoading: rawAttendanceLoading } =
    useRawAttendanceLogs(tabFilter("raw-attendance"), {
      enabled: tabEnabled("raw-attendance"),
      generateKey: tabKey("raw-attendance"),
    });

  const { data: rawColumnarLogs = [], isLoading: rawColumnarLoading } =
    useRawColumnarLogs(tabFilter("raw-columnar"), {
      enabled: tabEnabled("raw-columnar"),
      generateKey: tabKey("raw-columnar"),
    });

  const { data: cleanRowLogs = [], isLoading: cleanRowLoading } =
    useCleanRowLogs(tabFilter("clean-row"), {
      enabled: tabEnabled("clean-row"),
      generateKey: tabKey("clean-row"),
    });

  const { data: cleanColumnarLogs = [], isLoading: cleanColumnarLoading } =
    useCleanColumnarLogs(tabFilter("clean-columnar"), {
      enabled: tabEnabled("clean-columnar"),
      generateKey: tabKey("clean-columnar"),
    });

  const isActiveTabLoading =
    (activeTab === "raw-attendance" && rawAttendanceLoading) ||
    (activeTab === "raw-columnar" && rawColumnarLoading) ||
    (activeTab === "clean-row" && cleanRowLoading) ||
    (activeTab === "clean-columnar" && cleanColumnarLoading);

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: b.code || b.name,
    fullLabel: b.code ? b.name : undefined,
  }));
  const deptOptions = departments.map((d) => ({
    value: d.id,
    label: d.code || d.name,
    fullLabel: d.code ? d.name : undefined,
  }));
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: c.code || c.name,
    fullLabel: c.code ? c.name : undefined,
  }));
  const areaOptions = areas.map((a) => ({
    value: a.id,
    label: a.code || a.name,
    fullLabel: a.code ? a.name : undefined,
  }));
  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: e.name ?? e.id,
  }));

  const activeFilterCount = [
    pending.fromDate,
    pending.toDate,
    pending.branchId,
    pending.departmentId,
    pending.clientId,
    pending.operationAreaId,
    pending.employeeId,
  ].filter(Boolean).length;

  // ── Export helpers ──────────────────────────────────────────────────────────

  type AnyRow = Record<string, string>;

  const activeTabData = (): { rows: AnyRow[]; name: string } => {
    switch (activeTab) {
      case "raw-attendance":
        return {
          name: "raw-attendance",
          rows: rawAttendanceLogs.map((r) => ({
            Employee: r.name ?? "",
            WorkDateTime: r.workDateTime,
            LogSource: r.logSource,
            Batch: r.batch,
          })),
        };
      case "raw-columnar":
        return {
          name: "raw-columnar",
          rows: rawColumnarLogs.map((r) => ({
            EmpNo: r.empNo,
            FullName: r.fullName,
            Department: r.department,
            WorkDate: r.workDate,
            ShiftName: r.shiftName,
            ShiftStart: r.shiftStart,
            ShiftEnd: r.shiftEnd,
            BreakOut: r.breakOut ?? "",
            BreakIn: r.breakIn ?? "",
            ...Object.fromEntries(
              Array.from({ length: 20 }, (_, i) => {
                const k = `log${i + 1}` as keyof typeof r;
                const v = r[k] as { workTime: string } | null;
                return [`Log${i + 1}`, v?.workTime ?? ""];
              }).filter(([, v]) => v !== ""),
            ),
          })),
        };
      case "clean-row":
        return {
          name: "clean-row",
          rows: cleanRowLogs.map((r) => ({
            EmpNo: r.empNo,
            FullName: r.fullName,
            Department: r.department,
            WorkDate: r.workDate,
            ShiftName: r.shiftName,
            ShiftStart: r.shiftStart,
            ShiftEnd: r.shiftEnd,
            BreakOut: r.breakOut ?? "",
            BreakIn: r.breakIn ?? "",
            Log1: r.log1?.workTime ?? "",
          })),
        };
      case "clean-columnar":
        return {
          name: "clean-columnar",
          rows: cleanColumnarLogs.map((r) => ({
            EmpNo: r.empNo,
            FullName: r.fullName,
            Department: r.department,
            WorkDate: r.workDate,
            ShiftName: r.shiftName,
            ShiftStart: r.shiftStart,
            ShiftEnd: r.shiftEnd,
            BreakOut: r.breakOut ?? "",
            BreakIn: r.breakIn ?? "",
            ...Object.fromEntries(
              Array.from({ length: 20 }, (_, i) => {
                const k = `log${i + 1}` as keyof typeof r;
                const v = r[k] as { workTime: string } | null;
                return [`Log${i + 1}`, v?.workTime ?? ""];
              }).filter(([, v]) => v !== ""),
            ),
          })),
        };
      default:
        return { rows: [], name: activeTab };
    }
  };

  const handleExport = (format: "csv" | "excel") => {
    const { rows, name } = activeTabData();
    if (!rows.length) {
      messageApi.info("No data to export. Click Generate first.");
      return;
    }
    const headers = Object.keys(rows[0]);
    const strRows = rows.map((r) => headers.map((h) => r[h] ?? ""));
    const date = new Date().toISOString().split("T")[0];
    if (format === "csv") {
      triggerDownload(
        buildFlatCsv(headers, strRows),
        `${name}-${date}.csv`,
        "text/plain",
      );
    } else {
      triggerDownload(
        buildFlatExcel(headers, strRows),
        `${name}-${date}.xls`,
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

  const activeTabHasData =
    (activeTab === "raw-attendance" && rawAttendanceLogs.length > 0) ||
    (activeTab === "raw-columnar" && rawColumnarLogs.length > 0) ||
    (activeTab === "clean-row" && cleanRowLogs.length > 0) ||
    (activeTab === "clean-columnar" && cleanColumnarLogs.length > 0);

  // ────────────────────────────────────────────────────────────────────────────

  const handleGenerate = () => {
    if (!pending.fromDate || !pending.toDate) {
      messageApi.warning("Date Range is required.");
      return;
    }
    seqRef.current += 1;
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        filter: { ...pending },
        key: seqRef.current,
      },
    }));
  };

  const handleClear = () => {
    setPending(currentSemiMonthlyRange());
    setTabStates({});
  };

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {RAW_LOGS_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">{RAW_LOGS_LABEL.SUBTITLE}</p>
          </div>
          <Space>
            <Dropdown
              menu={{ items: exportMenuItems }}
              trigger={["click"]}
              disabled={!activeTabHasData}
            >
              <Button icon={<DownloadOutlined />} disabled={!activeTabHasData}>
                Export
              </Button>
            </Dropdown>
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltersOpen((v) => !v)}
                type={filtersOpen ? "default" : "text"}
              >
                Filters
              </Button>
            </Badge>
          </Space>
        </div>
      </div>

      {filtersOpen && (
        <Card size="small" className="mb-4">
          <Form layout="vertical">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4">
              <Form.Item
                label="Date Range"
                className="mb-3 sm:col-span-2"
                required
                validateStatus={
                  !pending.fromDate || !pending.toDate ? "error" : ""
                }
                help={
                  !pending.fromDate || !pending.toDate ? "Required" : undefined
                }
              >
                <MobileRangePicker
                  style={{ width: "100%" }}
                  status={
                    !pending.fromDate || !pending.toDate ? "error" : undefined
                  }
                  value={
                    pending.fromDate && pending.toDate
                      ? [dayjs(pending.fromDate), dayjs(pending.toDate)]
                      : null
                  }
                  onChange={(dates) =>
                    setPending((c) => ({
                      ...c,
                      fromDate: dates?.[0]?.format("YYYY-MM-DD"),
                      toDate: dates?.[1]?.format("YYYY-MM-DD"),
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label="Branch" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, opt) => {
                    const q = input.toLowerCase();
                    return (
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(q) ||
                      String(opt?.fullLabel ?? "")
                        .toLowerCase()
                        .includes(q)
                    );
                  }}
                  placeholder="All branches"
                  options={branchOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.branchId}
                  onChange={(v) => setPending((c) => ({ ...c, branchId: v }))}
                />
              </Form.Item>
              <Form.Item label="Department" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, opt) => {
                    const q = input.toLowerCase();
                    return (
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(q) ||
                      String(opt?.fullLabel ?? "")
                        .toLowerCase()
                        .includes(q)
                    );
                  }}
                  placeholder="All departments"
                  options={deptOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.departmentId}
                  onChange={(v) =>
                    setPending((c) => ({ ...c, departmentId: v }))
                  }
                />
              </Form.Item>
              <Form.Item label={RAW_LOGS_LABEL.CLIENT} className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, opt) => {
                    const q = input.toLowerCase();
                    return (
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(q) ||
                      String(opt?.fullLabel ?? "")
                        .toLowerCase()
                        .includes(q)
                    );
                  }}
                  placeholder="All clients"
                  options={clientOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.clientId}
                  onChange={(v) => setPending((c) => ({ ...c, clientId: v }))}
                />
              </Form.Item>
              <Form.Item label="Project Site" className="mb-3">
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, opt) => {
                    const q = input.toLowerCase();
                    return (
                      String(opt?.label ?? "")
                        .toLowerCase()
                        .includes(q) ||
                      String(opt?.fullLabel ?? "")
                        .toLowerCase()
                        .includes(q)
                    );
                  }}
                  placeholder="All project sites"
                  options={areaOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.operationAreaId}
                  onChange={(v) =>
                    setPending((c) => ({ ...c, operationAreaId: v }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={RAW_LOGS_LABEL.EMPLOYEE_FILTER}
                className="mb-3"
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, opt) => {
                    const q = input.toLowerCase();
                    const o = opt as typeof opt & { fullLabel?: string };
                    return (
                      String(o?.label ?? "")
                        .toLowerCase()
                        .includes(q) ||
                      String(o?.fullLabel ?? "")
                        .toLowerCase()
                        .includes(q)
                    );
                  }}
                  placeholder="All employees"
                  options={employeeOptions}
                  value={pending.employeeId}
                  onChange={(v) => setPending((c) => ({ ...c, employeeId: v }))}
                />
              </Form.Item>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <Button icon={<ClearOutlined />} onClick={handleClear}>
                Clear
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={isActiveTabLoading}
                disabled={!pending.fromDate || !pending.toDate}
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </div>
          </Form>
        </Card>
      )}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "raw-attendance",
            label: RAW_LOGS_LABEL.TAB_RAW_ATTENDANCE,
            children: tabEnabled("raw-attendance") ? (
              <RawAttendanceTable
                data={rawAttendanceLogs}
                loading={rawAttendanceLoading}
              />
            ) : (
              notGeneratedYet
            ),
          },
          {
            key: "raw-columnar",
            label: RAW_LOGS_LABEL.TAB_RAW_COLUMNAR,
            children: tabEnabled("raw-columnar") ? (
              <RawColumnarTable
                data={rawColumnarLogs}
                loading={rawColumnarLoading}
              />
            ) : (
              notGeneratedYet
            ),
          },
          {
            key: "clean-row",
            label: RAW_LOGS_LABEL.TAB_CLEAN_ROW,
            children: tabEnabled("clean-row") ? (
              <CleanRowTable data={cleanRowLogs} loading={cleanRowLoading} />
            ) : (
              notGeneratedYet
            ),
          },
          {
            key: "clean-columnar",
            label: RAW_LOGS_LABEL.TAB_CLEAN_COLUMNAR,
            children: tabEnabled("clean-columnar") ? (
              <CleanColumnarTable
                data={cleanColumnarLogs}
                loading={cleanColumnarLoading}
              />
            ) : (
              notGeneratedYet
            ),
          },
        ]}
      />
    </div>
  );
}

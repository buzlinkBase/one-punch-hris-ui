import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  ClearOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useIncompleteColumnar } from "../../hooks/use-incomplete-punches-queries";
import type {
  CleanAttendanceLogColumnar,
  RawLogsFilterRequest,
} from "@/app/modules/timekeeping/raw-logs/models/api/response/raw-attendance-log.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useEmployeeFilter } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { INCOMPLETE_PUNCHES_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title, Text } = Typography;

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const LOG_KEYS = Array.from(
  { length: 20 },
  (_, i) => `log${i + 1}` as keyof CleanAttendanceLogColumnar,
);

function fmtTime(v: string | null | undefined): string {
  if (!v) return "";
  return dayjs(v).format("HH:mm");
}

function countLogs(row: CleanAttendanceLogColumnar): number {
  return LOG_KEYS.filter((k) => row[k] !== null).length;
}

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

export default function IncompletePunchesList() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [pending, setPending] = useState<RawLogsFilterRequest>(
    currentSemiMonthlyRange,
  );
  const [committedFilter, setCommittedFilter] =
    useState<RawLogsFilterRequest | null>(null);
  const [generateKey, setGenerateKey] = useState(0);
  const seqRef = useRef(0);
  const [search, setSearch] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: employees = [] } = useEmployeeFilter();

  const { data: rawData = [], isLoading } = useIncompleteColumnar(
    committedFilter ?? {},
    {
      enabled: committedFilter !== null,
      generateKey,
    },
  );

  const incomplete = useMemo(
    () =>
      rawData
        .filter((r) => r.employeeId !== EMPTY_GUID && r.empNo !== "")
        .filter((r) => {
          const count = countLogs(r);
          return count === 0 || count % 2 !== 0;
        }),
    [rawData],
  );

  const activeLogKeys = useMemo(
    () => LOG_KEYS.filter((k) => incomplete.some((r) => r[k] !== null)),
    [incomplete],
  );

  const filtered = useMemo(() => {
    if (!search) return incomplete;
    const q = search.toLowerCase();
    return incomplete.filter((r) =>
      [r.empNo, r.fullName, r.department, r.workDate, r.shiftName].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [incomplete, search]);

  const { widths, handleResize } = useResizableColumns({
    empNo: 80,
    fullName: 180,
    department: 110,
    workDate: 100,
    shiftName: 110,
    shiftStart: 90,
    shiftEnd: 90,
    punches: 90,
    ...Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`log${i + 1}`, 80]),
    ),
  });

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
  const payrollGroupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: p.code || p.name,
    fullLabel: p.code ? p.name : undefined,
  }));
  const areaOptions = areas
    .filter((a) => !pending.branchId || a.branchId === pending.branchId)
    .map((a) => ({
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
    pending.payrollGroupId,
    pending.operationAreaId,
    pending.employeeId,
  ].filter(Boolean).length;

  const handleGenerate = () => {
    if (!pending.fromDate || !pending.toDate) {
      messageApi.warning("Date Range is required.");
      return;
    }
    seqRef.current += 1;
    setGenerateKey(seqRef.current);
    setCommittedFilter({ ...pending });
  };

  const handleClear = () => {
    setPending(currentSemiMonthlyRange());
    setCommittedFilter(null);
    setSearch("");
    // generateKey intentionally NOT reset — seqRef keeps it monotonic
  };

  const fixedColumns: ColumnsType<CleanAttendanceLogColumnar> = [
    {
      title: "Emp No",
      dataIndex: "empNo",
      key: "empNo",
      width: widths.empNo,
      onHeaderCell: () =>
        ({
          width: widths.empNo,
          onResize: (w: number) => handleResize("empNo", w),
        }) as object,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName,
      ellipsis: true,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: widths.department,
      onHeaderCell: () =>
        ({
          width: widths.department,
          onResize: (w: number) => handleResize("department", w),
        }) as object,
    },
    {
      title: "Work Date",
      dataIndex: "workDate",
      key: "workDate",
      width: widths.workDate,
      onHeaderCell: () =>
        ({
          width: widths.workDate,
          onResize: (w: number) => handleResize("workDate", w),
        }) as object,
    },
    {
      title: "Shift",
      dataIndex: "shiftName",
      key: "shiftName",
      width: widths.shiftName,
      ellipsis: true,
      onHeaderCell: () =>
        ({
          width: widths.shiftName,
          onResize: (w: number) => handleResize("shiftName", w),
        }) as object,
    },
    {
      title: "Shift Start",
      dataIndex: "shiftStart",
      key: "shiftStart",
      width: widths.shiftStart,
      onHeaderCell: () =>
        ({
          width: widths.shiftStart,
          onResize: (w: number) => handleResize("shiftStart", w),
        }) as object,
      render: (v: string) => fmtTime(v),
    },
    {
      title: "Shift End",
      dataIndex: "shiftEnd",
      key: "shiftEnd",
      width: widths.shiftEnd,
      onHeaderCell: () =>
        ({
          width: widths.shiftEnd,
          onResize: (w: number) => handleResize("shiftEnd", w),
        }) as object,
      render: (v: string) => fmtTime(v),
    },
    {
      title: "Punches",
      key: "punches",
      width: widths.punches,
      onHeaderCell: () =>
        ({
          width: widths.punches,
          onResize: (w: number) => handleResize("punches", w),
        }) as object,
      render: (_: unknown, record: CleanAttendanceLogColumnar) => {
        const count = countLogs(record);
        if (count === 0) return <Tag color="default">No logs</Tag>;
        return (
          <Tag color="warning">
            {count} punch{count !== 1 ? "es" : ""}
          </Tag>
        );
      },
    },
  ];

  const logColumns: ColumnsType<CleanAttendanceLogColumnar> = activeLogKeys.map(
    (k, i) => ({
      title: `Log ${i + 1}`,
      key: k,
      width: widths[k as string] ?? 80,
      onHeaderCell: () =>
        ({
          width: widths[k as string] ?? 80,
          onResize: (w: number) => handleResize(k as string, w),
        }) as object,
      render: (_: unknown, record: CleanAttendanceLogColumnar) => {
        const entry = record[k] as { attId: string; workTime: string } | null;
        if (!entry) return <span style={{ color: "#bbb" }}>—</span>;
        const count = countLogs(record);
        const lastNonNullKey = LOG_KEYS.filter((lk) => record[lk] !== null).at(
          -1,
        );
        const isUnpaired = count % 2 !== 0 && lastNonNullKey === k;
        return (
          <Tooltip title={dayjs(entry.workTime).format("MMM DD HH:mm")}>
            <span
              style={
                isUnpaired ? { color: "#ff4d4f", fontWeight: 600 } : undefined
              }
            >
              {fmtTime(entry.workTime)}
            </span>
          </Tooltip>
        );
      },
    }),
  );

  const scrollX =
    fixedColumns.reduce((sum, c) => sum + (Number(c.width) || 100), 0) +
    activeLogKeys.length * 80;

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {INCOMPLETE_PUNCHES_LABEL.TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              {INCOMPLETE_PUNCHES_LABEL.SUBTITLE}
            </p>
          </div>
          <Space>
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
                  onChange={(v) =>
                    // Project Site is restricted to the selected Branch.
                    setPending((c) => ({
                      ...c,
                      branchId: v,
                      operationAreaId: undefined,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item
                label={INCOMPLETE_PUNCHES_LABEL.DEPARTMENT}
                className="mb-3"
              >
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
              <Form.Item
                label={INCOMPLETE_PUNCHES_LABEL.CLIENT}
                className="mb-3"
              >
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
              <Form.Item
                label={INCOMPLETE_PUNCHES_LABEL.PAYROLL_GROUP}
                className="mb-3"
              >
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
                  placeholder="All payroll groups"
                  options={payrollGroupOptions}
                  optionRender={(opt) =>
                    opt.data.fullLabel
                      ? `${opt.data.label} - ${opt.data.fullLabel}`
                      : String(opt.data.label ?? "")
                  }
                  value={pending.payrollGroupId}
                  onChange={(v) =>
                    setPending((c) => ({ ...c, payrollGroupId: v }))
                  }
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
                label={INCOMPLETE_PUNCHES_LABEL.EMPLOYEE}
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
                loading={isLoading}
                disabled={!pending.fromDate || !pending.toDate}
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {committedFilter !== null ? (
        <div className="flex flex-col gap-3">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search name, emp no, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 320 }}
          />
          <Table
            rowKey={(r) => `${r.employeeId}-${r.workDate}`}
            dataSource={filtered}
            columns={[...fixedColumns, ...logColumns]}
            size="small"
            loading={isLoading}
            pagination={{ pageSize: 15 }}
            scroll={{ x: scrollX }}
            sticky
            components={{ header: { cell: ResizableTitle } }}
          />
        </div>
      ) : (
        <div className="py-8 text-center">
          <Text type="secondary">
            Set filters above and click Generate to load data.
          </Text>
        </div>
      )}
    </div>
  );
}

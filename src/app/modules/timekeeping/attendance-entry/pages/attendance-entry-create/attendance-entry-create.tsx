import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Typography,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableColumnsType } from "antd";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { useNavigate } from "@tanstack/react-router";
import type { EmployeeFilterResponse } from "../../models/api/response/employee-filter-response.model";
import type { CreateAttendanceEntry } from "../../models/api/request/create-attendance-entry.model";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import {
  useCreateAttendanceEntries,
  useEmployeeFilter,
} from "../../hooks/use-attendance-entry-queries";
import { ATTENDANCE_ENTRY_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const { Title, Text } = Typography;

interface CommittedFilter {
  branchId?: string | null;
  departmentId?: string | null;
  clientId?: string | null;
  payrollGroupId?: string | null;
  operationAreaId?: string | null;
}

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

function parseDayOffset(timeStr: string): number {
  const dotIdx = timeStr.indexOf(".");
  return dotIdx > 0 ? parseInt(timeStr.slice(0, dotIdx), 10) : 0;
}

function shiftTimeToDayjs(timeStr: string): Dayjs {
  const dotIdx = timeStr.indexOf(".");
  const hms = dotIdx > 0 ? timeStr.slice(dotIdx + 1) : timeStr;
  const [h, m] = hms.split(":").map(Number);
  return dayjs().hour(h).minute(m).second(0).millisecond(0);
}

function formatShiftTime(timeStr: string): string {
  const dotIdx = timeStr.indexOf(".");
  if (dotIdx > 0) {
    const dayOffset = parseInt(timeStr.slice(0, dotIdx), 10);
    const [h, m] = timeStr.slice(dotIdx + 1).split(":");
    return `+${dayOffset}d ${h}:${m}`;
  }
  const [h, m] = timeStr.split(":");
  return `${h}:${m}`;
}

export default function AttendanceEntryCreate() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // Pending filter state (what's in the dropdowns, not yet searched)
  const [branchId, setBranchId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [payrollGroupId, setPayrollGroupId] = useState<string | null>(null);
  const [operationAreaId, setOperationAreaId] = useState<string | null>(null);

  // Committed filter — null means "not yet searched"
  const [committedFilter, setCommittedFilter] =
    useState<CommittedFilter | null>(null);
  const [employeeSearchKey, setEmployeeSearchKey] = useState(0);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [timeShiftId, setTimeShiftId] = useState<string | null>(null);
  const [includeIn, setIncludeIn] = useState(true);
  const [inTime, setInTime] = useState<Dayjs | null>(null);
  const [includeOut, setIncludeOut] = useState(true);
  const [outTime, setOutTime] = useState<Dayjs | null>(null);
  const [outDayOffset, setOutDayOffset] = useState(0);

  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployeeFilter(
      {
        branchId: committedFilter?.branchId ?? undefined,
        departmentId: committedFilter?.departmentId ?? undefined,
        clientId: committedFilter?.clientId ?? undefined,
        payrollGroupId: committedFilter?.payrollGroupId ?? undefined,
        operationAreaId: committedFilter?.operationAreaId ?? undefined,
      },
      { enabled: committedFilter !== null, searchKey: employeeSearchKey },
    );

  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: timeShifts = [] } = useFixedTimeShifts();
  const { mutateAsync: createEntries, isPending: isSubmitting } =
    useCreateAttendanceEntries();

  const { widths, handleResize } = useResizableColumns({
    name: 150,
    departmentName: 160,
    branchName: 140,
    clientName: 140,
    payrollGroupName: 140,
    areaName: 140,
  });

  const hasSearched = committedFilter !== null;

  const handleSearch = () => {
    setSelectedIds(new Set());
    setCommittedFilter({
      branchId,
      departmentId: deptId,
      clientId,
      payrollGroupId,
      operationAreaId,
    });
    setEmployeeSearchKey((k) => k + 1);
  };

  const allChecked =
    employees.length > 0 && employees.every((e) => selectedIds.has(e.id));

  const someChecked =
    !allChecked && employees.some((e) => selectedIds.has(e.id));

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () =>
    setSelectedIds(new Set(employees.map((e) => e.id)));

  const handleDeselectAll = () => setSelectedIds(new Set());

  const handleInTimeChange = (t: Dayjs | null) => {
    setInTime(t);
    if (t && outTime && includeOut) {
      const inMin = t.hour() * 60 + t.minute();
      const outMin = outTime.hour() * 60 + outTime.minute();
      setOutDayOffset(outMin < inMin ? 1 : 0);
    }
  };

  const handleOutTimeChange = (t: Dayjs | null) => {
    setOutTime(t);
    if (t && inTime && includeIn) {
      const outMin = t.hour() * 60 + t.minute();
      const inMin = inTime.hour() * 60 + inTime.minute();
      setOutDayOffset(outMin < inMin ? 1 : 0);
    }
  };

  const handleTimeShiftChange = (v: string | undefined) => {
    const id = v ?? null;
    setTimeShiftId(id);
    if (id) {
      const shift = timeShifts.find((ts) => ts.id === id);
      if (shift) {
        setInTime(shiftTimeToDayjs(shift.startTime));
        setOutTime(shiftTimeToDayjs(shift.endTime));
        setOutDayOffset(parseDayOffset(shift.endTime));
      }
    }
  };

  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: `${b.code} - ${b.name}`,
  }));
  const deptOptions = departments.map((d) => ({
    value: d.id,
    label: `${d.code} - ${d.name}`,
  }));
  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name}`,
  }));
  const payrollGroupOptions = payrollGroups.map((p) => ({
    value: p.id,
    label: `${p.code} - ${p.name}`,
  }));
  const areaOptions = areas.map((a) => ({
    value: a.id,
    label: `${a.code} - ${a.name}`,
  }));
  const timeShiftOptions = timeShifts.map((ts) => ({
    value: ts.id,
    label: `${ts.shiftName} (${formatShiftTime(ts.startTime)} – ${formatShiftTime(ts.endTime)})`,
  }));

  const dateCount = useMemo(() => {
    if (!dateRange) return 0;
    return dateRange[1].diff(dateRange[0], "day") + 1;
  }, [dateRange]);

  const punchCount = (includeIn ? 1 : 0) + (includeOut ? 1 : 0);
  const selectedCount = selectedIds.size;
  const totalEntries = selectedCount * dateCount * punchCount;

  const columns: TableColumnsType<EmployeeFilterResponse> = [
    {
      width: 40,
      title: (
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked}
          onChange={(e) =>
            e.target.checked ? handleSelectAll() : handleDeselectAll()
          }
        />
      ),
      render: (_: unknown, emp: EmployeeFilterResponse) => (
        <Checkbox
          checked={selectedIds.has(emp.id)}
          onChange={(e) => toggle(emp.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: widths.name,
      onHeaderCell: () =>
        ({
          width: widths.name,
          onResize: (w: number) => handleResize("name", w),
        }) as object,
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      width: widths.departmentName,
      onHeaderCell: () =>
        ({
          width: widths.departmentName,
          onResize: (w: number) => handleResize("departmentName", w),
        }) as object,
    },
    {
      title: "Branch",
      dataIndex: "branchName",
      key: "branchName",
      width: widths.branchName,
      onHeaderCell: () =>
        ({
          width: widths.branchName,
          onResize: (w: number) => handleResize("branchName", w),
        }) as object,
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
      width: widths.clientName,
      onHeaderCell: () =>
        ({
          width: widths.clientName,
          onResize: (w: number) => handleResize("clientName", w),
        }) as object,
    },
    {
      title: "Payroll Group",
      dataIndex: "payrollGroupName",
      key: "payrollGroupName",
      width: widths.payrollGroupName,
      onHeaderCell: () =>
        ({
          width: widths.payrollGroupName,
          onResize: (w: number) => handleResize("payrollGroupName", w),
        }) as object,
    },
    {
      title: "Project Site",
      dataIndex: "areaName",
      key: "areaName",
      width: widths.areaName,
      onHeaderCell: () =>
        ({
          width: widths.areaName,
          onResize: (w: number) => handleResize("areaName", w),
        }) as object,
    },
  ];

  const handleSubmit = async () => {
    if (!selectedIds.size) {
      messageApi.warning("Please select at least one employee.");
      return;
    }
    if (!dateRange) {
      messageApi.warning("Please select a date range.");
      return;
    }
    if (!includeIn && !includeOut) {
      messageApi.warning("Please include at least In Time or Out Time.");
      return;
    }
    if (includeIn && !inTime) {
      messageApi.warning("Please set the In Time.");
      return;
    }
    if (includeOut && !outTime) {
      messageApi.warning("Please set the Out Time.");
      return;
    }

    const [start, end] = dateRange;
    const entries: CreateAttendanceEntry[] = [];
    let current = start.startOf("day");
    const endDay = end.startOf("day");

    while (!current.isAfter(endDay)) {
      const punches: Dayjs[] = [];
      if (includeIn && inTime) {
        punches.push(
          current
            .hour(inTime.hour())
            .minute(inTime.minute())
            .second(0)
            .millisecond(0),
        );
      }
      if (includeOut && outTime) {
        punches.push(
          current
            .add(outDayOffset, "day")
            .hour(outTime.hour())
            .minute(outTime.minute())
            .second(0)
            .millisecond(0),
        );
      }

      for (const dt of punches) {
        for (const employeeId of selectedIds) {
          entries.push({
            workTime: dt.format("YYYY-MM-DDTHH:mm:ss"),
            employeeId,
          });
        }
      }
      current = current.add(1, "day");
    }

    try {
      await createEntries(entries);
      messageApi.success(`${entries.length} attendance entries created.`);
      navigate({ to: "/timekeeping/attendance-entry" });
    } catch {
      messageApi.error("Failed to create entries. Please try again.");
    }
  };

  const isSubmitDisabled =
    !selectedIds.size ||
    !dateRange ||
    (!includeIn && !includeOut) ||
    (includeIn && !inTime) ||
    (includeOut && !outTime) ||
    isSubmitting;

  return (
    <div className="content-page">
      {contextHolder}

      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {ATTENDANCE_ENTRY_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Batch-create attendance time logs for one or more employees.
            </p>
          </div>
          <Space>
            <Tag color="success">New Record</Tag>
            <Button
              onClick={() => navigate({ to: "/timekeeping/attendance-entry" })}
            >
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="How to create attendance entries"
        description={
          <ol className="m-0 pl-4 space-y-0.5 text-xs">
            <li>
              Set filters (Branch, Department, Client, etc.) then click{" "}
              <strong>Search Employees</strong>. All filters are optional.
            </li>
            <li>
              Check the employees you want to include. Use{" "}
              <strong>Select All</strong> to pick everyone in the results.
            </li>
            <li>
              Pick a <strong>Date Range</strong>. Optionally select a{" "}
              <strong>Time Shift</strong> to pre-fill the In/Out times.
            </li>
            <li>
              Adjust <strong>In Time</strong> / <strong>Out Time</strong> as
              needed — check <strong>+1d</strong> for overnight shifts — then
              click <strong>Save</strong>.
            </li>
          </ol>
        }
      />

      {/* Step 1 — Employee filters */}
      <Card
        size="small"
        className="mb-4"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Step 1 — Find Employees
          </Text>
        }
      >
        <Form layout="vertical">
          <div className="form-grid-3">
            <Form.Item label="Branch" className="mb-3">
              <Select
                placeholder="All branches"
                options={branchOptions}
                value={branchId ?? undefined}
                onChange={(v: string | undefined) => setBranchId(v ?? null)}
                showSearch={{ filterOption: filterByLabel }}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Department" className="mb-3">
              <Select
                placeholder="All departments"
                options={deptOptions}
                value={deptId ?? undefined}
                onChange={(v: string | undefined) => setDeptId(v ?? null)}
                showSearch={{ filterOption: filterByLabel }}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Client" className="mb-3">
              <Select
                placeholder="All clients"
                options={clientOptions}
                value={clientId ?? undefined}
                onChange={(v: string | undefined) => setClientId(v ?? null)}
                showSearch={{ filterOption: filterByLabel }}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Payroll Group" className="mb-0">
              <Select
                placeholder="All payroll groups"
                options={payrollGroupOptions}
                value={payrollGroupId ?? undefined}
                onChange={(v: string | undefined) =>
                  setPayrollGroupId(v ?? null)
                }
                showSearch={{ filterOption: filterByLabel }}
                allowClear
              />
            </Form.Item>
            <Form.Item label="Project Site" className="mb-0">
              <Select
                placeholder="All project sites"
                options={areaOptions}
                value={operationAreaId ?? undefined}
                onChange={(v: string | undefined) =>
                  setOperationAreaId(v ?? null)
                }
                showSearch={{ filterOption: filterByLabel }}
                allowClear
              />
            </Form.Item>
            <Form.Item label="&nbsp;" className="mb-0">
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                style={{ width: "100%" }}
              >
                Search Employees
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      {/* Step 2 — Select employees */}
      {hasSearched && (
        <div className="flex items-center justify-between mb-2">
          <Text type="secondary" style={{ fontSize: 13 }}>
            {employees.length} employee{employees.length !== 1 ? "s" : ""} found
            {selectedCount > 0 && (
              <Text strong style={{ fontSize: 13 }}>
                {" · "}
                {selectedCount} selected
              </Text>
            )}
          </Text>
          <div className="flex gap-2">
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={employees.length === 0 || allChecked}
            >
              Select All
            </Button>
            <Button
              size="small"
              onClick={handleDeselectAll}
              disabled={selectedCount === 0}
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      <Table<EmployeeFilterResponse>
        rowKey="id"
        columns={columns}
        dataSource={employees}
        loading={isEmployeesLoading}
        size="small"
        pagination={{ pageSize: 10, size: "small", showSizeChanger: false }}
        className="mb-4"
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: hasSearched
            ? "No employees found for the selected filters."
            : "Set filters above and click Search Employees to load employees.",
        }}
        components={{ header: { cell: ResizableTitle } }}
      />

      {/* Step 3 — Date range and work time */}
      <Card
        size="small"
        className="mb-4"
        title={
          <Text strong style={{ fontSize: 13 }}>
            Step 2 — Set Date Range &amp; Work Time
          </Text>
        }
      >
        <Form layout="vertical">
          <div className="form-grid-2">
            <Form.Item label="Date Range" required className="mb-3">
              <MobileRangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={(range) => {
                  if (range?.[0] && range[1]) {
                    setDateRange([range[0], range[1]]);
                  } else {
                    setDateRange(null);
                  }
                }}
              />
            </Form.Item>
            <Form.Item label="Time Shift (optional pre-fill)" className="mb-3">
              <Select
                placeholder="Select to pre-fill In / Out times"
                options={timeShiftOptions}
                value={timeShiftId ?? undefined}
                onChange={handleTimeShiftChange}
                showSearch={{ filterOption: filterByLabel }}
                allowClear
              />
            </Form.Item>
          </div>
          <div className="form-grid-2">
            <Form.Item className="mb-0">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={includeIn}
                  onChange={(e) => setIncludeIn(e.target.checked)}
                >
                  In Time
                </Checkbox>
                <TimePicker
                  format="HH:mm"
                  minuteStep={5}
                  value={inTime}
                  onChange={handleInTimeChange}
                  disabled={!includeIn}
                  style={{ flex: 1 }}
                />
              </div>
            </Form.Item>
            <Form.Item className="mb-0">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={includeOut}
                  onChange={(e) => setIncludeOut(e.target.checked)}
                >
                  Out Time
                </Checkbox>
                <TimePicker
                  format="HH:mm"
                  minuteStep={5}
                  value={outTime}
                  onChange={handleOutTimeChange}
                  disabled={!includeOut}
                  style={{ flex: 1 }}
                />
                <Checkbox checked={outDayOffset === 1} disabled>
                  +1d
                </Checkbox>
              </div>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button
            onClick={() => navigate({ to: "/timekeeping/attendance-entry" })}
          >
            {NAVIGATION_BUTTON_LABEL.BACK}
          </Button>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {totalEntries > 0
              ? `${NAVIGATION_BUTTON_LABEL.SAVE} (${totalEntries} ${totalEntries === 1 ? "entry" : "entries"})`
              : NAVIGATION_BUTTON_LABEL.SAVE}
          </Button>
        </Space>
      </div>
    </div>
  );
}

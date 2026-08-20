import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  DatePicker,
  Drawer,
  Form,
  Select,
  Table,
  TimePicker,
  Typography,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { CreateAttendanceEntry } from "../../models/api/request/create-attendance-entry.model";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { usePayrollGroups } from "@/app/modules/setup/payroll-group/hooks/use-payroll-group-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useFixedTimeShifts } from "@/app/modules/setup/time-shift/fixed/hooks/use-fixed-time-shift-queries";
import { useCreateAttendanceEntries } from "../../hooks/use-attendance-entry-queries";

const { Text } = Typography;

const filterByLabel = (
  input: string,
  option?: { label?: string | number | boolean },
) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

/** Extracts the day offset from "d.HH:mm:ss" (returns 0 for plain "HH:mm:ss"). */
function parseDayOffset(timeStr: string): number {
  const dotIdx = timeStr.indexOf(".");
  return dotIdx > 0 ? parseInt(timeStr.slice(0, dotIdx), 10) : 0;
}

/** Parses "HH:mm:ss" or "d.HH:mm:ss" into a Dayjs (time portion only). */
function shiftTimeToDayjs(timeStr: string): Dayjs {
  const dotIdx = timeStr.indexOf(".");
  const hms = dotIdx > 0 ? timeStr.slice(dotIdx + 1) : timeStr;
  const [h, m] = hms.split(":").map(Number);
  return dayjs().hour(h).minute(m).second(0).millisecond(0);
}

/** Formats "HH:mm:ss" or "d.HH:mm:ss" for the shift dropdown label. */
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

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAttendanceEntryDrawer({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [branchId, setBranchId] = useState<string | null>(null);
  const [deptId, setDeptId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [payrollGroupId, setPayrollGroupId] = useState<string | null>(null);
  const [operationAreaId, setOperationAreaId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [timeShiftId, setTimeShiftId] = useState<string | null>(null);
  const [includeIn, setIncludeIn] = useState(true);
  const [inTime, setInTime] = useState<Dayjs | null>(null);
  const [inDayOffset, setInDayOffset] = useState(0);
  const [includeOut, setIncludeOut] = useState(true);
  const [outTime, setOutTime] = useState<Dayjs | null>(null);
  const [outDayOffset, setOutDayOffset] = useState(0);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: employees = [], isLoading: isEmployeesLoading } =
    useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: clients = [] } = useClients();
  const { data: payrollGroups = [] } = usePayrollGroups();
  const { data: areas = [] } = useOperationAreas();
  const { data: branches = [] } = useBranches();
  const { data: timeShifts = [] } = useFixedTimeShifts();
  const { mutateAsync: createEntries, isPending: isSubmitting } =
    useCreateAttendanceEntries();

  const { widths, handleResize } = useResizableColumns({
    employeeNo: 120,
    name: 150,
    department: 160,
  });

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) => {
        if (branchId && emp.branchId !== branchId) return false;
        if (deptId && emp.departmentId !== deptId) return false;
        if (clientId && emp.clientId !== clientId) return false;
        if (payrollGroupId && emp.payrollGroupId !== payrollGroupId)
          return false;
        if (operationAreaId && emp.areaId !== operationAreaId) return false;
        return true;
      }),
    [employees, branchId, deptId, clientId, payrollGroupId, operationAreaId],
  );

  const deptMap = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments],
  );

  const allFilteredChecked =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((e) => selectedIds.has(e.id));

  const someFilteredChecked =
    !allFilteredChecked && filteredEmployees.some((e) => selectedIds.has(e.id));

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () =>
    setSelectedIds(new Set(filteredEmployees.map((e) => e.id)));

  const handleDeselectAll = () => setSelectedIds(new Set());

  const clearFilter = (setter: () => void) => {
    setter();
    setSelectedIds(new Set());
  };

  const handleTimeShiftChange = (v: string | undefined) => {
    const id = v ?? null;
    setTimeShiftId(id);
    if (id) {
      const shift = timeShifts.find((ts) => ts.id === id);
      if (shift) {
        setInTime(shiftTimeToDayjs(shift.startTime));
        setInDayOffset(parseDayOffset(shift.startTime));
        setOutTime(shiftTimeToDayjs(shift.endTime));
        setOutDayOffset(parseDayOffset(shift.endTime));
      }
    }
  };

  const timeShiftOptions = timeShifts.map((ts) => ({
    value: ts.id,
    label: `${ts.shiftName} (${formatShiftTime(ts.startTime)} – ${formatShiftTime(ts.endTime)})`,
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
  const branchOptions = branches.map((b) => ({
    value: b.id,
    label: `${b.code} - ${b.name}`,
  }));

  const dateCount = useMemo(() => {
    if (!dateRange) return 0;
    return dateRange[1].diff(dateRange[0], "day") + 1;
  }, [dateRange]);

  const punchCount = (includeIn ? 1 : 0) + (includeOut ? 1 : 0);
  const selectedCount = selectedIds.size;
  const totalEntries = selectedCount * dateCount * punchCount;

  const columns: TableColumnsType<EmployeeResponse> = [
    {
      width: 40,
      title: (
        <Checkbox
          checked={allFilteredChecked}
          indeterminate={someFilteredChecked}
          onChange={(e) =>
            e.target.checked ? handleSelectAll() : handleDeselectAll()
          }
        />
      ),
      render: (_: unknown, emp: EmployeeResponse) => (
        <Checkbox
          checked={selectedIds.has(emp.id)}
          onChange={(e) => toggle(emp.id, e.target.checked)}
        />
      ),
    },
    {
      title: "Employee No",
      dataIndex: "employeeNo",
      key: "employeeNo",
      width: widths.employeeNo,
      onHeaderCell: () =>
        ({
          width: widths.employeeNo,
          onResize: (w: number) => handleResize("employeeNo", w),
        }) as object,
    },
    {
      title: "Name",
      key: "name",
      width: widths.name,
      onHeaderCell: () =>
        ({
          width: widths.name,
          onResize: (w: number) => handleResize("name", w),
        }) as object,
      render: (_: unknown, emp: EmployeeResponse) =>
        `${emp.lastName}, ${emp.firstName}`,
    },
    {
      title: "Department",
      key: "department",
      width: widths.department,
      onHeaderCell: () =>
        ({
          width: widths.department,
          onResize: (w: number) => handleResize("department", w),
        }) as object,
      render: (_: unknown, emp: EmployeeResponse) =>
        emp.departmentId ? deptMap.get(emp.departmentId) : undefined,
    },
  ];

  const handleClose = () => {
    setBranchId(null);
    setDeptId(null);
    setClientId(null);
    setPayrollGroupId(null);
    setOperationAreaId(null);
    setSelectedIds(new Set());
    setDateRange(null);
    setTimeShiftId(null);
    setIncludeIn(true);
    setInTime(null);
    setInDayOffset(0);
    setIncludeOut(true);
    setOutTime(null);
    setOutDayOffset(0);
    onClose();
  };

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
            .add(inDayOffset, "day")
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
      handleClose();
      onSuccess();
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
    <Drawer
      title="New Attendance Entry"
      width={720}
      open={open}
      onClose={handleClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
          >
            {totalEntries > 0
              ? `Submit (${totalEntries} ${totalEntries === 1 ? "entry" : "entries"})`
              : "Submit"}
          </Button>
        </div>
      }
    >
      {contextHolder}

      <Form layout="vertical">
        <div className="form-grid-3">
          <Form.Item label="Branch" className="mb-3">
            <Select
              placeholder="All branches"
              options={branchOptions}
              value={branchId ?? undefined}
              onChange={(v: string | undefined) =>
                clearFilter(() => setBranchId(v ?? null))
              }
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Department" className="mb-3">
            <Select
              placeholder="All departments"
              options={deptOptions}
              value={deptId ?? undefined}
              onChange={(v: string | undefined) =>
                clearFilter(() => setDeptId(v ?? null))
              }
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Client" className="mb-3">
            <Select
              placeholder="All clients"
              options={clientOptions}
              value={clientId ?? undefined}
              onChange={(v: string | undefined) =>
                clearFilter(() => setClientId(v ?? null))
              }
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Payroll Group" className="mb-3">
            <Select
              placeholder="All payroll groups"
              options={payrollGroupOptions}
              value={payrollGroupId ?? undefined}
              onChange={(v: string | undefined) =>
                clearFilter(() => setPayrollGroupId(v ?? null))
              }
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Project Site" className="mb-3">
            <Select
              placeholder="All project sites"
              options={areaOptions}
              value={operationAreaId ?? undefined}
              onChange={(v: string | undefined) =>
                clearFilter(() => setOperationAreaId(v ?? null))
              }
              showSearch={{ filterOption: filterByLabel }}
              allowClear
            />
          </Form.Item>
        </div>
      </Form>

      <div className="flex items-center justify-between mb-2">
        <Text type="secondary" style={{ fontSize: 13 }}>
          {filteredEmployees.length} employee
          {filteredEmployees.length !== 1 ? "s" : ""}
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
            disabled={filteredEmployees.length === 0 || allFilteredChecked}
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

      <Table<EmployeeResponse>
        rowKey="id"
        columns={columns}
        dataSource={filteredEmployees}
        loading={isEmployeesLoading}
        size="small"
        pagination={{ pageSize: 8, size: "small", showSizeChanger: false }}
        scroll={{ x: "max-content", y: 260 }}
        className="mb-5"
        components={{ header: { cell: ResizableTitle } }}
      />

      <Form layout="vertical">
        <div className="form-grid-2">
          <Form.Item label="Date Range" required className="mb-3">
            <DatePicker.RangePicker
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
          <Form.Item label="Time Shift" className="mb-3">
            <Select
              placeholder="Select to pre-fill times"
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
                onChange={(t) => setInTime(t)}
                disabled={!includeIn}
                style={{ flex: 1 }}
              />
              <Checkbox
                checked={inDayOffset === 1}
                disabled={!includeIn}
                onChange={(e) => setInDayOffset(e.target.checked ? 1 : 0)}
              >
                +1d
              </Checkbox>
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
                onChange={(t) => setOutTime(t)}
                disabled={!includeOut}
                style={{ flex: 1 }}
              />
              <Checkbox
                checked={outDayOffset === 1}
                disabled={!includeOut}
                onChange={(e) => setOutDayOffset(e.target.checked ? 1 : 0)}
              >
                +1d
              </Checkbox>
            </div>
          </Form.Item>
        </div>
      </Form>
    </Drawer>
  );
}

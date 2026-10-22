import { useEffect, useRef, useState } from "react";
import {
  Button,
  Collapse,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  theme,
} from "antd";
import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import {
  useCreateAttendanceEntries,
  useRemoveAttendanceLog,
  useRemovedShiftLogs,
  useRestoreOriginalLog,
  useShiftAttendanceLogs,
  useUpdateAttendanceEntry,
} from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { useAttendanceLogActions } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-log-actions";
import { ORIGINAL_KEPT_SOURCES } from "@/app/modules/timekeeping/attendance-entry/constants/attendance-log-permissions.const";
import { getNotify } from "@/shared/utils/notify";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { describeShift } from "./describe-shift";
import { useBranches } from "@/app/modules/setup/branch/hooks/use-branch-queries";
import { useClients } from "@/app/modules/setup/client/hooks/use-client-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { useDepartments } from "@/app/modules/setup/department/hooks/use-department-queries";
import type { AttendanceEntryResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/attendance-entry-response.model";
import type { RemovedAttendanceLog } from "@/app/modules/timekeeping/attendance-entry/models/api/response/removed-attendance-log.model";

interface NewLogLocation {
  branchId: string | null;
  clientId: string | null;
  operationAreaId: string | null;
  departmentId: string | null;
}

const NO_LOCATION: NewLogLocation = {
  branchId: null,
  clientId: null,
  operationAreaId: null,
  departmentId: null,
};

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string | null | undefined;
  workDate: string;
  startTime?: string | null;
  endTime?: string | null;
  timeShiftId?: string | null;
  /** The day's scheduled shift -- shown as a guide for which times to enter. */
  shiftName?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
}

export default function DtrAttendanceLogsModal({
  open,
  onClose,
  employeeId,
  employeeName,
  workDate,
  startTime,
  endTime,
  timeShiftId,
  shiftName,
  shiftStartTime,
  shiftEndTime,
}: Props) {
  const shiftLabel = describeShift(shiftName, shiftStartTime, shiftEndTime);
  const { token } = theme.useToken();
  // Same permissions the attendance endpoints enforce (AttendanceController). Editing and
  // removing need the permission for the log's own source (manual, uploaded, synced).
  const canViewLogs = useHasPermission("Attendance Manual Entry:View");
  const actionsFor = useAttendanceLogActions();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<Dayjs | null>(null);
  const [editingRemarks, setEditingRemarks] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [fetchKey, setFetchKey] = useState(0);
  const prevOpen = useRef(false);

  useEffect(() => {
    if (open && !prevOpen.current) {
      setFetchKey((k) => k + 1);
    }
    prevOpen.current = open;
  }, [open]);

  const fromDate = startTime ? dayjs(startTime).format("YYYY-MM-DD") : workDate;
  const toDate = endTime ? dayjs(endTime).format("YYYY-MM-DD") : workDate;

  const dateLabel = fromDate !== toDate ? `${fromDate} – ${toDate}` : fromDate;

  // startTime/endTime (this row's own already-computed actual first-in/last-out) are passed
  // as the actualStart/actualEnd bracket when known. Either or both can legitimately be
  // missing — no attendance at all that day, or an incomplete pair (only a clock-in or
  // clock-out) — in which case the backend falls back to the whole work date instead.
  const {
    data: records = [],
    isFetching,
    refetch,
  } = useShiftAttendanceLogs(
    {
      employeeId,
      workDate,
      timeShiftId,
      actualStart: startTime,
      actualEnd: endTime,
    },
    {
      enabled: open && canViewLogs && !!employeeId && !!workDate,
      searchKey: fetchKey,
    },
  );

  const { data: removedLogs = [], isFetching: isFetchingRemoved } =
    useRemovedShiftLogs(
      { employeeId, workDate, timeShiftId },
      {
        enabled: open && canViewLogs && !!employeeId && !!workDate,
        searchKey: fetchKey,
      },
    );

  const { mutateAsync: updateEntry, isPending: isSaving } =
    useUpdateAttendanceEntry();
  const { mutateAsync: removeEntry } = useRemoveAttendanceLog();
  const { mutateAsync: restoreOriginal } = useRestoreOriginalLog();
  const { mutateAsync: createEntries, isPending: isAdding } =
    useCreateAttendanceEntries();

  // Adding a manual time log for this employee, from inside the DTR.
  const [adding, setAdding] = useState(false);
  const [newTime, setNewTime] = useState<Dayjs | null>(null);
  // The picker starts on the DTR day at 00:00; Save waits for a real time to be picked, so an
  // untouched default never saves a midnight log (outside the shift, so it wouldn't even list).
  const [timePicked, setTimePicked] = useState(false);
  const [newRemarks, setNewRemarks] = useState("");
  // Where the punch happened -- blank keeps the employee's own assignment.
  const [newLocation, setNewLocation] = useState<NewLogLocation>(NO_LOCATION);

  const { data: branches = [] } = useBranches();
  const { data: clients = [] } = useClients();
  const { data: areas = [] } = useOperationAreas();
  const { data: departments = [] } = useDepartments();
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.name }));
  const areaOptions = areas
    .filter((a) => !newLocation.branchId || a.branchId === newLocation.branchId)
    .map((a) => ({ value: a.id, label: a.name }));
  const departmentOptions = departments.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const startAdd = () => {
    cancelEdit();
    setAdding(true);
    setNewTime(dayjs(workDate));
    setTimePicked(false);
    setNewRemarks("");
    setNewLocation(NO_LOCATION);
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewTime(null);
    setTimePicked(false);
    setNewRemarks("");
    setNewLocation(NO_LOCATION);
  };

  const pickNewTime = (value: Dayjs | null) => {
    setNewTime(value);
    setTimePicked(value !== null);
  };

  const canSaveAdd = !!newTime && timePicked && !!newRemarks.trim();

  const saveAdd = async () => {
    if (!newTime || !canSaveAdd) return;
    try {
      await createEntries([
        {
          employeeId,
          workTime: newTime
            .second(0)
            .millisecond(0)
            .format("YYYY-MM-DDTHH:mm:ss"),
          remarks: newRemarks.trim(),
          ...newLocation,
        },
      ]);
      getNotify().success({
        message: "Attendance log added.",
        description: "Regenerate the DTR to apply it to this day's hours.",
      });
      cancelAdd();
      refetch();
    } catch {
      getNotify().error({ message: "Failed to add attendance log." });
    }
  };

  const startEdit = (record: AttendanceEntryResponse) => {
    setEditingId(record.id);
    setEditingValue(record.timeLog ? dayjs(record.timeLog) : null);
    setEditingRemarks(record.remarks ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue(null);
    setEditingRemarks("");
  };

  const saveEdit = async (id: string) => {
    if (!editingValue || !editingRemarks.trim()) return;
    try {
      await updateEntry({
        id,
        workTime: editingValue
          .second(0)
          .millisecond(0)
          .format("YYYY-MM-DDTHH:mm:ss"),
        remarks: editingRemarks.trim(),
      });
      getNotify().success({ message: "Attendance log updated." });
      refetch();
    } catch {
      getNotify().error({ message: "Failed to update attendance log." });
    } finally {
      setEditingId(null);
      setEditingValue(null);
      setEditingRemarks("");
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await removeEntry({ id, reason: removeReason.trim() || undefined });
      getNotify().success({ message: "Attendance log removed." });
      refetch();
    } catch {
      getNotify().error({ message: "Failed to remove attendance log." });
    } finally {
      setDeletingId(null);
      setRemoveReason("");
    }
  };

  const handleRestore = async (originalLogId: string) => {
    setRestoringId(originalLogId);
    try {
      await restoreOriginal(originalLogId);
      getNotify().success({
        message: "Original attendance log restored.",
        description: "Regenerate the DTR to apply it to this day's hours.",
      });
      refetch();
    } catch {
      getNotify().error({ message: "Failed to restore the original log." });
    } finally {
      setRestoringId(null);
    }
  };

  const columns: ColumnsType<AttendanceEntryResponse> = [
    {
      title: "Time Log",
      dataIndex: "timeLog",
      key: "timeLog",
      width: 220,
      render: (v: string, record) => {
        if (editingId === record.id) {
          return (
            <DatePicker
              showTime={{ format: "HH:mm" }}
              value={editingValue}
              onChange={setEditingValue}
              format="YYYY-MM-DD HH:mm"
              size="small"
              style={{ width: 190 }}
            />
          );
        }
        const time = v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "—";
        if (!record.originalTimeLog) return time;
        return (
          <Space size={4}>
            {time}
            <Tooltip
              title={`Original: ${dayjs(record.originalTimeLog).format("YYYY-MM-DD HH:mm")}`}
            >
              <Tag color="gold" className="me-0!">
                Edited
              </Tag>
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Log Source",
      dataIndex: "logSource",
      key: "logSource",
      width: 130,
      render: (v: string) =>
        v ? <Tag color={v === "BIOMETRIC" ? "blue" : "purple"}>{v}</Tag> : "—",
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Area",
      dataIndex: "area",
      key: "area",
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: 200,
      render: (v: string | null, record) => {
        if (editingId === record.id) {
          return (
            <Input
              size="small"
              placeholder="Why is this being edited? (required)"
              value={editingRemarks}
              onChange={(e) => setEditingRemarks(e.target.value)}
            />
          );
        }
        return v ? (
          <Tooltip title={v}>
            <span style={{ display: "inline-block", maxWidth: 180 }}>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {v}
              </span>
            </span>
          </Tooltip>
        ) : (
          "—"
        );
      },
    },
    {
      title: "",
      key: "actions",
      width: 130,
      fixed: "right",
      render: (_, record) => {
        const { canEdit, canDelete } = actionsFor(record.logSource);
        if (!canEdit && !canDelete) return null;

        if (editingId === record.id) {
          return (
            <Space size={4}>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: token.colorSuccess }}
                loading={isSaving}
                disabled={!editingValue || !editingRemarks.trim()}
                onClick={() => saveEdit(record.id)}
              />
              <Button
                type="text"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={cancelEdit}
              />
            </Space>
          );
        }

        const originalLogId = record.originalLogId;
        const originalTimeLog = record.originalTimeLog;
        const keepsOriginal = ORIGINAL_KEPT_SOURCES.includes(record.logSource);
        return (
          <Space size={4}>
            {canEdit && (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => startEdit(record)}
              />
            )}
            {canEdit && originalLogId && originalTimeLog && (
              <Popconfirm
                title="Restore the original time?"
                description={`Puts back ${dayjs(originalTimeLog).format("YYYY-MM-DD HH:mm")}, as the file/device had it.`}
                onConfirm={() => handleRestore(originalLogId)}
                okText="Restore"
                cancelText="Cancel"
              >
                <Tooltip title="Restore original">
                  <Button
                    type="text"
                    size="small"
                    icon={<RollbackOutlined />}
                    loading={restoringId === originalLogId}
                  />
                </Tooltip>
              </Popconfirm>
            )}
            {canDelete && (
              <Popconfirm
                title="Remove this attendance log?"
                description={
                  keepsOriginal ? (
                    <div className="flex max-w-72 flex-col gap-2">
                      <span>
                        The original is kept and can be restored. A re-upload or
                        device re-sync won&apos;t bring it back.
                      </span>
                      <Input
                        size="small"
                        placeholder="Reason (required)"
                        value={removeReason}
                        onChange={(e) => setRemoveReason(e.target.value)}
                      />
                    </div>
                  ) : undefined
                }
                onOpenChange={(isOpen) => {
                  if (isOpen) setRemoveReason("");
                }}
                onConfirm={() => handleDelete(record.id)}
                okText="Remove"
                cancelText="Cancel"
                okButtonProps={{
                  danger: true,
                  disabled: keepsOriginal && !removeReason.trim(),
                }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deletingId === record.id}
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const removedColumns: ColumnsType<RemovedAttendanceLog> = [
    {
      title: "Time Log",
      dataIndex: "workDateTime",
      key: "workDateTime",
      width: 170,
      render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: "Log Source",
      dataIndex: "logSource",
      key: "logSource",
      width: 110,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (v: string) => v || "—",
    },
    {
      title: "Removed",
      key: "removed",
      render: (_, record) => (
        <div className="flex flex-col">
          <span>{record.removedBy || "—"}</span>
          <span className="text-xs text-gray-500">
            {dayjs(record.removedAt).format("YYYY-MM-DD HH:mm")}
          </span>
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      fixed: "right",
      render: (_, record) =>
        actionsFor(record.logSource).canDelete ? (
          <Popconfirm
            title="Restore this attendance log?"
            description="Puts the log back as the file/device had it."
            onConfirm={() => handleRestore(record.id)}
            okText="Restore"
            cancelText="Cancel"
          >
            <Tooltip title="Restore">
              <Button
                type="text"
                size="small"
                icon={<RollbackOutlined />}
                loading={restoringId === record.id}
              />
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => {
        cancelEdit();
        cancelAdd();
        onClose();
      }}
      footer={null}
      title={
        <div>
          <div>Attendance Logs</div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: token.colorTextTertiary,
            }}
          >
            {employeeName ?? employeeId} &mdash; {dateLabel}
          </div>
          {shiftLabel && (
            <Tag
              icon={<ClockCircleOutlined />}
              color="processing"
              className="mt-1.5! font-normal!"
            >
              Shift: {shiftLabel}
            </Tag>
          )}
        </div>
      }
      width={760}
      destroyOnClose
    >
      <Table<AttendanceEntryResponse>
        rowKey="id"
        columns={columns}
        dataSource={records}
        loading={isFetching}
        size="small"
        pagination={false}
        scroll={{ x: "max-content" }}
        locale={{
          emptyText: canViewLogs
            ? "No attendance logs found for this date."
            : "You don't have permission to view attendance logs (Attendance Manual Entry: View).",
        }}
      />
      {removedLogs.length > 0 && (
        <Collapse
          size="small"
          className="mt-3"
          items={[
            {
              key: "removed",
              label: `Removed logs (${removedLogs.length})`,
              children: (
                <Table<RemovedAttendanceLog>
                  rowKey="id"
                  columns={removedColumns}
                  dataSource={removedLogs}
                  loading={isFetchingRemoved}
                  size="small"
                  pagination={false}
                  scroll={{ x: "max-content" }}
                />
              ),
            },
          ]}
        />
      )}
      <PermissionGate permission="Attendance Manual Entry:Edit">
        {adding ? (
          <Form layout="vertical" className="mt-3">
            <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
              <Form.Item label="Time Log" required className="mb-3!">
                <DatePicker
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Time log"
                  value={newTime}
                  onChange={pickNewTime}
                  needConfirm={false}
                  status={timePicked ? undefined : "warning"}
                  className="w-full!"
                />
              </Form.Item>
              <Form.Item label="Branch" className="mb-3!">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Employee's branch"
                  options={branchOptions}
                  value={newLocation.branchId ?? undefined}
                  onChange={(v) =>
                    // Project Site is restricted to the selected Branch.
                    setNewLocation((c) => ({
                      ...c,
                      branchId: v ?? null,
                      operationAreaId: null,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label="Client" className="mb-3!">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Employee's client"
                  options={clientOptions}
                  value={newLocation.clientId ?? undefined}
                  onChange={(v) =>
                    setNewLocation((c) => ({ ...c, clientId: v ?? null }))
                  }
                />
              </Form.Item>
              <Form.Item label="Project Site" className="mb-3!">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Employee's project site"
                  options={areaOptions}
                  value={newLocation.operationAreaId ?? undefined}
                  onChange={(v) =>
                    setNewLocation((c) => ({
                      ...c,
                      operationAreaId: v ?? null,
                    }))
                  }
                />
              </Form.Item>
              <Form.Item label="Department" className="mb-3!">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="Employee's department"
                  options={departmentOptions}
                  value={newLocation.departmentId ?? undefined}
                  onChange={(v) =>
                    setNewLocation((c) => ({ ...c, departmentId: v ?? null }))
                  }
                />
              </Form.Item>
              <Form.Item label="Remarks" required className="mb-3!">
                <Input
                  placeholder="Why is this being entered manually?"
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  onPressEnter={saveAdd}
                />
              </Form.Item>
            </div>
            <div className="flex justify-end">
              <Space size={4}>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  loading={isAdding}
                  disabled={!canSaveAdd}
                  onClick={saveAdd}
                >
                  Save
                </Button>
                <Button icon={<CloseOutlined />} onClick={cancelAdd}>
                  Cancel
                </Button>
              </Space>
            </div>
          </Form>
        ) : (
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={startAdd}
            className="mt-3"
            block
          >
            Add time log
          </Button>
        )}
      </PermissionGate>
    </Modal>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  theme,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import type { ColumnsType } from "antd/es/table";
import {
  useDeleteAttendanceEntryLog,
  useShiftAttendanceLogs,
  useUpdateAttendanceEntry,
} from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import { getNotify } from "@/shared/utils/notify";
import type { AttendanceEntryResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/attendance-entry-response.model";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string | null | undefined;
  workDate: string;
  startTime?: string | null;
  endTime?: string | null;
  timeShiftId?: string | null;
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
}: Props) {
  const { token } = theme.useToken();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<Dayjs | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    { enabled: open && !!employeeId && !!workDate, searchKey: fetchKey },
  );

  const { mutateAsync: updateEntry, isPending: isSaving } =
    useUpdateAttendanceEntry();
  const { mutateAsync: deleteEntry } = useDeleteAttendanceEntryLog();

  const startEdit = (record: AttendanceEntryResponse) => {
    setEditingId(record.id);
    setEditingValue(record.timeLog ? dayjs(record.timeLog) : null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue(null);
  };

  const saveEdit = async (id: string) => {
    if (!editingValue) return;
    try {
      await updateEntry({
        id,
        workTime: editingValue
          .second(0)
          .millisecond(0)
          .format("YYYY-MM-DDTHH:mm:ss"),
      });
      getNotify().success({ message: "Attendance log updated." });
      refetch();
    } catch {
      getNotify().error({ message: "Failed to update attendance log." });
    } finally {
      setEditingId(null);
      setEditingValue(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEntry(id);
      getNotify().success({ message: "Attendance log deleted." });
      refetch();
    } catch {
      getNotify().error({ message: "Failed to delete attendance log." });
    } finally {
      setDeletingId(null);
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
        return v ? dayjs(v).format("YYYY-MM-DD HH:mm:ss") : "—";
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
      title: "",
      key: "actions",
      width: 110,
      fixed: "right",
      render: (_, record) => {
        if (record.logSource !== "MANUAL") return null;

        if (editingId === record.id) {
          return (
            <Space size={4}>
              <Button
                type="text"
                size="small"
                icon={<CheckOutlined />}
                style={{ color: token.colorSuccess }}
                loading={isSaving}
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

        return (
          <Space size={4}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => startEdit(record)}
            />
            <Popconfirm
              title="Delete this attendance log?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={deletingId === record.id}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => {
        cancelEdit();
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
        locale={{ emptyText: "No attendance logs found for this date." }}
      />
    </Modal>
  );
}

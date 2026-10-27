import { useMemo, useState } from "react";
import { Input, Popconfirm, Space, Table, Tag, Typography } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { RawAttendanceLog } from "../models/api/response/raw-attendance-log.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { tableEmptyLocale } from "@/shared/components/app-empty/table-empty-locale";
import { IconAction } from "@/shared/components/icon-action/icon-action";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { getNotify } from "@/shared/utils/notify";
import EditAttendanceEntryModal from "@/app/modules/timekeeping/attendance-entry/components/edit-attendance-entry-modal";
import { useAttendanceLogActions } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-log-actions";
import { useRemoveAttendanceLog } from "@/app/modules/timekeeping/attendance-entry/hooks/use-attendance-entry-queries";
import type { AttendanceEntryResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/attendance-entry-response.model";

const { Text } = Typography;

interface Props {
  data: RawAttendanceLog[];
  loading?: boolean;
}

// Tag colour per log source, so a glance at the column tells manual from device logs.
const SOURCE_COLOR: Record<string, string> = {
  BIOMETRIC: "green",
  MANUAL: "gold",
  UPLOADED: "geekblue",
  SYNC: "cyan",
  MOBILE: "purple",
  GEOFENCE: "magenta",
};

const EMPTY_CELL = <span className="text-gray-300">—</span>;

// The edit modal works on the manual-entry record shape.
const toEntry = (log: RawAttendanceLog): AttendanceEntryResponse => ({
  id: log.id,
  employeeId: log.employeeId,
  employeeName: log.name,
  timeLog: log.workDateTime,
  batchCode: log.batch || null,
  logSource: log.logSource,
  branch: log.branch,
  client: log.client,
  area: log.area,
  remarks: null,
  originalLogId: null,
  originalTimeLog: null,
});

export default function RawAttendanceTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<AttendanceEntryResponse | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const actionsFor = useAttendanceLogActions();
  const { mutateAsync: removeLog } = useRemoveAttendanceLog();

  const { widths, handleResize } = useResizableColumns({
    name: 150,
    workDateTime: 180,
    logSource: 130,
    batch: 200,
    branch: 130,
    client: 130,
    area: 130,
    actions: 90,
  });

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await removeLog({ id });
      getNotify().success({ message: "Attendance log removed." });
    } catch {
      // The error interceptor already shows the server's reason.
    } finally {
      setRemovingId(null);
    }
  };

  const columns: ColumnsType<RawAttendanceLog> = [
    {
      title: "Employee",
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
      title: "Work Date Time",
      dataIndex: "workDateTime",
      key: "workDateTime",
      width: widths.workDateTime,
      onHeaderCell: () =>
        ({
          width: widths.workDateTime,
          onResize: (w: number) => handleResize("workDateTime", w),
        }) as object,
      render: (v: string) => dayjs(v).format("MMM DD, YYYY hh:mm:ss A"),
    },
    {
      title: "Log Source",
      dataIndex: "logSource",
      key: "logSource",
      width: widths.logSource,
      onHeaderCell: () =>
        ({
          width: widths.logSource,
          onResize: (w: number) => handleResize("logSource", w),
        }) as object,
      render: (v: string) => <Tag color={SOURCE_COLOR[v]}>{v}</Tag>,
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: widths.branch,
      onHeaderCell: () =>
        ({
          width: widths.branch,
          onResize: (w: number) => handleResize("branch", w),
        }) as object,
      render: (v: string | null) => v ?? EMPTY_CELL,
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      width: widths.client,
      onHeaderCell: () =>
        ({
          width: widths.client,
          onResize: (w: number) => handleResize("client", w),
        }) as object,
      render: (v: string | null) => v ?? EMPTY_CELL,
    },
    {
      title: "Project Site",
      dataIndex: "area",
      key: "area",
      width: widths.area,
      onHeaderCell: () =>
        ({
          width: widths.area,
          onResize: (w: number) => handleResize("area", w),
        }) as object,
      render: (v: string | null) => v ?? EMPTY_CELL,
    },
    {
      title: "Batch",
      dataIndex: "batch",
      key: "batch",
      width: widths.batch,
      onHeaderCell: () =>
        ({
          width: widths.batch,
          onResize: (w: number) => handleResize("batch", w),
        }) as object,
      render: (v: string) =>
        v ? <Tag color="blue">{v}</Tag> : <Tag color="default">Manual</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: widths.actions,
      // Edit and Delete follow the log's own source permission (none for biometric logs).
      render: (_, record) => {
        const { canEdit, canDelete } = actionsFor(record.logSource);
        if (!canEdit && !canDelete) return null;
        return (
          <Space size={4}>
            {canEdit && (
              <IconAction
                title="Edit"
                icon={<EditOutlined />}
                onClick={() => setEditing(toEntry(record))}
              />
            )}
            {canDelete && (
              <Popconfirm
                title="Delete this time log?"
                description={
                  record.logSource === "MANUAL"
                    ? undefined
                    : "The original is kept and can be restored."
                }
                okText="Delete"
                okButtonProps={{ danger: true }}
                cancelText="Cancel"
                onConfirm={() => handleRemove(record.id)}
              >
                <span>
                  <IconAction
                    title="Delete"
                    danger
                    icon={<DeleteOutlined />}
                    loading={removingId === record.id}
                  />
                </span>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const filtered = search
    ? data.filter((item) =>
        [
          item.name,
          item.workDateTime,
          item.logSource,
          item.batch,
          item.branch,
          item.client,
          item.area,
        ].some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
        ),
      )
    : data;

  const summary = useMemo(() => {
    const employees = new Set(
      filtered.map((l) => l.employeeId ?? l.name).filter(Boolean),
    );
    const bySource = new Map<string, number>();
    for (const l of filtered)
      bySource.set(l.logSource, (bySource.get(l.logSource) ?? 0) + 1);
    return { employees: employees.size, bySource: [...bySource.entries()] };
  }, [filtered]);

  return (
    <div className="flex flex-col gap-3">
      <EditAttendanceEntryModal
        key={editing?.id}
        record={editing}
        onClose={() => setEditing(null)}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search employee, source, batch..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="max-w-xs"
        />
        <Space size={[8, 4]} wrap>
          <Text type="secondary">
            {filtered.length.toLocaleString()} log
            {filtered.length === 1 ? "" : "s"} ·{" "}
            {summary.employees.toLocaleString()} employee
            {summary.employees === 1 ? "" : "s"}
          </Text>
          {summary.bySource.map(([source, count]) => (
            <Tag key={source} color={SOURCE_COLOR[source]} className="me-0!">
              {source} {count.toLocaleString()}
            </Tag>
          ))}
        </Space>
      </div>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15, showSizeChanger: true }}
        scroll={{ x: "max-content" }}
        sticky
        locale={tableEmptyLocale("No attendance logs for these filters")}
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

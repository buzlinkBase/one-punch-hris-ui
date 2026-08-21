import { useMemo, useState } from "react";
import { Input, Table, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { RawColumnarAttendanceLog } from "../models/api/response/raw-attendance-log.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: RawColumnarAttendanceLog[];
  loading?: boolean;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const LOG_KEYS = Array.from(
  { length: 20 },
  (_, i) => `log${i + 1}` as keyof RawColumnarAttendanceLog,
);

function renderTime(v: string | null | undefined, workDate: string) {
  if (!v) return "";
  const t = dayjs(v);
  if (!t.isAfter(dayjs(workDate), "day")) return t.format("HH:mm");
  return (
    <span>
      {t.format("HH:mm")}
      <sup
        style={{
          color: "#1DA081",
          fontSize: 9,
          fontWeight: 700,
          marginLeft: 2,
        }}
      >
        +1
      </sup>
    </span>
  );
}

export default function RawColumnarTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    empNo: 80,
    fullName: 180,
    department: 110,
    workDate: 100,
    shiftName: 110,
    shiftStart: 90,
    shiftEnd: 90,

    ...Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`log${i + 1}`, 80]),
    ),
  });

  // Strip backend placeholder rows (empty employeeId)
  const valid = useMemo(
    () => data.filter((r) => r.employeeId !== EMPTY_GUID),
    [data],
  );

  // Only show log columns that have at least one non-null value
  const activeLogKeys = useMemo(
    () => LOG_KEYS.filter((k) => valid.some((r) => r[k] !== null)),
    [valid],
  );

  const filtered = useMemo(() => {
    if (!search) return valid;
    const q = search.toLowerCase();
    return valid.filter((r) =>
      [r.empNo, r.fullName, r.department, r.workDate, r.shiftName].some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [valid, search]);

  const identityColumns: ColumnsType<RawColumnarAttendanceLog> = [
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
      render: (v: string, record: RawColumnarAttendanceLog) =>
        renderTime(v, record.workDate),
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
      render: (v: string, record: RawColumnarAttendanceLog) =>
        renderTime(v, record.workDate),
    },
  ];

  const logColumns: ColumnsType<RawColumnarAttendanceLog> = activeLogKeys.map(
    (k, i) => ({
      title: `Log ${i + 1}`,
      key: k,
      width: widths[k as string] ?? 80,
      onHeaderCell: () =>
        ({
          width: widths[k as string] ?? 80,
          onResize: (w: number) => handleResize(k as string, w),
        }) as object,
      render: (_: unknown, record: RawColumnarAttendanceLog) => {
        const entry = record[k] as { attId: string; workTime: string } | null;
        if (!entry) return <span style={{ color: "#bbb" }}>—</span>;
        const t = dayjs(entry.workTime);
        const isCross = t.isAfter(dayjs(record.workDate), "day");
        return (
          <Tooltip title={t.format("MMM DD HH:mm")}>
            <span>
              {t.format("HH:mm")}
              {isCross && (
                <sup
                  style={{
                    color: "#1DA081",
                    fontSize: 9,
                    fontWeight: 700,
                    marginLeft: 2,
                  }}
                >
                  +1
                </sup>
              )}
            </span>
          </Tooltip>
        );
      },
    }),
  );

  const scrollX =
    identityColumns.reduce((sum, c) => sum + (Number(c.width) || 100), 0) +
    activeLogKeys.length * 80;

  return (
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
        columns={[...identityColumns, ...logColumns]}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: scrollX }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

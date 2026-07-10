import { useMemo, useState } from "react";
import { Input, Table, Tag, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { CleanAttendanceLogColumnar } from "../models/api/response/raw-attendance-log.model";

interface Props {
  data: CleanAttendanceLogColumnar[];
  loading?: boolean;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
const LOG_KEYS = Array.from(
  { length: 20 },
  (_, i) => `log${i + 1}` as keyof CleanAttendanceLogColumnar,
);

function fmtTime(v: string | null | undefined): string {
  if (!v) return "—";
  return dayjs(v).format("HH:mm");
}

function attStatus(r: CleanAttendanceLogColumnar): {
  label: string;
  color: string;
} {
  const count = LOG_KEYS.filter((k) => r[k] !== null).length;
  if (count === 0) return { label: "NO LOG", color: "default" };
  if (count % 2 === 1) return { label: "INCOMPLETE", color: "orange" };
  return { label: "COMPLETE", color: "green" };
}

export default function CleanColumnarTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const valid = useMemo(
    () => data.filter((r) => r.employeeId !== EMPTY_GUID && r.empNo !== ""),
    [data],
  );

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

  const fixedColumns: ColumnsType<CleanAttendanceLogColumnar> = [
    {
      title: "Emp No",
      dataIndex: "empNo",
      key: "empNo",
      width: 80,
      fixed: "left",
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      fixed: "left",
      ellipsis: true,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 110,
    },
    {
      title: "Work Date",
      dataIndex: "workDate",
      key: "workDate",
      width: 100,
    },
    {
      title: "Shift",
      dataIndex: "shiftName",
      key: "shiftName",
      width: 110,
      ellipsis: true,
    },
    {
      title: "Shift Start",
      dataIndex: "shiftStart",
      key: "shiftStart",
      width: 90,
      render: (v: string) => fmtTime(v),
    },
    {
      title: "Shift End",
      dataIndex: "shiftEnd",
      key: "shiftEnd",
      width: 90,
      render: (v: string) => fmtTime(v),
    },
    {
      title: "Break Out",
      dataIndex: "breakOut",
      key: "breakOut",
      width: 90,
      render: (v: string | null) => fmtTime(v),
    },
    {
      title: "Break In",
      dataIndex: "breakIn",
      key: "breakIn",
      width: 90,
      render: (v: string | null) => fmtTime(v),
    },
  ];

  const logColumns: ColumnsType<CleanAttendanceLogColumnar> = activeLogKeys.map(
    (k, i) => ({
      title: `Log ${i + 1}`,
      key: k,
      width: 80,
      render: (_: unknown, record: CleanAttendanceLogColumnar) => {
        const entry = record[k] as { attId: string; workTime: string } | null;
        if (!entry) return <span style={{ color: "#bbb" }}>—</span>;
        return (
          <Tooltip title={dayjs(entry.workTime).format("MMM DD HH:mm")}>
            <span>{fmtTime(entry.workTime)}</span>
          </Tooltip>
        );
      },
    }),
  );

  const statusColumn: ColumnsType<CleanAttendanceLogColumnar> = [
    {
      title: "Status",
      key: "status",
      width: 110,
      fixed: "right",
      render: (_: unknown, record: CleanAttendanceLogColumnar) => {
        const { label, color } = attStatus(record);
        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  const scrollX =
    fixedColumns.reduce((sum, c) => sum + (Number(c.width) || 100), 0) +
    activeLogKeys.length * 80 +
    110;

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
        columns={[...fixedColumns, ...logColumns, ...statusColumn]}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: scrollX }}
        sticky
      />
    </div>
  );
}

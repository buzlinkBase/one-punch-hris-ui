import { useMemo, useState } from "react";
import { Input, Table, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { CleanAttendanceLogRow } from "../models/api/response/raw-attendance-log.model";

interface Props {
  data: CleanAttendanceLogRow[];
  loading?: boolean;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function fmtTime(v: string | null | undefined): string {
  if (!v) return "—";
  return dayjs(v).format("HH:mm");
}

const columns: ColumnsType<CleanAttendanceLogRow> = [
  {
    title: "Emp No",
    dataIndex: "empNo",
    key: "empNo",
    width: 90,
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
    width: 120,
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
    width: 120,
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
  {
    title: "Log 1",
    dataIndex: "log1",
    key: "log1",
    width: 80,
    render: (v: CleanAttendanceLogRow["log1"]) => {
      if (!v) return <span style={{ color: "#bbb" }}>—</span>;
      return (
        <Tooltip title={dayjs(v.workTime).format("MMM DD HH:mm")}>
          <span>{fmtTime(v.workTime)}</span>
        </Tooltip>
      );
    },
  },
];

export default function CleanRowTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const valid = useMemo(
    () => data.filter((r) => r.employeeId !== EMPTY_GUID && r.empNo !== ""),
    [data],
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
        rowKey={(r, i) => r.log1?.attId ?? `${r.employeeId}-${r.workDate}-${i}`}
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}

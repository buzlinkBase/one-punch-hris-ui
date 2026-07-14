import { useMemo, useState } from "react";
import { Input, Table, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { CleanAttendanceLogRow } from "../models/api/response/raw-attendance-log.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: CleanAttendanceLogRow[];
  loading?: boolean;
}

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

function fmtTime(v: string | null | undefined): string {
  if (!v) return "";
  return dayjs(v).format("HH:mm");
}

export default function CleanRowTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    empNo: 90,
    fullName: 180,
    department: 120,
    workDate: 100,
    shiftName: 120,
    shiftStart: 90,
    shiftEnd: 90,
    breakOut: 90,
    breakIn: 90,
    log1: 80,
  });

  const columns: ColumnsType<CleanAttendanceLogRow> = [
    {
      title: "Emp No",
      dataIndex: "empNo",
      key: "empNo",
      width: widths.empNo,
      fixed: "left",
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
      fixed: "left",
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
      title: "Break Out",
      dataIndex: "breakOut",
      key: "breakOut",
      width: widths.breakOut,
      onHeaderCell: () =>
        ({
          width: widths.breakOut,
          onResize: (w: number) => handleResize("breakOut", w),
        }) as object,
      render: (v: string | null) => fmtTime(v),
    },
    {
      title: "Break In",
      dataIndex: "breakIn",
      key: "breakIn",
      width: widths.breakIn,
      onHeaderCell: () =>
        ({
          width: widths.breakIn,
          onResize: (w: number) => handleResize("breakIn", w),
        }) as object,
      render: (v: string | null) => fmtTime(v),
    },
    {
      title: "Log 1",
      dataIndex: "log1",
      key: "log1",
      width: widths.log1,
      onHeaderCell: () =>
        ({
          width: widths.log1,
          onResize: (w: number) => handleResize("log1", w),
        }) as object,
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
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

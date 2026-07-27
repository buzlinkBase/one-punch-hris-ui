import { useMemo } from "react";
import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TardinessResponse } from "../../models/api/response/tardiness-response.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface TardinessSummary {
  employeeNo: string;
  fullName: string | null;
  department: string | null;
  occurrences: number;
  totalTardinessMins: number;
  totalDeductibleMins: number;
}

interface Props {
  data: TardinessResponse[];
  loading?: boolean;
}

export default function TardinessSummaryTable({ data, loading }: Props) {
  const { widths, handleResize } = useResizableColumns({
    employeeNo: 130,
    fullName: 200,
    department: 160,
    occurrences: 120,
    totalTardinessMins: 180,
    totalDeductibleMins: 180,
  });

  const summary = useMemo<TardinessSummary[]>(() => {
    const map = new Map<string, TardinessSummary>();
    for (const r of data) {
      if (!map.has(r.employeeNo)) {
        map.set(r.employeeNo, {
          employeeNo: r.employeeNo,
          fullName: r.fullName,
          department: r.department,
          occurrences: 0,
          totalTardinessMins: 0,
          totalDeductibleMins: 0,
        });
      }
      const entry = map.get(r.employeeNo)!;
      if (r.tardinessMinutes > 0) entry.occurrences += 1;
      entry.totalTardinessMins += r.tardinessMinutes;
      entry.totalDeductibleMins += r.deductibleMinutes;
    }
    return Array.from(map.values()).sort(
      (a, b) => b.totalTardinessMins - a.totalTardinessMins,
    );
  }, [data]);

  const columns: ColumnsType<TardinessSummary> = [
    {
      title: "Employee ID",
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
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
      render: (v: string | null) => v ?? "—",
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
      render: (v: string | null) => v ?? "—",
    },
    {
      title: "Occurrences",
      dataIndex: "occurrences",
      key: "occurrences",
      width: widths.occurrences,
      align: "right",
      onHeaderCell: () =>
        ({
          width: widths.occurrences,
          onResize: (w: number) => handleResize("occurrences", w),
        }) as object,
      render: (v: number) =>
        v > 0 ? <Tag color="orange">{v}x</Tag> : <Tag color="success">0</Tag>,
    },
    {
      title: "Total Tardiness (Mins)",
      dataIndex: "totalTardinessMins",
      key: "totalTardinessMins",
      width: widths.totalTardinessMins,
      align: "right",
      onHeaderCell: () =>
        ({
          width: widths.totalTardinessMins,
          onResize: (w: number) => handleResize("totalTardinessMins", w),
        }) as object,
      render: (v: number) => `${v} mins`,
    },
    {
      title: "Total Deductible (Mins)",
      dataIndex: "totalDeductibleMins",
      key: "totalDeductibleMins",
      width: widths.totalDeductibleMins,
      align: "right",
      onHeaderCell: () =>
        ({
          width: widths.totalDeductibleMins,
          onResize: (w: number) => handleResize("totalDeductibleMins", w),
        }) as object,
      render: (v: number) =>
        v > 0 ? (
          <Tag color="red">{v} mins</Tag>
        ) : (
          <Tag color="success">0 mins</Tag>
        ),
    },
  ];

  return (
    <Table<TardinessSummary>
      rowKey="employeeNo"
      dataSource={summary}
      columns={columns}
      size="small"
      loading={loading}
      pagination={{ pageSize: 15 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}

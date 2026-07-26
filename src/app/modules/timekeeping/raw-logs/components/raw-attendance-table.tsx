import { useState } from "react";
import { Input, Table, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { RawAttendanceLog } from "../models/api/response/raw-attendance-log.model";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: RawAttendanceLog[];
  loading?: boolean;
}

export default function RawAttendanceTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    name: 150,
    workDateTime: 180,
    logSource: 130,
    batch: 200,
    branch: 130,
    client: 130,
    area: 130,
  });

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
      render: (v: string) => dayjs(v).format("MMM DD, YYYY hh:mm A"),
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
      render: (v: string) => <Tag>{v}</Tag>,
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
      render: (v: string | null) =>
        v ?? <span style={{ color: "#d9d9d9" }}>—</span>,
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
      render: (v: string | null) =>
        v ?? <span style={{ color: "#d9d9d9" }}>—</span>,
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
      render: (v: string | null) =>
        v ?? <span style={{ color: "#d9d9d9" }}>—</span>,
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

  return (
    <div className="flex flex-col gap-3">
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search employee, source, batch..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ maxWidth: 320 }}
      />
      <Table
        rowKey="id"
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

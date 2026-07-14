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
        [item.name, item.workDateTime, item.logSource, item.batch].some((v) =>
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

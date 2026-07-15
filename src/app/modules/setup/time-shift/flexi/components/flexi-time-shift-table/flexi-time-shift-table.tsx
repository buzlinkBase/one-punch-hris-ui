import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { FlexiTimeShiftResponse } from "../../models/api/response/flexi-time-shift-response.model";
import { FLEXI_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: FlexiTimeShiftResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

function formatTimeSpan(value: string | null | undefined): string {
  if (!value) return "";
  const dot = value.indexOf(".");
  const hasDayOffset = dot > 0 && dot < value.lastIndexOf(":");
  const timePart = hasDayOffset ? value.slice(dot + 1) : value;
  const [h, m] = timePart.split(":");
  const formatted = `${h}:${m}`;
  return hasDayOffset ? `+1d ${formatted}` : formatted;
}

export default function FlexiTimeShiftTable({
  data,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    shiftName: 180,
    startTime: 120,
    endTime: 120,
    minimumWorkMinutes: 130,
    maxWorkingMinutes: 130,
    breakWindow: 180,
    withOT: 100,
    overTimeThreshold: 120,
  });

  const filtered = data.filter((item) =>
    [item.shiftName, item.startTime, item.endTime].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<FlexiTimeShiftResponse> = [
    {
      title: FLEXI_TIME_SHIFT_LABEL.SHIFT_NAME,
      dataIndex: "shiftName",
      key: "shiftName",
      width: widths.shiftName,
      onHeaderCell: () =>
        ({
          width: widths.shiftName,
          onResize: (w: number) => handleResize("shiftName", w),
        }) as object,
      sorter: (a, b) => a.shiftName.localeCompare(b.shiftName),
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.START_TIME,
      dataIndex: "startTime",
      key: "startTime",
      width: widths.startTime,
      onHeaderCell: () =>
        ({
          width: widths.startTime,
          onResize: (w: number) => handleResize("startTime", w),
        }) as object,
      render: (val) => formatTimeSpan(val),
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.END_TIME,
      dataIndex: "endTime",
      key: "endTime",
      width: widths.endTime,
      onHeaderCell: () =>
        ({
          width: widths.endTime,
          onResize: (w: number) => handleResize("endTime", w),
        }) as object,
      render: (val) => formatTimeSpan(val),
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.MIN_WORKING,
      dataIndex: "minimumWorkMinutes",
      key: "minimumWorkMinutes",
      width: widths.minimumWorkMinutes,
      onHeaderCell: () =>
        ({
          width: widths.minimumWorkMinutes,
          onResize: (w: number) => handleResize("minimumWorkMinutes", w),
        }) as object,
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.MAX_WORKING,
      dataIndex: "maxWorkingMinutes",
      key: "maxWorkingMinutes",
      width: widths.maxWorkingMinutes,
      onHeaderCell: () =>
        ({
          width: widths.maxWorkingMinutes,
          onResize: (w: number) => handleResize("maxWorkingMinutes", w),
        }) as object,
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: "Break Window",
      key: "breakWindow",
      width: widths.breakWindow,
      onHeaderCell: () =>
        ({
          width: widths.breakWindow,
          onResize: (w: number) => handleResize("breakWindow", w),
        }) as object,
      render: (_, record) =>
        record.lunchStartTime && record.lunchEndTime
          ? `${formatTimeSpan(record.lunchStartTime)} – ${formatTimeSpan(record.lunchEndTime)}`
          : null,
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.ALLOW_OT,
      dataIndex: "withOT",
      key: "withOT",
      width: widths.withOT,
      onHeaderCell: () =>
        ({
          width: widths.withOT,
          onResize: (w: number) => handleResize("withOT", w),
        }) as object,
      render: (val) =>
        val ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.OT_THRESHOLD,
      dataIndex: "overTimeThreshold",
      key: "overTimeThreshold",
      width: widths.overTimeThreshold,
      onHeaderCell: () =>
        ({
          width: widths.overTimeThreshold,
          onResize: (w: number) => handleResize("overTimeThreshold", w),
        }) as object,
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              navigate({ to: `/setup/time-shift/flexi/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this shift?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search..."
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

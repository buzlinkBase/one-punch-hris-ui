import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { FixedTimeShiftResponse } from "../../models/api/response/fixed-time-shift-response.model";
import { FIXED_TIME_SHIFT_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: FixedTimeShiftResponse[];
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

function formatBreakMode(value: string | null | undefined): string {
  if (!value || value === "NONE") return "";
  if (value === "PAID_BREAK") return "Paid";
  if (value === "UNPAID_BREAK") return "Unpaid";
  return value;
}

export default function FixedTimeShiftTable({
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
    gracePeriodMinutes: 120,
    withLunchBreak: 120,
    breakDurationMinutes: 120,
    amBreak: 180,
    pmBreak: 180,
    withOT: 100,
    overTimeThreshold: 120,
    minimumWorkMinutes: 140,
  });

  const filtered = data.filter((item) =>
    [item.shiftName, item.startTime, item.endTime].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<FixedTimeShiftResponse> = [
    {
      title: FIXED_TIME_SHIFT_LABEL.SHIFT_NAME,
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
      title: FIXED_TIME_SHIFT_LABEL.START_TIME,
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
      title: FIXED_TIME_SHIFT_LABEL.END_TIME,
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
      title: "Grace Period",
      dataIndex: "gracePeriodMinutes",
      key: "gracePeriodMinutes",
      width: widths.gracePeriodMinutes,
      onHeaderCell: () =>
        ({
          width: widths.gracePeriodMinutes,
          onResize: (w: number) => handleResize("gracePeriodMinutes", w),
        }) as object,
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: "Lunch Break",
      dataIndex: "withLunchBreak",
      key: "withLunchBreak",
      width: widths.withLunchBreak,
      onHeaderCell: () =>
        ({
          width: widths.withLunchBreak,
          onResize: (w: number) => handleResize("withLunchBreak", w),
        }) as object,
      render: (val) => formatBreakMode(val),
    },
    {
      title: "Break Duration",
      dataIndex: "breakDurationMinutes",
      key: "breakDurationMinutes",
      width: widths.breakDurationMinutes,
      onHeaderCell: () =>
        ({
          width: widths.breakDurationMinutes,
          onResize: (w: number) => handleResize("breakDurationMinutes", w),
        }) as object,
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.AM_BREAK,
      key: "amBreak",
      width: widths.amBreak,
      onHeaderCell: () =>
        ({
          width: widths.amBreak,
          onResize: (w: number) => handleResize("amBreak", w),
        }) as object,
      render: (_, record) =>
        record.amStartTime && record.amEndTime
          ? `${formatTimeSpan(record.amStartTime)} – ${formatTimeSpan(record.amEndTime)}`
          : null,
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.PM_BREAK,
      key: "pmBreak",
      width: widths.pmBreak,
      onHeaderCell: () =>
        ({
          width: widths.pmBreak,
          onResize: (w: number) => handleResize("pmBreak", w),
        }) as object,
      render: (_, record) =>
        record.pmStartTime && record.pmEndTime
          ? `${formatTimeSpan(record.pmStartTime)} – ${formatTimeSpan(record.pmEndTime)}`
          : null,
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.ALLOW_OT,
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
      title: FIXED_TIME_SHIFT_LABEL.OT_THRESHOLD,
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
      title: FIXED_TIME_SHIFT_LABEL.MIN_WORKING,
      dataIndex: "minimumWorkMinutes",
      key: "minimumWorkMinutes",
      width: widths.minimumWorkMinutes,
      onHeaderCell: () =>
        ({
          width: widths.minimumWorkMinutes,
          onResize: (w: number) => handleResize("minimumWorkMinutes", w),
        }) as object,
      render: (val: number) => `${val} min`,
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
              navigate({ to: `/setup/time-shift/fixed/${record.id}` })
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

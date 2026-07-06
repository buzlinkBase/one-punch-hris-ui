import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { FixedTimeShiftResponse } from "../../models/api/response/fixed-time-shift-response.model";
import { FIXED_TIME_SHIFT_LABEL } from "../../constants/label.const";

interface Props {
  data: FixedTimeShiftResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

function formatTimeSpan(value: string | null | undefined): string {
  if (!value) return "—";
  const dot = value.indexOf(".");
  const hasDayOffset = dot > 0 && dot < value.lastIndexOf(":");
  const timePart = hasDayOffset ? value.slice(dot + 1) : value;
  const [h, m] = timePart.split(":");
  const formatted = `${h}:${m}`;
  return hasDayOffset ? `+1d ${formatted}` : formatted;
}

function formatBreakMode(value: string | null | undefined): string {
  if (!value || value === "NONE") return "—";
  if (value === "PAID_BREAK") return "Paid";
  if (value === "UNPAID_BREAK") return "Unpaid";
  return value;
}

export default function FixedTimeShiftTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    [item.shiftName, item.startTime, item.endTime]
      .some((val) => String(val ?? "").toLowerCase().includes(search.toLowerCase())),
  );

  const columns: ColumnsType<FixedTimeShiftResponse> = [
    {
      title: FIXED_TIME_SHIFT_LABEL.SHIFT_NAME,
      dataIndex: "shiftName",
      key: "shiftName",
      sorter: (a, b) => a.shiftName.localeCompare(b.shiftName),
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.START_TIME,
      dataIndex: "startTime",
      key: "startTime",
      render: (val) => formatTimeSpan(val),
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.END_TIME,
      dataIndex: "endTime",
      key: "endTime",
      render: (val) => formatTimeSpan(val),
    },
    {
      title: "Grace Period",
      dataIndex: "gracePeriodMinutes",
      key: "gracePeriodMinutes",
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: "Lunch Break",
      dataIndex: "withLunchBreak",
      key: "withLunchBreak",
      render: (val) => formatBreakMode(val),
    },
    {
      title: "Break Duration",
      dataIndex: "breakDurationMinutes",
      key: "breakDurationMinutes",
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.AM_BREAK,
      key: "amBreak",
      render: (_, record) =>
        record.amStartTime && record.amEndTime
          ? `${formatTimeSpan(record.amStartTime)} – ${formatTimeSpan(record.amEndTime)}`
          : "—",
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.PM_BREAK,
      key: "pmBreak",
      render: (_, record) =>
        record.pmStartTime && record.pmEndTime
          ? `${formatTimeSpan(record.pmStartTime)} – ${formatTimeSpan(record.pmEndTime)}`
          : "—",
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.ALLOW_OT,
      dataIndex: "withOT",
      key: "withOT",
      render: (val) =>
        val ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
    },
    {
      title: FIXED_TIME_SHIFT_LABEL.OT_THRESHOLD,
      dataIndex: "overTimeThreshold",
      key: "overTimeThreshold",
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate({ to: `/setup/time-shift/fixed/${record.id}` })}
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this shift?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>
                Delete
              </Button>
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
      />
    </div>
  );
}

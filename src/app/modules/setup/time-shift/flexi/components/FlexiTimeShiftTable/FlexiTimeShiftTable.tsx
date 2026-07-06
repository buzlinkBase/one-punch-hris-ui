import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { FlexiTimeShiftResponse } from "../../models/api/response/flexi-time-shift-response.model";
import { FLEXI_TIME_SHIFT_LABEL } from "../../constants/label.const";

interface Props {
  data: FlexiTimeShiftResponse[];
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

export default function FlexiTimeShiftTable({
  data,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

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
      sorter: (a, b) => a.shiftName.localeCompare(b.shiftName),
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.START_TIME,
      dataIndex: "startTime",
      key: "startTime",
      render: (val) => formatTimeSpan(val),
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.END_TIME,
      dataIndex: "endTime",
      key: "endTime",
      render: (val) => formatTimeSpan(val),
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.MIN_WORKING,
      dataIndex: "minimumWorkMinutes",
      key: "minimumWorkMinutes",
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.MAX_WORKING,
      dataIndex: "maxWorkingMinutes",
      key: "maxWorkingMinutes",
      render: (val) => `${val} min`,
      align: "right",
    },
    {
      title: "Break Window",
      key: "breakWindow",
      render: (_, record) =>
        record.lunchStartTime && record.lunchEndTime
          ? `${formatTimeSpan(record.lunchStartTime)} – ${formatTimeSpan(record.lunchEndTime)}`
          : "—",
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.ALLOW_OT,
      dataIndex: "withOT",
      key: "withOT",
      render: (val) =>
        val ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
    },
    {
      title: FLEXI_TIME_SHIFT_LABEL.OT_THRESHOLD,
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
            onClick={() =>
              navigate({ to: `/setup/time-shift/flexi/${record.id}` })
            }
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

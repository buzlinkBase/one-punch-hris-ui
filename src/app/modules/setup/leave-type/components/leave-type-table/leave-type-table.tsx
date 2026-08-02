import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { LeaveTypeResponse } from "../../models/api/response/leave-type-response.model";
import { LEAVE_TYPE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

const PAY_SOURCE_COLOR: Record<string, string> = {
  Company: "blue",
  Government: "green",
  Unpaid: "default",
  Other: "orange",
};

const RESET_LABELS: Record<string, string> = {
  PerEvent: "Per Event",
  PerPeriod: "Per Period",
};

interface Props {
  data: LeaveTypeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function LeaveTypeTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    code: 100,
    description: 200,
    category: 120,
    credits: 110,
    paySource: 120,
    leaveReset: 120,
  });

  const filtered = data.filter((item) =>
    [item.code, item.description, item.category ?? "", item.remarks]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const columns: ColumnsType<LeaveTypeResponse> = [
    {
      title: LEAVE_TYPE_LABEL.CODE,
      dataIndex: "code",
      key: "code",
      width: widths.code,
      onHeaderCell: () =>
        ({
          width: widths.code,
          onResize: (w: number) => handleResize("code", w),
        }) as object,
    },
    {
      title: LEAVE_TYPE_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      width: widths.description,
      onHeaderCell: () =>
        ({
          width: widths.description,
          onResize: (w: number) => handleResize("description", w),
        }) as object,
    },
    {
      title: LEAVE_TYPE_LABEL.CATEGORY,
      dataIndex: "category",
      key: "category",
      width: widths.category,
      onHeaderCell: () =>
        ({
          width: widths.category,
          onResize: (w: number) => handleResize("category", w),
        }) as object,
      render: (val?: string) =>
        val ? (
          <Tag color="purple">{val}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: LEAVE_TYPE_LABEL.CREDITS,
      dataIndex: "credits",
      key: "credits",
      width: widths.credits,
      onHeaderCell: () =>
        ({
          width: widths.credits,
          onResize: (w: number) => handleResize("credits", w),
        }) as object,
      render: (val: number) => `${val} day${val !== 1 ? "s" : ""}`,
    },
    {
      title: LEAVE_TYPE_LABEL.PAY_SOURCE,
      dataIndex: "paySource",
      key: "paySource",
      width: widths.paySource,
      onHeaderCell: () =>
        ({
          width: widths.paySource,
          onResize: (w: number) => handleResize("paySource", w),
        }) as object,
      render: (val: string) => (
        <Tag color={PAY_SOURCE_COLOR[val] ?? "default"}>{val}</Tag>
      ),
    },
    {
      title: LEAVE_TYPE_LABEL.LEAVE_RESET,
      dataIndex: "leaveReset",
      key: "leaveReset",
      width: widths.leaveReset,
      onHeaderCell: () =>
        ({
          width: widths.leaveReset,
          onResize: (w: number) => handleResize("leaveReset", w),
        }) as object,
      render: (val: string) => RESET_LABELS[val] ?? val,
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
            onClick={() => navigate({ to: `/setup/leave-type/${record.id}` })}
          />
          {onDelete && (
            <Popconfirm
              title="Delete this leave type?"
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

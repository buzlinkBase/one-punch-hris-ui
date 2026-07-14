import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { PayrollGroupResponse } from "../../models/api/response/payroll-group-response.model";
import {
  PAYROLL_GROUP_LABEL,
  PAYROLL_FREQUENCY_OPTIONS,
} from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: PayrollGroupResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const freqLabel = (value: string) =>
  PAYROLL_FREQUENCY_OPTIONS.find((o) => o.value === value)?.label ?? value;

export default function PayrollGroupTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    code: 120,
    name: 200,
    payrollFrequency: 160,
    cutoffDays: 200,
    status: 120,
  });

  const filtered = data.filter((item) =>
    [item.code, item.name, item.payrollFrequency, item.status].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<PayrollGroupResponse> = [
    {
      title: PAYROLL_GROUP_LABEL.CODE,
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
      title: PAYROLL_GROUP_LABEL.NAME,
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
      title: PAYROLL_GROUP_LABEL.PAYROLL_FREQUENCY,
      dataIndex: "payrollFrequency",
      key: "payrollFrequency",
      width: widths.payrollFrequency,
      onHeaderCell: () =>
        ({
          width: widths.payrollFrequency,
          onResize: (w: number) => handleResize("payrollFrequency", w),
        }) as object,
      render: (v: string) => freqLabel(v),
    },
    {
      title: PAYROLL_GROUP_LABEL.CUTOFF_DAYS,
      key: "cutoffDays",
      width: widths.cutoffDays,
      onHeaderCell: () =>
        ({
          width: widths.cutoffDays,
          onResize: (w: number) => handleResize("cutoffDays", w),
        }) as object,
      render: (_, record) =>
        record.cutoffDays?.length
          ? record.cutoffDays
              .map(
                (c) =>
                  c.label || `Day ${c.day}${c.isEndOfMonth ? " (EOM)" : ""}`,
              )
              .join(", ")
          : undefined,
    },
    {
      title: PAYROLL_GROUP_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
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
              navigate({ to: `/setup/payroll-group/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this payroll group?"
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

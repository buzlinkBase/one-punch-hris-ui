import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Select, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { DeductionResponse } from "../../models/api/response/deduction-response.model";
import type { DeductionTypeResponse } from "@/app/modules/setup/deduction-type/models/api/response/deduction-type-response.model";
import { DEDUCTION_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: DeductionResponse[];
  deductionTypes: DeductionTypeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function DeductionTable({
  data,
  deductionTypes,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { widths, handleResize } = useResizableColumns({
    code: 120,
    name: 200,
    deductionTypeId: 160,
    amount: 130,
    status: 100,
  });

  const typeMap = new Map(deductionTypes.map((t) => [t.id, t.name]));

  const typeOptions = [
    { value: "", label: "All Types" },
    ...deductionTypes.map((t) => ({ value: t.id, label: t.name })),
  ];

  const filtered = data.filter((item) => {
    const typeName = typeMap.get(item.deductionTypeId) ?? "";
    const matchesSearch = [
      item.code,
      item.name,
      typeName,
      String(item.amount),
      item.status,
    ].some((val) => val.toLowerCase().includes(search.toLowerCase()));
    const matchesType = !typeFilter || item.deductionTypeId === typeFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns: ColumnsType<DeductionResponse> = [
    {
      title: DEDUCTION_LABEL.CODE,
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
      title: DEDUCTION_LABEL.NAME,
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
      title: DEDUCTION_LABEL.DEDUCTION_TYPE,
      dataIndex: "deductionTypeId",
      key: "deductionTypeId",
      width: widths.deductionTypeId,
      onHeaderCell: () =>
        ({
          width: widths.deductionTypeId,
          onResize: (w: number) => handleResize("deductionTypeId", w),
        }) as object,
      render: (id: string) => typeMap.get(id) ?? id,
    },
    {
      title: DEDUCTION_LABEL.AMOUNT,
      dataIndex: "amount",
      key: "amount",
      width: widths.amount,
      onHeaderCell: () =>
        ({
          width: widths.amount,
          onResize: (w: number) => handleResize("amount", w),
        }) as object,
      align: "right",
      render: (amount: number) =>
        amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
    },
    {
      title: DEDUCTION_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "default"}>{status}</Tag>
      ),
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
            onClick={() => navigate({ to: `/setup/deduction/${record.id}` })}
          />
          {onDelete && (
            <Popconfirm
              title="Delete this deduction?"
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
      <div className="flex flex-wrap gap-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 280 }}
        />
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 180 }}
          placeholder="Filter by type"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
          placeholder="Filter by status"
        />
      </div>
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

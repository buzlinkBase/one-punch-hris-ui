import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Select, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { DeductionResponse } from "../../models/api/response/deduction-response.model";
import type { DeductionTypeResponse } from "@/app/modules/setup/deduction-type/models/api/response/deduction-type-response.model";
import { DEDUCTION_LABEL } from "../../constants/label.const";

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

  const typeMap = new Map(deductionTypes.map((t) => [t.id, t.name]));

  const typeOptions = [
    { value: "", label: "All Types" },
    ...deductionTypes.map((t) => ({ value: t.id, label: t.name })),
  ];

  const filtered = data.filter((item) => {
    const typeName = typeMap.get(item.deductionTypeId) ?? "";
    const matchesSearch = [item.code, item.name, typeName, String(item.amount), item.status].some(
      (val) => val.toLowerCase().includes(search.toLowerCase()),
    );
    const matchesType = !typeFilter || item.deductionTypeId === typeFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns: ColumnsType<DeductionResponse> = [
    { title: DEDUCTION_LABEL.CODE, dataIndex: "code", key: "code", width: 120 },
    { title: DEDUCTION_LABEL.NAME, dataIndex: "name", key: "name" },
    {
      title: DEDUCTION_LABEL.DEDUCTION_TYPE,
      dataIndex: "deductionTypeId",
      key: "deductionTypeId",
      width: 160,
      render: (id: string) => typeMap.get(id) ?? id,
    },
    {
      title: DEDUCTION_LABEL.AMOUNT,
      dataIndex: "amount",
      key: "amount",
      width: 130,
      align: "right",
      render: (amount: number) =>
        amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" }),
    },
    {
      title: DEDUCTION_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "success" : "default"}>{status}</Tag>
      ),
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
            onClick={() => navigate({ to: `/setup/deduction/${record.id}` })}
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this deduction?"
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
      />
    </div>
  );
}

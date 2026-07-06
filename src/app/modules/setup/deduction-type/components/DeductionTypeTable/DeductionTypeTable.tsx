import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { DeductionTypeResponse } from "../../models/api/response/deduction-type-response.model";
import { DEDUCTION_TYPE_LABEL } from "../../constants/label.const";

interface Props {
  data: DeductionTypeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function DeductionTypeTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<DeductionTypeResponse> = [
    {
      title: DEDUCTION_TYPE_LABEL.CODE,
      dataIndex: "code",
      key: "code",
      width: 120,
    },
    { title: DEDUCTION_TYPE_LABEL.NAME, dataIndex: "name", key: "name" },
    {
      title: DEDUCTION_TYPE_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 110,
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
            onClick={() =>
              navigate({ to: `/setup/deduction-type/${record.id}` })
            }
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this deduction type?"
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

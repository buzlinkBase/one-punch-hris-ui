import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { PositionResponse } from "../../models/api/response/position-response.model";
import { POSITION_LABEL } from "../../constants/label.const";

interface Props {
  data: PositionResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function PositionTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<PositionResponse> = [
    { title: POSITION_LABEL.CODE, dataIndex: "code", key: "code" },
    { title: POSITION_LABEL.NAME, dataIndex: "name", key: "name" },
    {
      title: POSITION_LABEL.RATE,
      dataIndex: "rate",
      key: "rate",
      render: (v: number) =>
        `₱ ${v.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
    },
    { title: POSITION_LABEL.STATUS, dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate({ to: `/setup/position/${record.id}` })}
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this position?"
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

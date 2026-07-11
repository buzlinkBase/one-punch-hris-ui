import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { OperationAreaResponse } from "../../models/api/response/operation-area-response.model";
import { OPERATION_AREA_LABEL } from "../../constants/label.const";

interface Props {
  data: OperationAreaResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function OperationAreaTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<OperationAreaResponse> = [
    { title: OPERATION_AREA_LABEL.CODE, dataIndex: "code", key: "code" },
    { title: OPERATION_AREA_LABEL.NAME, dataIndex: "name", key: "name" },
    {
      title: OPERATION_AREA_LABEL.ADDRESS,
      dataIndex: "address",
      key: "address",
      render: (val: string) => val || "—",
    },
    {
      title: "Boundary",
      key: "boundary",
      render: (_: unknown, record: OperationAreaResponse) =>
        record.boundary ? (
          <Tag color="green">Area Set</Tag>
        ) : (
          <Tag color="default">No Area</Tag>
        ),
    },
    { title: OPERATION_AREA_LABEL.STATUS, dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate({ to: `/setup/project-site/${record.id}` })}
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this project site?"
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

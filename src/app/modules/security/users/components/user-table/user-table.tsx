import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { UserResponse } from "../../models/api/response/user-response.model";
import { USER_LABEL } from "../../constants/label.const";

interface Props {
  data: UserResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function UserTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<UserResponse> = [
    { title: USER_LABEL.CODE, dataIndex: "code", key: "code" },
    { title: USER_LABEL.FULL_NAME, dataIndex: "fullName", key: "fullName" },
    { title: USER_LABEL.USERNAME, dataIndex: "username", key: "username" },
    { title: USER_LABEL.USER_TYPE, dataIndex: "userType", key: "userType" },
    { title: USER_LABEL.STATUS, dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate({ to: `/security/users/${record.id}` })}
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this user?"
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

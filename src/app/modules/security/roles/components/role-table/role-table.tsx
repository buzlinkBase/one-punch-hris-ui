import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { Role } from "../../models/api/response/role-response.model";
import { ROLE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: Role[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function RoleTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    name: 200,
    scope: 110,
    permissions: 110,
    description: 280,
  });

  const filtered = data.filter((item) =>
    [item.name, item.description].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<Role> = [
    {
      title: ROLE_LABEL.ROLE_NAME,
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
      title: ROLE_LABEL.SCOPE,
      key: "scope",
      width: widths.scope,
      onHeaderCell: () =>
        ({
          width: widths.scope,
          onResize: (w: number) => handleResize("scope", w),
        }) as object,
      render: (_, record) => (
        <Tag color={record.isSystemRole ? "blue" : "green"}>
          {record.isSystemRole ? "System" : "Custom"}
        </Tag>
      ),
    },
    {
      title: ROLE_LABEL.PERMISSIONS,
      key: "permissions",
      width: widths.permissions,
      onHeaderCell: () =>
        ({
          width: widths.permissions,
          onResize: (w: number) => handleResize("permissions", w),
        }) as object,
      render: (_, record) => record.rolePermissions.length,
    },
    {
      title: ROLE_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      width: widths.description,
      onHeaderCell: () =>
        ({
          width: widths.description,
          onResize: (w: number) => handleResize("description", w),
        }) as object,
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={record.isSystemRole ? <EyeOutlined /> : <EditOutlined />}
            onClick={() => navigate({ to: `/security/roles/${record.id}` })}
          />
          {!record.isSystemRole && onDelete && (
            <Popconfirm
              title="Delete this role?"
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

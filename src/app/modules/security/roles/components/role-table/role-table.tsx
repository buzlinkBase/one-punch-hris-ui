import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { RoleResponse } from "../../models/api/response/role-response.model";
import { ROLE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: RoleResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function RoleTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    name: 200,
    description: 300,
    permissions: 120,
  });

  const filtered = data.filter(
    (item) =>
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<RoleResponse> = [
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
      title: ROLE_LABEL.PERMISSIONS,
      key: "permissions",
      width: widths.permissions,
      onHeaderCell: () =>
        ({
          width: widths.permissions,
          onResize: (w: number) => handleResize("permissions", w),
        }) as object,
      render: (_, record) => <Tag>{record.permissions.length} granted</Tag>,
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
            onClick={() => navigate({ to: `/security/roles/${record.id}` })}
          />
          {onDelete && (
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

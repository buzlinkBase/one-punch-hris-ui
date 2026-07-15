import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag, Select } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { PermissionResponse } from "../../models/api/response/permission-response.model";
import {
  PERMISSION_LABEL,
  PERMISSION_ACTION_COLORS,
  PERMISSION_MODULE_OPTIONS,
} from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

const MODULE_FILTER_OPTIONS = [
  { value: "", label: "All Modules" },
  ...PERMISSION_MODULE_OPTIONS,
];

const ACTION_FILTER_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "CREATE", label: "Create" },
  { value: "READ", label: "Read" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "EXPORT", label: "Export" },
  { value: "APPROVE", label: "Approve" },
  { value: "REJECT", label: "Reject" },
];

interface Props {
  data: PermissionResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function PermissionTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const { widths, handleResize } = useResizableColumns({
    code: 160,
    name: 200,
    module: 160,
    action: 110,
    description: 300,
    status: 100,
  });

  const filtered = data.filter((item) => {
    const matchesSearch =
      !search ||
      Object.values(item).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    const matchesModule = !moduleFilter || item.module === moduleFilter;
    const matchesAction = !actionFilter || item.action === actionFilter;
    return matchesSearch && matchesModule && matchesAction;
  });

  const columns: ColumnsType<PermissionResponse> = [
    {
      title: PERMISSION_LABEL.CODE,
      dataIndex: "code",
      key: "code",
      width: widths.code,
      onHeaderCell: () =>
        ({
          width: widths.code,
          onResize: (w: number) => handleResize("code", w),
        }) as object,
      render: (val: string) => <code>{val}</code>,
    },
    {
      title: PERMISSION_LABEL.NAME,
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
      title: PERMISSION_LABEL.MODULE,
      dataIndex: "module",
      key: "module",
      width: widths.module,
      onHeaderCell: () =>
        ({
          width: widths.module,
          onResize: (w: number) => handleResize("module", w),
        }) as object,
    },
    {
      title: PERMISSION_LABEL.ACTION,
      dataIndex: "action",
      key: "action",
      width: widths.action,
      onHeaderCell: () =>
        ({
          width: widths.action,
          onResize: (w: number) => handleResize("action", w),
        }) as object,
      render: (val: string) => (
        <Tag color={PERMISSION_ACTION_COLORS[val] ?? "default"}>{val}</Tag>
      ),
    },
    {
      title: PERMISSION_LABEL.DESCRIPTION,
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
      title: PERMISSION_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (val: string) => (
        <Tag color={val === "ACTIVE" ? "success" : "default"}>{val}</Tag>
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
            onClick={() =>
              navigate({ to: `/security/permissions/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this permission?"
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
      <div className="flex flex-wrap gap-3">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 260 }}
        />
        <Select
          options={MODULE_FILTER_OPTIONS}
          value={moduleFilter}
          onChange={setModuleFilter}
          style={{ minWidth: 170 }}
        />
        <Select
          options={ACTION_FILTER_OPTIONS}
          value={actionFilter}
          onChange={setActionFilter}
          style={{ minWidth: 150 }}
        />
      </div>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `${total} records` }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

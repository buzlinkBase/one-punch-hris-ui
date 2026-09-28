import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag, Tooltip } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { UserResponse } from "../../models/api/response/user-response.model";
import { USER_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { AUDIT_LABEL } from "@/app/modules/security/audit/constants/label.const";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

// An invited member without an account yet has no activity to show.
function hasAccount(record: UserResponse): boolean {
  return !!record.userId && record.userId !== EMPTY_GUID;
}

interface Props {
  data: UserResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function UserTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const canViewAudit = useHasPermission("Audit Trail:View");
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    email: 200,
    fullName: 200,
    roles: 160,
    status: 120,
  });

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const roleColors: Record<string, string> = {
    Owner: "red",
    Admin: "blue",
    Employee: "green",
    Member: "pink",
    Client: "orange",
  };

  const columns: ColumnsType<UserResponse> = [
    {
      title: USER_LABEL.EMAIL,
      dataIndex: "email",
      key: "email",
      width: widths.email,
      onHeaderCell: () =>
        ({
          width: widths.email,
          onResize: (w: number) => handleResize("email", w),
        }) as object,
    },
    {
      title: USER_LABEL.FULL_NAME,
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    {
      title: USER_LABEL.ROLES,
      dataIndex: "roles",
      key: "roles",
      width: widths.roles,
      onHeaderCell: () =>
        ({
          width: widths.roles,
          onResize: (w: number) => handleResize("roles", w),
        }) as object,
      render: (roles: string[]) => (
        <Space size={[0, 4]} wrap>
          {roles?.map((role) => (
            <Tag key={role} color={roleColors[role] || "default"}>
              {role}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: USER_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (status: string) => {
        const color =
          status === "Active" || status === "ACTIVE"
            ? "success"
            : status === "Invited"
              ? "warning"
              : "error";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate({ to: `/security/users/${record.id}` })}
          />
          {canViewAudit && hasAccount(record) && (
            <Tooltip title={AUDIT_LABEL.VIEW_ACTIVITY}>
              <Button
                type="text"
                icon={<HistoryOutlined />}
                aria-label={AUDIT_LABEL.VIEW_ACTIVITY}
                onClick={() =>
                  navigate({
                    to: "/security/audit",
                    search: {
                      userId: record.userId,
                      userName: record.fullName || record.email,
                    },
                  })
                }
              />
            </Tooltip>
          )}
          {onDelete && (
            <Popconfirm
              title="Remove this member from the company?"
              description="This will remove their membership and access from this company."
              onConfirm={() => onDelete(record.id)}
              okText="Remove"
              cancelText="Cancel"
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

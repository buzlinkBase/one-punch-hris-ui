import { useMemo, useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  Select,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import type { ColumnType, ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type {
  UserKind,
  UserRow,
} from "../../models/api/response/user-response.model";
import { USER_LABEL } from "../../constants/label.const";
import { hasAccount } from "../../utils/classify-users";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { AUDIT_LABEL } from "@/app/modules/security/audit/constants/label.const";

/** Which slice of users a table shows; each gets the columns that matter for it. */
export type UserTableVariant = "all" | "employee" | "client" | "other";

type ColumnKey =
  | "email"
  | "fullName"
  | "type"
  | "linkedTo"
  | "employeeNo"
  | "department"
  | "client"
  | "roles"
  | "status"
  | "actions";

const VARIANT_COLUMNS: Record<UserTableVariant, ColumnKey[]> = {
  all: ["email", "fullName", "type", "linkedTo", "roles", "status", "actions"],
  employee: [
    "employeeNo",
    "fullName",
    "department",
    "email",
    "roles",
    "status",
    "actions",
  ],
  client: ["client", "email", "fullName", "roles", "status", "actions"],
  other: ["email", "fullName", "roles", "status", "actions"],
};

const ROLE_COLORS: Record<string, string> = {
  Owner: "red",
  Admin: "blue",
  Employee: "green",
  Member: "pink",
  Client: "orange",
};

const KIND_COLORS: Record<UserKind, string> = {
  Employee: "green",
  Client: "orange",
  Other: "default",
};

const isActiveStatus = (status: string) => status?.toLowerCase() === "active";

const isOwner = (record: UserRow) => record.roles?.includes("Owner") ?? false;

function statusColor(status: string): string {
  if (isActiveStatus(status)) return "success";
  return status === "Invited" ? "warning" : "error";
}

/** The text a row is searched by, including who it's linked to. */
function searchText(record: UserRow): string {
  const { link } = record;
  return [
    record.email,
    record.fullName,
    record.status,
    record.kind,
    ...(record.roles ?? []),
    link?.employeeNo,
    link?.departmentName,
    link?.clientCode,
    link?.clientName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

interface Props {
  data: UserRow[];
  variant?: UserTableVariant;
  loading?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onToggleStatus?: (record: UserRow, status: string) => void;
  togglingId?: string | null;
  onDelete?: (record: UserRow) => void;
}

export default function UserTable({
  data,
  variant = "all",
  loading,
  selectedIds,
  onSelectionChange,
  onToggleStatus,
  togglingId,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const canViewAudit = useHasPermission("Audit Trail:View");
  const canEdit = useHasPermission("Tenant Members:Manage", "Users:Edit");
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState<string | undefined>();

  const { widths, handleResize } = useResizableColumns({
    email: 220,
    fullName: 200,
    type: 110,
    linkedTo: 220,
    employeeNo: 130,
    department: 160,
    client: 220,
    roles: 160,
    status: 150,
  });

  const clientOptions = useMemo(() => {
    const clients = new Map<string, string>();
    for (const row of data) {
      if (row.link?.clientId && row.link.clientName)
        clients.set(row.link.clientId, row.link.clientName);
    }
    return [...clients]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [data]);

  const term = search.trim().toLowerCase();
  const filtered = data.filter(
    (item) =>
      (!term || searchText(item).includes(term)) &&
      (variant !== "client" || !clientId || item.link?.clientId === clientId),
  );

  const resizable = (
    key: keyof typeof widths,
    column: ColumnType<UserRow>,
  ): ColumnType<UserRow> => ({
    key,
    width: widths[key],
    onHeaderCell: () =>
      ({
        width: widths[key],
        onResize: (w: number) => handleResize(key, w),
      }) as object,
    ...column,
  });

  const recordLink = (label: string, to: string) => (
    <Typography.Link onClick={() => navigate({ to })}>{label}</Typography.Link>
  );

  const employeeLink = (record: UserRow, label: string) =>
    record.link?.employeeId
      ? recordLink(label, `/setup/employee/${record.link.employeeId}`)
      : label;

  const clientLink = (record: UserRow) => {
    const { link } = record;
    if (!link?.clientId)
      return <Typography.Text type="secondary">-</Typography.Text>;
    return recordLink(
      link.clientName ?? link.clientCode ?? "-",
      `/setup/client/${link.clientId}`,
    );
  };

  const renderStatus = (status: string, record: UserRow) => {
    const tag = <Tag color={statusColor(status)}>{status}</Tag>;
    // Owners can't be changed; an invite has no account to switch on or off yet.
    if (!onToggleStatus || !canEdit || isOwner(record) || !hasAccount(record))
      return tag;

    const active = isActiveStatus(status);
    const toggle = (
      <Switch
        size="small"
        checked={active}
        loading={togglingId === record.id}
        aria-label={active ? "Revoke access" : "Activate"}
        onClick={active ? undefined : () => onToggleStatus(record, "Active")}
      />
    );
    return (
      <Space size={8}>
        {active ? (
          <Popconfirm
            title="Revoke this user's access?"
            description="They will be signed out until reactivated."
            okText="Revoke"
            okButtonProps={{ danger: true }}
            cancelText="Cancel"
            onConfirm={() => onToggleStatus(record, "Revoked")}
          >
            {toggle}
          </Popconfirm>
        ) : (
          toggle
        )}
        {tag}
      </Space>
    );
  };

  const registry: Record<ColumnKey, ColumnType<UserRow>> = {
    email: resizable("email", {
      title: USER_LABEL.EMAIL,
      dataIndex: "email",
    }),
    fullName: resizable("fullName", {
      title: USER_LABEL.FULL_NAME,
      dataIndex: "fullName",
      render: (fullName: string, record) => {
        const name = fullName || record.link?.name || "-";
        return variant === "employee" ? employeeLink(record, name) : name;
      },
    }),
    type: resizable("type", {
      title: USER_LABEL.TYPE,
      dataIndex: "kind",
      render: (kind: UserKind) => <Tag color={KIND_COLORS[kind]}>{kind}</Tag>,
    }),
    linkedTo: resizable("linkedTo", {
      title: USER_LABEL.LINKED_TO,
      render: (_, record) => {
        if (record.kind === "Client") return clientLink(record);
        if (record.kind === "Employee" && record.link) {
          const label = [record.link.employeeNo, record.link.departmentName]
            .filter(Boolean)
            .join(" · ");
          return employeeLink(record, label || record.link.name || "-");
        }
        return <Typography.Text type="secondary">-</Typography.Text>;
      },
    }),
    employeeNo: resizable("employeeNo", {
      title: USER_LABEL.EMPLOYEE_NO,
      render: (_, record) => record.link?.employeeNo || "-",
    }),
    department: resizable("department", {
      title: USER_LABEL.DEPARTMENT,
      render: (_, record) => record.link?.departmentName || "-",
    }),
    client: resizable("client", {
      title: USER_LABEL.CLIENT,
      render: (_, record) => clientLink(record),
    }),
    roles: resizable("roles", {
      title: USER_LABEL.ROLES,
      dataIndex: "roles",
      render: (roles: string[]) => (
        <Space size={[0, 4]} wrap>
          {roles?.map((role) => (
            <Tag key={role} color={ROLE_COLORS[role] || "default"}>
              {role}
            </Tag>
          ))}
        </Space>
      ),
    }),
    status: resizable("status", {
      title: USER_LABEL.STATUS,
      dataIndex: "status",
      render: renderStatus,
    }),
    actions: {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip
            title={record.portal ? USER_LABEL.EDIT_IN_PORTAL : undefined}
          >
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={record.portal ? USER_LABEL.EDIT_IN_PORTAL : "Edit"}
              onClick={() =>
                navigate({
                  to: record.portal
                    ? "/client-portal/clients"
                    : `/security/users/${record.id}`,
                })
              }
            />
          </Tooltip>
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
          {onDelete && !isOwner(record) && (
            <Popconfirm
              title={
                record.portal
                  ? "Remove this user from the client?"
                  : "Remove this member from the company?"
              }
              description={
                record.portal
                  ? "They will lose access to this client in the client portal."
                  : "This will remove their membership and access from this company."
              }
              onConfirm={() => onDelete(record)}
              okText="Remove"
              cancelText="Cancel"
            >
              <Button
                aria-label="Delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  };

  const columns: ColumnsType<UserRow> = VARIANT_COLUMNS[variant].map(
    (key) => registry[key],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="max-w-80"
        />
        {variant === "client" && (
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={USER_LABEL.ALL_CLIENTS}
            value={clientId}
            onChange={setClientId}
            options={clientOptions}
            className="w-64"
          />
        )}
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
        rowSelection={
          onSelectionChange
            ? {
                selectedRowKeys: selectedIds,
                onChange: (keys) => onSelectionChange(keys.map(String)),
                getCheckboxProps: (record) => ({ disabled: isOwner(record) }),
                preserveSelectedRowKeys: false,
              }
            : undefined
        }
      />
    </div>
  );
}

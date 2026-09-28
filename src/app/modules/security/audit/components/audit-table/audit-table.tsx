import { useState } from "react";
import { Table, Button, Input, Tag, Select } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import type {
  AuditAction,
  AuditModuleOption,
  AuditResponse,
  AuditStatus,
} from "../../models/api/response/audit-response.model";
import {
  AUDIT_LABEL,
  AUDIT_ACTION_COLORS,
  AUDIT_STATUS_COLORS,
} from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { MobileRangePicker } from "@/shared/components/mobile-range-picker";

const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: "LOGIN", label: "Login" },
  { value: "LOGOUT", label: "Logout" },
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "APPROVE", label: "Approve" },
  { value: "REJECT", label: "Reject" },
];

const STATUS_OPTIONS: { value: AuditStatus; label: string }[] = [
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
];

export interface AuditFilters {
  action?: AuditAction;
  status?: AuditStatus;
  module?: string;
  search?: string;
  range?: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;
}

interface Props {
  data: AuditResponse[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  filters: AuditFilters;
  modules: AuditModuleOption[];
  onFiltersChange: (filters: AuditFilters) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

/** One server-side page of the trail; every filter change goes back to the server. */
export default function AuditTable({
  data,
  total,
  page,
  pageSize,
  loading,
  filters,
  modules,
  onFiltersChange,
  onPageChange,
}: Props) {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState(filters.search ?? "");

  const { widths, handleResize } = useResizableColumns({
    timestamp: 180,
    action: 110,
    module: 160,
    userName: 180,
    description: 320,
    status: 100,
  });

  const columns: ColumnsType<AuditResponse> = [
    {
      title: AUDIT_LABEL.TIMESTAMP,
      dataIndex: "timestamp",
      key: "timestamp",
      width: widths.timestamp,
      onHeaderCell: () =>
        ({
          width: widths.timestamp,
          onResize: (w: number) => handleResize("timestamp", w),
        }) as object,
      render: (val: string) => dayjs(val).format("MMM DD, YYYY HH:mm"),
    },
    {
      title: AUDIT_LABEL.ACTION,
      dataIndex: "action",
      key: "action",
      width: widths.action,
      onHeaderCell: () =>
        ({
          width: widths.action,
          onResize: (w: number) => handleResize("action", w),
        }) as object,
      render: (val: string) => (
        <Tag color={AUDIT_ACTION_COLORS[val] ?? "default"}>{val}</Tag>
      ),
    },
    {
      title: AUDIT_LABEL.MODULE,
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
      title: AUDIT_LABEL.USER,
      dataIndex: "userName",
      key: "userName",
      width: widths.userName,
      ellipsis: true,
      onHeaderCell: () =>
        ({
          width: widths.userName,
          onResize: (w: number) => handleResize("userName", w),
        }) as object,
    },
    {
      title: AUDIT_LABEL.DESCRIPTION,
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
      title: AUDIT_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (val: string) => (
        <Tag color={AUDIT_STATUS_COLORS[val] ?? "default"}>{val}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 90,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate({ to: `/security/audit/${record.id}` })}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Input.Search
          placeholder="Search description, user, record..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={(value) =>
            onFiltersChange({ ...filters, search: value.trim() || undefined })
          }
          allowClear
          className="w-full sm:w-72"
        />
        <Select
          allowClear
          placeholder="All actions"
          options={ACTION_OPTIONS}
          value={filters.action}
          onChange={(action) => onFiltersChange({ ...filters, action })}
          className="min-w-40"
        />
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="All modules"
          options={modules}
          value={filters.module}
          onChange={(module) => onFiltersChange({ ...filters, module })}
          className="min-w-48"
        />
        <Select
          allowClear
          placeholder="All statuses"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(status) => onFiltersChange({ ...filters, status })}
          className="min-w-36"
        />
        <MobileRangePicker
          value={filters.range ?? null}
          onChange={(range) =>
            onFiltersChange({
              ...filters,
              range: range ? [range[0] ?? null, range[1] ?? null] : null,
            })
          }
        />
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (count) => `${count} records`,
          onChange: onPageChange,
        }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

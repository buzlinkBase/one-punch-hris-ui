import { useState } from 'react';
import { Table, Button, Input, Tag, Select, DatePicker, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import type { AuditResponse } from '../../models/api/response/audit-response.model';
import {
  AUDIT_LABEL,
  AUDIT_ACTION_COLORS,
  AUDIT_STATUS_COLORS,
} from '../../constants/label.const';

const { RangePicker } = DatePicker;

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'VIEW', label: 'View' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
];

interface Props {
  data: AuditResponse[];
  loading?: boolean;
}

export default function AuditTable({ data, loading }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const filtered = data.filter((item) => {
    const matchesSearch =
      !search ||
      Object.values(item).some((val) =>
        String(val ?? '')
          .toLowerCase()
          .includes(search.toLowerCase()),
      );

    const matchesAction = !actionFilter || item.action === actionFilter;
    const matchesStatus = !statusFilter || item.status === statusFilter;

    const matchesDate =
      !dateRange ||
      !dateRange[0] ||
      !dateRange[1] ||
      (dayjs(item.timestamp).isAfter(dateRange[0].startOf('day')) &&
        dayjs(item.timestamp).isBefore(dateRange[1].endOf('day')));

    return matchesSearch && matchesAction && matchesStatus && matchesDate;
  });

  const columns: ColumnsType<AuditResponse> = [
    {
      title: AUDIT_LABEL.TIMESTAMP,
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
      defaultSortOrder: 'descend',
      render: (val: string) => dayjs(val).format('MMM DD, YYYY HH:mm'),
    },
    {
      title: AUDIT_LABEL.ACTION,
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (val: string) => (
        <Tag color={AUDIT_ACTION_COLORS[val] ?? 'default'}>{val}</Tag>
      ),
    },
    {
      title: AUDIT_LABEL.MODULE,
      dataIndex: 'module',
      key: 'module',
      width: 160,
    },
    {
      title: AUDIT_LABEL.USER,
      dataIndex: 'userName',
      key: 'userName',
      width: 160,
    },
    {
      title: AUDIT_LABEL.DESCRIPTION,
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: AUDIT_LABEL.STATUS,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (val: string) => (
        <Tag color={AUDIT_STATUS_COLORS[val] ?? 'default'}>{val}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
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
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 260 }}
        />
        <Select
          options={ACTION_OPTIONS}
          value={actionFilter}
          onChange={setActionFilter}
          style={{ minWidth: 150 }}
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ minWidth: 140 }}
        />
        <Space.Compact>
          <RangePicker
            onChange={(range) =>
              setDateRange(
                range
                  ? [range[0] ?? null, range[1] ?? null]
                  : null,
              )
            }
          />
        </Space.Compact>
      </div>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 15, showTotal: (total) => `${total} records` }}
        scroll={{ x: 'max-content' }}
        sticky
      />
    </div>
  );
}

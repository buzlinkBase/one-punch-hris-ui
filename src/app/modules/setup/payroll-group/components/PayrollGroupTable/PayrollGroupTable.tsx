import { Table, Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@tanstack/react-router';
import type { PayrollGroupResponse } from '../../models/api/response/payroll-group-response.model';
import { PAYROLL_GROUP_LABEL } from '../../constants/label.const';

interface Props {
  data: PayrollGroupResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function PayrollGroupTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const columns: ColumnsType<PayrollGroupResponse> = [
    { title: PAYROLL_GROUP_LABEL.CODE, dataIndex: 'code', key: 'code' },
    { title: PAYROLL_GROUP_LABEL.NAME, dataIndex: 'name', key: 'name' },
    { title: PAYROLL_GROUP_LABEL.DESCRIPTION, dataIndex: 'description', key: 'description' },
    { title: PAYROLL_GROUP_LABEL.STATUS, dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate({ to: `/setup/payroll-group/${record.id}` })}>Edit</Button>
          {onDelete && (
            <Popconfirm title="Delete this payroll group?" onConfirm={() => onDelete(record.id)} okText="Yes" cancelText="No">
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" dataSource={data} columns={columns} loading={loading} pagination={{ pageSize: 10 }} sticky />;
}

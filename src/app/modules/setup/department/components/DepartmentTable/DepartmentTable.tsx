import { Table, Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@tanstack/react-router';
import type { DepartmentResponse } from '../../models/api/response/department-response.model';
import { DEPARTMENT_LABEL } from '../../constants/label.const';

interface Props {
  data: DepartmentResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function DepartmentTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const columns: ColumnsType<DepartmentResponse> = [
    { title: DEPARTMENT_LABEL.CODE, dataIndex: 'code', key: 'code' },
    { title: DEPARTMENT_LABEL.NAME, dataIndex: 'name', key: 'name' },
    { title: DEPARTMENT_LABEL.STATUS, dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate({ to: `/setup/department/${record.id}` })}>
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this department?"
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
    <Table
      rowKey="id"
      dataSource={data}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
}

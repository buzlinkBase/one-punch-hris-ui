import { Table, Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@tanstack/react-router';
import type { EmployeeResponse } from '../../models/api/response/employee-response.model';
import { EMPLOYEE_LABEL } from '../../constants/label.const';

interface Props {
  data: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function EmployeeTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const columns: ColumnsType<EmployeeResponse> = [
    { title: EMPLOYEE_LABEL.EMPLOYEE_NO, dataIndex: 'employeeNo', key: 'employeeNo' },
    { title: EMPLOYEE_LABEL.LAST_NAME, dataIndex: 'lastName', key: 'lastName' },
    { title: EMPLOYEE_LABEL.FIRST_NAME, dataIndex: 'firstName', key: 'firstName' },
    { title: EMPLOYEE_LABEL.EMPLOYMENT_STATUS, dataIndex: 'employmentStatus', key: 'employmentStatus' },
    { title: EMPLOYEE_LABEL.STATUS, dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate({ to: `/setup/employee/${record.id}` })}>
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this employee?"
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

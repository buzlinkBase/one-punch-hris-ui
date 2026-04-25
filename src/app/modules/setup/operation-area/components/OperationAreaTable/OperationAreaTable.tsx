import { Table, Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@tanstack/react-router';
import type { OperationAreaResponse } from '../../models/api/response/operation-area-response.model';
import { OPERATION_AREA_LABEL } from '../../constants/label.const';

interface Props {
  data: OperationAreaResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function OperationAreaTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const columns: ColumnsType<OperationAreaResponse> = [
    { title: OPERATION_AREA_LABEL.CODE, dataIndex: 'code', key: 'code' },
    { title: OPERATION_AREA_LABEL.NAME, dataIndex: 'name', key: 'name' },
    { title: OPERATION_AREA_LABEL.STATUS, dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate({ to: `/setup/operation-area/${record.id}` })}>Edit</Button>
          {onDelete && (
            <Popconfirm title="Delete this operation area?" onConfirm={() => onDelete(record.id)} okText="Yes" cancelText="No">
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" dataSource={data} columns={columns} loading={loading} pagination={{ pageSize: 10 }} />;
}

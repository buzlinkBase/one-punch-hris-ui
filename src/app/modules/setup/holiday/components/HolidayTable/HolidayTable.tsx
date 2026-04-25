import { Table, Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@tanstack/react-router';
import type { HolidayResponse } from '../../models/api/response/holiday-response.model';
import { HOLIDAY_LABEL } from '../../constants/label.const';

interface Props {
  data: HolidayResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function HolidayTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const columns: ColumnsType<HolidayResponse> = [
    { title: HOLIDAY_LABEL.NAME, dataIndex: 'name', key: 'name' },
    { title: HOLIDAY_LABEL.DATE, dataIndex: 'date', key: 'date' },
    { title: HOLIDAY_LABEL.TYPE, dataIndex: 'type', key: 'type' },
    { title: HOLIDAY_LABEL.STATUS, dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate({ to: `/setup/holiday/${record.id}` })}>Edit</Button>
          {onDelete && (
            <Popconfirm title="Delete this holiday?" onConfirm={() => onDelete(record.id)} okText="Yes" cancelText="No">
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" dataSource={data} columns={columns} loading={loading} pagination={{ pageSize: 10 }} sticky />;
}

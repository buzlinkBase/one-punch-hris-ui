import { Table, Button, Space, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from '@tanstack/react-router';
import type { FlexiTimeShiftResponse } from '../../models/api/response/flexi-time-shift-response.model';
import { FLEXI_TIME_SHIFT_LABEL } from '../../constants/label.const';

interface Props {
  data: FlexiTimeShiftResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function FlexiTimeShiftTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const columns: ColumnsType<FlexiTimeShiftResponse> = [
    { title: FLEXI_TIME_SHIFT_LABEL.CODE, dataIndex: 'code', key: 'code' },
    { title: FLEXI_TIME_SHIFT_LABEL.NAME, dataIndex: 'name', key: 'name' },
    { title: FLEXI_TIME_SHIFT_LABEL.CORE_TIME_START, dataIndex: 'coreTimeStart', key: 'coreTimeStart' },
    { title: FLEXI_TIME_SHIFT_LABEL.CORE_TIME_END, dataIndex: 'coreTimeEnd', key: 'coreTimeEnd' },
    { title: FLEXI_TIME_SHIFT_LABEL.STATUS, dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => navigate({ to: `/setup/time-shift/flexi/${record.id}` })}>Edit</Button>
          {onDelete && (
            <Popconfirm title="Delete this shift?" onConfirm={() => onDelete(record.id)} okText="Yes" cancelText="No">
              <Button type="link" danger>Delete</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return <Table rowKey="id" dataSource={data} columns={columns} loading={loading} pagination={{ pageSize: 10 }} sticky />;
}

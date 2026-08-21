import { Button, Popconfirm, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import type { OtherIncomeTypeResponse } from "../../models/api/response/other-income-type-response.model";

interface Props {
  data: OtherIncomeTypeResponse[];
  loading?: boolean;
  onEdit: (record: OtherIncomeTypeResponse) => void;
  onDelete: (id: string) => void;
}

export default function OtherIncomeTypeTable({
  data,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const columns: ColumnsType<OtherIncomeTypeResponse> = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Delete this income type?"
            onConfirm={() => onDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
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
      size="small"
      pagination={{ pageSize: 20, showSizeChanger: false }}
    />
  );
}

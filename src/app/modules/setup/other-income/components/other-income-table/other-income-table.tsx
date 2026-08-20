import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import type { OtherIncomeResponse } from "../../models/api/response/other-income-response.model";
import type { OtherIncomeTypeResponse } from "@/app/modules/setup/other-income-type/models/api/response/other-income-type-response.model";
import {
  INCOME_CLASS_COLOR,
  INCOME_CLASS_LABEL,
} from "../../constants/label.const";

interface Props {
  data: OtherIncomeResponse[];
  types: OtherIncomeTypeResponse[];
  loading?: boolean;
  onEdit: (record: OtherIncomeResponse) => void;
  onDelete: (id: string) => void;
}

export default function OtherIncomeTable({
  data,
  types,
  loading,
  onEdit,
  onDelete,
}: Props) {
  const typeMap = Object.fromEntries(types.map((t) => [t.id, t.description]));

  const columns: ColumnsType<OtherIncomeResponse> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Income Class",
      dataIndex: "incomeClass",
      key: "incomeClass",
      render: (v) => (
        <Tag color={INCOME_CLASS_COLOR[v] ?? "default"}>
          {INCOME_CLASS_LABEL[v] ?? v}
        </Tag>
      ),
    },
    {
      title: "Income Type",
      dataIndex: "incomeTypeId",
      key: "incomeTypeId",
      render: (v) => typeMap[v] ?? "—",
    },
    {
      title: "Taxable",
      dataIndex: "isTaxable",
      key: "isTaxable",
      width: 80,
      render: (v) =>
        v ? (
          <CheckOutlined style={{ color: "#1DA081" }} />
        ) : (
          <CloseOutlined style={{ color: "#aaa" }} />
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (v: string) => (
        <Tag color={v === "Active" ? "success" : "default"}>
          {v ?? "Active"}
        </Tag>
      ),
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
            title="Delete this income item?"
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

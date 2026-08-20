import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { DeductionApplicationResponse } from "../../models/api/response/deduction-application-response.model";
import { FREQUENCY_LABEL } from "../../constants/label.const";

interface Props {
  data: DeductionApplicationResponse[];
  loading?: boolean;
  employeeMap?: Record<string, string>;
  deductionMap?: Record<string, string>;
  onEdit: (record: DeductionApplicationResponse) => void;
  onDelete: (id: string) => void;
}

export default function DeductionApplicationTable({
  data,
  loading,
  employeeMap = {},
  deductionMap = {},
  onEdit,
  onDelete,
}: Props) {
  const columns: ColumnsType<DeductionApplicationResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (v) => employeeMap[v] ?? v,
    },
    {
      title: "Deduction",
      dataIndex: "deductionId",
      key: "deductionId",
      render: (v) => deductionMap[v] ?? v,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (v) =>
        v ? dayjs(v.replace(/Z$/, "")).format("MMM DD, YYYY") : "—",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (v) =>
        v ? dayjs(v.replace(/Z$/, "")).format("MMM DD, YYYY") : "—",
    },
    {
      title: "Frequency",
      dataIndex: "frequencyOfPayment",
      key: "frequencyOfPayment",
      render: (v) => <Tag>{FREQUENCY_LABEL[v] ?? v}</Tag>,
    },
    {
      title: "Terms",
      dataIndex: "terms",
      key: "terms",
      align: "right",
    },
    {
      title: "Principal",
      dataIndex: "totalPrincipal",
      key: "totalPrincipal",
      align: "right",
      render: (v: number) =>
        v?.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (v: number) =>
        v?.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
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
            title="Delete this loan/deduction record?"
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

import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { OtherIncomeApplicationResponse } from "../../models/api/response/other-income-application-response.model";
import { FREQUENCY_LABEL } from "../../constants/label.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

interface Props {
  data: OtherIncomeApplicationResponse[];
  loading?: boolean;
  employeeMap?: Record<string, string>;
  incomeMap?: Record<string, string>;
  onEdit: (record: OtherIncomeApplicationResponse) => void;
  onDelete: (id: string) => void;
}

export default function OtherIncomeApplicationTable({
  data,
  loading,
  employeeMap = {},
  incomeMap = {},
  onEdit,
  onDelete,
}: Props) {
  const columns: ColumnsType<OtherIncomeApplicationResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (v) => employeeMap[v] ?? v,
    },
    {
      title: "Income Type",
      dataIndex: "incomeId",
      key: "incomeId",
      render: (v) => incomeMap[v] ?? v,
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
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (v: number) =>
        v?.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    },
    {
      title: "Taxable",
      dataIndex: "isTaxable",
      key: "isTaxable",
      align: "center",
      render: (v: boolean) => (v ? "Yes" : "No"),
    },
    {
      title: "Prorated",
      dataIndex: "isProrated",
      key: "isProrated",
      align: "center",
      render: (v: boolean) => (v ? "Yes" : "—"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      render: (_, record) => (
        <Space size="small">
          <PermissionGate permission="Other Income:Edit">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </PermissionGate>
          <PermissionGate permission="Other Income:Delete">
            <Popconfirm
              title="Delete this income application?"
              onConfirm={() => onDelete(record.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                type="text"
                icon={<DeleteOutlined />}
                danger
              />
            </Popconfirm>
          </PermissionGate>
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

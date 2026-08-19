import { Table, Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { WtaxTableResponse } from "../../models/api/response/wtax-table-response.model";
import { WTAX_TABLE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: WtaxTableResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const fmt = (v: number) =>
  v.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function WtaxTableTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const { widths, handleResize } = useResizableColumns({
    rangeFrom: 130,
    rangeTo: 130,
    baseTaxDue: 130,
    addOnPercentage: 150,
  });

  const columns: ColumnsType<WtaxTableResponse> = [
    {
      title: WTAX_TABLE_LABEL.RANGE_FROM,
      dataIndex: "rangeFrom",
      key: "rangeFrom",
      width: widths.rangeFrom,
      onHeaderCell: () =>
        ({
          width: widths.rangeFrom,
          onResize: (w: number) => handleResize("rangeFrom", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: WTAX_TABLE_LABEL.RANGE_TO,
      dataIndex: "rangeTo",
      key: "rangeTo",
      width: widths.rangeTo,
      onHeaderCell: () =>
        ({
          width: widths.rangeTo,
          onResize: (w: number) => handleResize("rangeTo", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: WTAX_TABLE_LABEL.BASE_TAX_DUE,
      dataIndex: "baseTaxDue",
      key: "baseTaxDue",
      width: widths.baseTaxDue,
      onHeaderCell: () =>
        ({
          width: widths.baseTaxDue,
          onResize: (w: number) => handleResize("baseTaxDue", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: WTAX_TABLE_LABEL.ADD_ON_PERCENTAGE,
      dataIndex: "addOnPercentage",
      key: "addOnPercentage",
      width: widths.addOnPercentage,
      onHeaderCell: () =>
        ({
          width: widths.addOnPercentage,
          onResize: (w: number) => handleResize("addOnPercentage", w),
        }) as object,
      render: (v: number) => `${(v * 100).toFixed(4)}%`,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate({ to: `/setup/wtax-table/${record.id}` })}
          />
          {onDelete && (
            <Popconfirm
              title="Delete this bracket?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
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
      size="small"
      loading={loading}
      pagination={{ pageSize: 20 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}

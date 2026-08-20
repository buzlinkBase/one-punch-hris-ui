import { Table, Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { SssTableResponse } from "../../models/api/response/sss-table-response.model";
import { SSS_TABLE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: SssTableResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const fmt = (v: number) =>
  (v ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function SssTableTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const { widths, handleResize } = useResizableColumns({
    rangeFrom: 130,
    rangeTo: 130,
    msc: 110,
    ee: 110,
    er: 110,
    ec: 100,
    totalContibution: 150,
  });

  const columns: ColumnsType<SssTableResponse> = [
    {
      title: SSS_TABLE_LABEL.RANGE_FROM,
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
      title: SSS_TABLE_LABEL.RANGE_TO,
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
      title: SSS_TABLE_LABEL.MSC,
      dataIndex: "msc",
      key: "msc",
      width: widths.msc,
      onHeaderCell: () =>
        ({
          width: widths.msc,
          onResize: (w: number) => handleResize("msc", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: SSS_TABLE_LABEL.EE,
      dataIndex: "ee",
      key: "ee",
      width: widths.ee,
      onHeaderCell: () =>
        ({
          width: widths.ee,
          onResize: (w: number) => handleResize("ee", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: SSS_TABLE_LABEL.ER,
      dataIndex: "er",
      key: "er",
      width: widths.er,
      onHeaderCell: () =>
        ({
          width: widths.er,
          onResize: (w: number) => handleResize("er", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: SSS_TABLE_LABEL.EC,
      dataIndex: "ec",
      key: "ec",
      width: widths.ec,
      onHeaderCell: () =>
        ({
          width: widths.ec,
          onResize: (w: number) => handleResize("ec", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: SSS_TABLE_LABEL.TOTAL,
      dataIndex: "totalContibution",
      key: "totalContibution",
      width: widths.totalContibution,
      onHeaderCell: () =>
        ({
          width: widths.totalContibution,
          onResize: (w: number) => handleResize("totalContibution", w),
        }) as object,
      render: (v: number) => fmt(v),
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
            onClick={() => navigate({ to: `/setup/sss-table/${record.id}` })}
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

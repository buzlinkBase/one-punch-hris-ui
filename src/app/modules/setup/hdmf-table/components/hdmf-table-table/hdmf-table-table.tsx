import { Table, Button, Space, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { HdmfTableResponse } from "../../models/api/response/hdmf-table-response.model";
import { HDMF_TABLE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: HdmfTableResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const fmt = (v: number) =>
  v.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtRate = (v: number) => `${(v * 100).toFixed(4)}%`;

export default function HdmfTableTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const { widths, handleResize } = useResizableColumns({
    minSalaryBase: 140,
    maxSalaryBase: 140,
    employeeRate: 120,
    employerRate: 120,
    employeeShare: 130,
    employerShare: 130,
    totalContribution: 150,
    remarks: 200,
  });

  const columns: ColumnsType<HdmfTableResponse> = [
    {
      title: HDMF_TABLE_LABEL.MIN_SALARY_BASE,
      dataIndex: "minSalaryBase",
      key: "minSalaryBase",
      width: widths.minSalaryBase,
      onHeaderCell: () =>
        ({
          width: widths.minSalaryBase,
          onResize: (w: number) => handleResize("minSalaryBase", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: HDMF_TABLE_LABEL.MAX_SALARY_BASE,
      dataIndex: "maxSalaryBase",
      key: "maxSalaryBase",
      width: widths.maxSalaryBase,
      onHeaderCell: () =>
        ({
          width: widths.maxSalaryBase,
          onResize: (w: number) => handleResize("maxSalaryBase", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: HDMF_TABLE_LABEL.EMPLOYEE_RATE,
      dataIndex: "employeeRate",
      key: "employeeRate",
      width: widths.employeeRate,
      onHeaderCell: () =>
        ({
          width: widths.employeeRate,
          onResize: (w: number) => handleResize("employeeRate", w),
        }) as object,
      render: (v: number) => fmtRate(v),
    },
    {
      title: HDMF_TABLE_LABEL.EMPLOYER_RATE,
      dataIndex: "employerRate",
      key: "employerRate",
      width: widths.employerRate,
      onHeaderCell: () =>
        ({
          width: widths.employerRate,
          onResize: (w: number) => handleResize("employerRate", w),
        }) as object,
      render: (v: number) => fmtRate(v),
    },
    {
      title: HDMF_TABLE_LABEL.EMPLOYEE_SHARE,
      dataIndex: "employeeShare",
      key: "employeeShare",
      width: widths.employeeShare,
      onHeaderCell: () =>
        ({
          width: widths.employeeShare,
          onResize: (w: number) => handleResize("employeeShare", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: HDMF_TABLE_LABEL.EMPLOYER_SHARE,
      dataIndex: "employerShare",
      key: "employerShare",
      width: widths.employerShare,
      onHeaderCell: () =>
        ({
          width: widths.employerShare,
          onResize: (w: number) => handleResize("employerShare", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: HDMF_TABLE_LABEL.TOTAL,
      dataIndex: "totalContribution",
      key: "totalContribution",
      width: widths.totalContribution,
      onHeaderCell: () =>
        ({
          width: widths.totalContribution,
          onResize: (w: number) => handleResize("totalContribution", w),
        }) as object,
      render: (v: number) => fmt(v),
    },
    {
      title: HDMF_TABLE_LABEL.REMARKS,
      dataIndex: "remarks",
      key: "remarks",
      width: widths.remarks,
      ellipsis: true,
      onHeaderCell: () =>
        ({
          width: widths.remarks,
          onResize: (w: number) => handleResize("remarks", w),
        }) as object,
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
            onClick={() => navigate({ to: `/setup/hdmf-table/${record.id}` })}
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

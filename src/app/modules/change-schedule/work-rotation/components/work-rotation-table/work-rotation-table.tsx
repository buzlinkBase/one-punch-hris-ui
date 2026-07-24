import { Table, Button, Space, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { WorkRotationResponse } from "../../models/api/response/work-rotation-response.model";
import { WORK_ROTATION_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: WorkRotationResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function WorkRotationTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const { widths, handleResize } = useResizableColumns({
    payrollDate: 120,
    fullName: 150,
    shiftName: 150,
  });

  const columns: ColumnsType<WorkRotationResponse> = [
    {
      title: WORK_ROTATION_LABEL.PAYROLL_DATE,
      dataIndex: "payrollDate",
      key: "payrollDate",
      width: widths.payrollDate,
      onHeaderCell: () =>
        ({
          width: widths.payrollDate,
          onResize: (w: number) => handleResize("payrollDate", w),
        }) as object,
    },
    {
      title: WORK_ROTATION_LABEL.EMPLOYEE,
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    {
      title: WORK_ROTATION_LABEL.TIME_SHIFT,
      dataIndex: "shiftName",
      key: "shiftName",
      width: widths.shiftName,
      onHeaderCell: () =>
        ({
          width: widths.shiftName,
          onResize: (w: number) => handleResize("shiftName", w),
        }) as object,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate({ to: `/change-schedule/work-rotation/${record.id}` })
            }
          >
            Change Work Plan
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this record?"
              onConfirm={() => onDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>
                Delete
              </Button>
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
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}

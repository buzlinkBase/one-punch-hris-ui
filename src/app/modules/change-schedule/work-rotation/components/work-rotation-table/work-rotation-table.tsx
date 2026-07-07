import { Table, Button, Space, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { WorkRotationResponse } from "../../models/api/response/work-rotation-response.model";
import { WORK_ROTATION_LABEL } from "../../constants/label.const";

interface Props {
  data: WorkRotationResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function WorkRotationTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();

  const columns: ColumnsType<WorkRotationResponse> = [
    {
      title: WORK_ROTATION_LABEL.PAYROLL_DATE,
      dataIndex: "payrollDate",
      key: "payrollDate",
    },
    {
      title: WORK_ROTATION_LABEL.EMPLOYEE,
      dataIndex: "employeeName",
      key: "employeeName",
    },
    {
      title: WORK_ROTATION_LABEL.TIME_SHIFT,
      dataIndex: "timeShiftName",
      key: "timeShiftName",
    },
    {
      title: WORK_ROTATION_LABEL.CLIENT,
      dataIndex: "clientName",
      key: "clientName",
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
    />
  );
}

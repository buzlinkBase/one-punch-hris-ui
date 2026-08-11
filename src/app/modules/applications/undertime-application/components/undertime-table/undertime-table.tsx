import { Table, Button, Space, Popconfirm, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { UndertimeApplicationResponse } from "../../models/api/response/undertime-application-response.model";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import { UNDERTIME_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
};

interface Props {
  data: UndertimeApplicationResponse[];
  employees: EmployeeFilterResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onApprove?: (record: UndertimeApplicationResponse) => void;
  onDecline?: (record: UndertimeApplicationResponse) => void;
}

export default function UndertimeTable({
  data,
  employees,
  loading,
  onDelete,
  onApprove,
  onDecline,
}: Props) {
  const navigate = useNavigate();
  const empMap = new Map(employees.map((e) => [e.id, e.name ?? e.id]));

  const { widths, handleResize } = useResizableColumns({
    employee: 220,
    date: 120,
    utMinutes: 140,
    remarks: 220,
    status: 130,
  });

  const columns: ColumnsType<UndertimeApplicationResponse> = [
    {
      title: UNDERTIME_LABEL.EMPLOYEE,
      key: "employee",
      width: widths.employee,
      onHeaderCell: () =>
        ({
          width: widths.employee,
          onResize: (w: number) => handleResize("employee", w),
        }) as object,
      render: (_, r) => empMap.get(r.employeeId) ?? r.employeeId,
    },
    {
      title: UNDERTIME_LABEL.DATE,
      dataIndex: "payrollDate",
      key: "date",
      width: widths.date,
      onHeaderCell: () =>
        ({
          width: widths.date,
          onResize: (w: number) => handleResize("date", w),
        }) as object,
    },
    {
      title: UNDERTIME_LABEL.UT_MINUTES,
      dataIndex: "utMinutes",
      key: "utMinutes",
      width: widths.utMinutes,
      onHeaderCell: () =>
        ({
          width: widths.utMinutes,
          onResize: (w: number) => handleResize("utMinutes", w),
        }) as object,
      render: (val: number) =>
        val > 0 ? (
          `${val} min (override)`
        ) : (
          <Tag color="blue">No Deduction</Tag>
        ),
    },
    {
      title: UNDERTIME_LABEL.REMARKS,
      dataIndex: "remarks",
      key: "remarks",
      width: widths.remarks,
      onHeaderCell: () =>
        ({
          width: widths.remarks,
          onResize: (w: number) => handleResize("remarks", w),
        }) as object,
      ellipsis: true,
    },
    {
      title: UNDERTIME_LABEL.STATUS,
      dataIndex: "approvalStatus",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (val: string) => (
        <Tag color={STATUS_COLOR[val] ?? "default"}>
          {STATUS_LABEL[val] ?? val}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          {onApprove && record.approvalStatus === "ForApproval" && (
            <Popconfirm
              title="Approve this undertime application?"
              onConfirm={() => onApprove(record)}
              okText="Approve"
              cancelText="Cancel"
            >
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "#52c41a" }}
              />
            </Popconfirm>
          )}
          {onDecline && record.approvalStatus === "ForApproval" && (
            <Popconfirm
              title="Decline this undertime application?"
              onConfirm={() => onDecline(record)}
              okText="Decline"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
            >
              <Button type="text" danger icon={<CloseOutlined />} />
            </Popconfirm>
          )}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              navigate({ to: `/applications/undertime/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this undertime application?"
              onConfirm={() => onDelete(record.id)}
              okText="Delete"
              okButtonProps={{ danger: true }}
              cancelText="Cancel"
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
      pagination={{ pageSize: 15 }}
      scroll={{ x: "max-content" }}
      sticky
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}

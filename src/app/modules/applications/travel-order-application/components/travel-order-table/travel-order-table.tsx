import { Table, Button, Space, Popconfirm, Tag } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { TravelOrderApplicationResponse } from "../../models/api/response/travel-order-application-response.model";
import type { EmployeeFilterResponse } from "@/app/modules/timekeeping/attendance-entry/models/api/response/employee-filter-response.model";
import {
  TRAVEL_ORDER_LABEL,
  TRAVEL_CLASSIFICATION_OPTIONS,
} from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

const STATUS_COLOR: Record<string, string> = {
  ForApproval: "warning",
  Approved: "success",
  Cancelled: "default",
  Declined: "error",
  Withdrawn: "default",
};

const STATUS_LABEL: Record<string, string> = {
  ForApproval: "For Approval",
  Approved: "Approved",
  Cancelled: "Cancelled",
  Declined: "Declined",
  Withdrawn: "Withdrawn",
};

const classificationLabel = new Map(
  TRAVEL_CLASSIFICATION_OPTIONS.map((o) => [o.value, o.label]),
);

interface Props {
  data: TravelOrderApplicationResponse[];
  employees: EmployeeFilterResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onApprove?: (record: TravelOrderApplicationResponse) => void;
  onDecline?: (record: TravelOrderApplicationResponse) => void;
}

export default function TravelOrderTable({
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
    employee: 200,
    dateFrom: 110,
    dateTo: 110,
    days: 80,
    destination: 160,
    classification: 150,
    status: 120,
  });

  const columns: ColumnsType<TravelOrderApplicationResponse> = [
    {
      title: TRAVEL_ORDER_LABEL.EMPLOYEE,
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
      title: TRAVEL_ORDER_LABEL.START_DATE,
      dataIndex: "startDate",
      key: "dateFrom",
      width: widths.dateFrom,
      onHeaderCell: () =>
        ({
          width: widths.dateFrom,
          onResize: (w: number) => handleResize("dateFrom", w),
        }) as object,
    },
    {
      title: TRAVEL_ORDER_LABEL.END_DATE,
      dataIndex: "endDate",
      key: "dateTo",
      width: widths.dateTo,
      onHeaderCell: () =>
        ({
          width: widths.dateTo,
          onResize: (w: number) => handleResize("dateTo", w),
        }) as object,
      render: (val: string, r) => {
        const crossDay = val && r.startDate && val !== r.startDate;
        return (
          <Space size={4}>
            {val ?? "—"}
            {crossDay && (
              <Tag color="orange" className="text-[10px]! m-0!">
                +1
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Duration",
      key: "days",
      width: widths.days,
      onHeaderCell: () =>
        ({
          width: widths.days,
          onResize: (w: number) => handleResize("days", w),
        }) as object,
      render: (_, r) => {
        if (r.isManualEntry && r.totalMinutes != null) {
          return `${(r.totalMinutes / 60).toFixed(2)} hrs`;
        }
        return r.days != null ? `${r.days} day${r.days !== 1 ? "s" : ""}` : "-";
      },
    },
    {
      title: TRAVEL_ORDER_LABEL.DESTINATION,
      dataIndex: "destination",
      key: "destination",
      width: widths.destination,
      onHeaderCell: () =>
        ({
          width: widths.destination,
          onResize: (w: number) => handleResize("destination", w),
        }) as object,
    },
    {
      title: TRAVEL_ORDER_LABEL.CLASSIFICATION,
      dataIndex: "classification",
      key: "classification",
      width: widths.classification,
      onHeaderCell: () =>
        ({
          width: widths.classification,
          onResize: (w: number) => handleResize("classification", w),
        }) as object,
      render: (val: string) => (
        <Tag color="blue">{classificationLabel.get(val) ?? val}</Tag>
      ),
    },
    {
      title: TRAVEL_ORDER_LABEL.STATUS,
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
              title="Approve this travel order?"
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
              title="Decline this travel order?"
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
              navigate({ to: `/applications/official-business/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this travel order application?"
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

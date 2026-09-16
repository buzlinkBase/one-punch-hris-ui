import React from "react";
import {
  Button,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { AttendanceEntryResponse } from "../../models/api/response/attendance-entry-response.model";
import { ATTENDANCE_ENTRY_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

interface Props {
  data: AttendanceEntryResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (record: AttendanceEntryResponse) => void;
  emptyText?: React.ReactNode;
}

export default function AttendanceEntryTable({
  data,
  loading,
  onDelete,
  onEdit,
  emptyText,
}: Props) {
  const { widths, handleResize } = useResizableColumns({
    employeeName: 150,
    timeLog: 180,
    batchCode: 200,
    remarks: 220,
    actions: 140,
  });

  const columns: ColumnsType<AttendanceEntryResponse> = [
    {
      title: ATTENDANCE_ENTRY_LABEL.EMPLOYEE,
      dataIndex: "employeeName",
      key: "employeeName",
      width: widths.employeeName,
      onHeaderCell: () =>
        ({
          width: widths.employeeName,
          onResize: (w: number) => handleResize("employeeName", w),
        }) as object,
    },
    {
      title: ATTENDANCE_ENTRY_LABEL.TIME_LOG,
      dataIndex: "timeLog",
      key: "timeLog",
      width: widths.timeLog,
      onHeaderCell: () =>
        ({
          width: widths.timeLog,
          onResize: (w: number) => handleResize("timeLog", w),
        }) as object,
      render: (value: string) => dayjs(value).format("MMM DD, YYYY hh:mm A"),
    },
    {
      title: "Batch",
      dataIndex: "batchCode",
      key: "batchCode",
      width: widths.batchCode,
      onHeaderCell: () =>
        ({
          width: widths.batchCode,
          onResize: (w: number) => handleResize("batchCode", w),
        }) as object,
      render: (code: string | null | undefined) =>
        code ? (
          <Tag color="blue">{code}</Tag>
        ) : (
          <Tag color="default">Manual</Tag>
        ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      width: widths.remarks,
      onHeaderCell: () =>
        ({
          width: widths.remarks,
          onResize: (w: number) => handleResize("remarks", w),
        }) as object,
      render: (v: string | null) =>
        v ? (
          <Tooltip title={v}>
            <Typography.Text ellipsis style={{ maxWidth: widths.remarks - 16 }}>
              {v}
            </Typography.Text>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: widths.actions,
      onHeaderCell: () =>
        ({
          width: widths.actions,
          onResize: (w: number) => handleResize("actions", w),
        }) as object,
      render: (_, record) => (
        <Space>
          {onEdit && (
            <PermissionGate permission="Attendance Manual Entry:Edit">
              <Button type="link" size="small" onClick={() => onEdit(record)}>
                Edit
              </Button>
            </PermissionGate>
          )}
          {onDelete && (
            <PermissionGate permission="Attendance Manual Entry:Delete">
              <Popconfirm
                title="Delete this time log?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => onDelete(record.id)}
              >
                <Button type="link" danger size="small">
                  Delete
                </Button>
              </Popconfirm>
            </PermissionGate>
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
      locale={emptyText ? { emptyText } : undefined}
      components={{ header: { cell: ResizableTitle } }}
    />
  );
}

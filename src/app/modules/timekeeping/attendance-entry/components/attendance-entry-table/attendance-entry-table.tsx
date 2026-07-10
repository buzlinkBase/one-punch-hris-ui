import React from "react";
import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { AttendanceEntryResponse } from "../../models/api/response/attendance-entry-response.model";
import { ATTENDANCE_ENTRY_LABEL } from "../../constants/label.const";

interface Props {
  data: AttendanceEntryResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  emptyText?: React.ReactNode;
}

const columns = (
  onDelete?: (id: string) => void,
): ColumnsType<AttendanceEntryResponse> => [
  {
    title: ATTENDANCE_ENTRY_LABEL.EMPLOYEE,
    dataIndex: "employeeName",
    key: "employeeName",
  },
  {
    title: ATTENDANCE_ENTRY_LABEL.TIME_LOG,
    dataIndex: "timeLog",
    key: "timeLog",
    render: (value: string) => dayjs(value).format("MMM DD, YYYY hh:mm A"),
  },
  {
    title: "Batch",
    dataIndex: "batchCode",
    key: "batchCode",
    width: 200,
    render: (code: string | null | undefined) =>
      code ? <Tag color="blue">{code}</Tag> : <Tag color="default">Manual</Tag>,
  },
  {
    title: "Actions",
    key: "actions",
    width: 140,
    render: (_, record) => (
      <Space>
        {onDelete && (
          <Popconfirm
            title="Delete this time log?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => onDelete(record.id)}
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

export default function AttendanceEntryTable({
  data,
  loading,
  onDelete,
  emptyText,
}: Props) {
  return (
    <Table
      rowKey="id"
      dataSource={data}
      columns={columns(onDelete)}
      size="small"
      loading={loading}
      pagination={{ pageSize: 10 }}
      scroll={{ x: "max-content" }}
      sticky
      locale={emptyText ? { emptyText } : undefined}
    />
  );
}

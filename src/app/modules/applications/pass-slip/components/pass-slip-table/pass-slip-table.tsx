import { useMemo } from "react";
import { Button, Popconfirm, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  RollbackOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import type { PassSlipResponse } from "../../models/api/response/pass-slip-response.model";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "../../constants/label.const";

interface PassSlipGroup {
  key: string;
  employeeId: string;
  employeeName?: string;
  applicationDate: string;
  logs: PassSlipResponse[];
}

interface Props {
  data: PassSlipResponse[];
  loading?: boolean;
  onEdit: (record: PassSlipResponse) => void;
  onApprove: (record: PassSlipResponse) => void;
  onRevoke: (record: PassSlipResponse) => void;
  onDelete: (id: string) => void;
}

const { Text } = Typography;

function fmtDateTime(v?: string) {
  if (!v) return "—";
  return dayjs(v.replace(/Z$/, "")).format("MMM DD, YYYY HH:mm");
}

function LogActions({
  record,
  onEdit,
  onApprove,
  onRevoke,
  onDelete,
}: {
  record: PassSlipResponse;
  onEdit: (r: PassSlipResponse) => void;
  onApprove: (r: PassSlipResponse) => void;
  onRevoke: (r: PassSlipResponse) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Space size="small">
      {record.approvalStatus === "ForApproval" && (
        <>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Approve this log?"
            onConfirm={() => onApprove(record)}
            okText="Approve"
          >
            <Button
              size="small"
              type="text"
              icon={<CheckOutlined />}
              style={{ color: "#1DA081" }}
            />
          </Popconfirm>
        </>
      )}
      {record.approvalStatus === "Approved" && (
        <Popconfirm
          title="Revoke approval? Attendance record will be removed."
          onConfirm={() => onRevoke(record)}
          okText="Revoke"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" type="text" icon={<RollbackOutlined />} danger />
        </Popconfirm>
      )}
      {(record.approvalStatus === "ForApproval" ||
        record.approvalStatus === "Cancelled" ||
        record.approvalStatus === "Declined") && (
        <Popconfirm
          title="Delete this log?"
          onConfirm={() => onDelete(record.id)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" type="text" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      )}
    </Space>
  );
}

export default function PassSlipTable({
  data,
  loading,
  onEdit,
  onApprove,
  onRevoke,
  onDelete,
}: Props) {
  const groups = useMemo<PassSlipGroup[]>(() => {
    const map = new Map<string, PassSlipGroup>();
    for (const item of data) {
      const key = `${item.employeeId}_${item.applicationDate}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          employeeId: item.employeeId,
          employeeName: item.employeeName,
          applicationDate: item.applicationDate,
          logs: [],
        });
      }
      map.get(key)!.logs.push(item);
    }
    return Array.from(map.values());
  }, [data]);

  const parentColumns: ColumnsType<PassSlipGroup> = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (v, r) => v ?? r.employeeId,
    },
    {
      title: "Application Date",
      dataIndex: "applicationDate",
      key: "applicationDate",
      render: (v) => dayjs(v.replace(/Z$/, "")).format("MMM DD, YYYY"),
    },
    {
      title: "Logs",
      key: "logs",
      width: 60,
      render: (_, r) => <Tag>{r.logs.length}</Tag>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, r) => {
        const statuses = [...new Set(r.logs.map((l) => l.approvalStatus))];
        return (
          <Space size={4}>
            {statuses.map((s) => (
              <Tag key={s} color={APPROVAL_STATUS_COLOR[s] ?? "default"}>
                {APPROVAL_STATUS_LABEL[s] ?? s}
              </Tag>
            ))}
          </Space>
        );
      },
    },
  ];

  const logColumns: ColumnsType<PassSlipResponse> = [
    {
      title: "Punch Time",
      dataIndex: "departureTime",
      key: "departureTime",
      render: fmtDateTime,
    },
    {
      title: "Notes",
      dataIndex: "purpose",
      key: "purpose",
      render: (v) => v || <Text type="secondary">—</Text>,
    },
    {
      title: "Status",
      dataIndex: "approvalStatus",
      key: "approvalStatus",
      render: (v) => (
        <Tag color={APPROVAL_STATUS_COLOR[v] ?? "default"}>
          {APPROVAL_STATUS_LABEL[v] ?? v}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <LogActions
          record={record}
          onEdit={onEdit}
          onApprove={onApprove}
          onRevoke={onRevoke}
          onDelete={onDelete}
        />
      ),
    },
  ];

  return (
    <Table
      rowKey="key"
      dataSource={groups}
      columns={parentColumns}
      loading={loading}
      size="small"
      pagination={{ pageSize: 20, showSizeChanger: false }}
      expandable={{
        expandedRowRender: (group) => (
          <Table
            rowKey="id"
            dataSource={group.logs}
            columns={logColumns}
            size="small"
            pagination={false}
            showHeader={true}
            style={{ marginBlock: 4 }}
          />
        ),
        rowExpandable: (group) => group.logs.length > 0,
      }}
    />
  );
}

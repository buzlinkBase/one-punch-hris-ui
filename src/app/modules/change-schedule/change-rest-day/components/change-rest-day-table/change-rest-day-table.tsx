import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  DeleteOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ChangeRestDayResponse } from "../../models/api/response/change-rest-day-response.model";
import { CHANGE_REST_DAY_LABEL } from "../../constants/label.const";
import {
  APPROVAL_STATUS_COLOR,
  APPROVAL_STATUS_LABEL,
} from "@/app/modules/applications/pass-slip/constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: ChangeRestDayResponse[];
  loading?: boolean;
  onDelete?: (employeeId: string, batchCode: string) => void;
  onApprove?: (employeeId: string, batchCode: string) => void;
  onDecline?: (employeeId: string, batchCode: string) => void;
}

export default function ChangeRestDayTable({
  data,
  loading,
  onDelete,
  onApprove,
  onDecline,
}: Props) {
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    fullName: 160,
    batchCode: 130,
    fromDate: 130,
    toDate: 130,
    status: 120,
  });

  const filtered = data.filter((item) =>
    [item.fullName, item.batchCode, item.fromDate, item.toDate].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<ChangeRestDayResponse> = [
    {
      title: CHANGE_REST_DAY_LABEL.EMPLOYEE,
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
      title: "Batch",
      dataIndex: "batchCode",
      key: "batchCode",
      width: widths.batchCode,
      onHeaderCell: () =>
        ({
          width: widths.batchCode,
          onResize: (w: number) => handleResize("batchCode", w),
        }) as object,
    },
    {
      title: CHANGE_REST_DAY_LABEL.FROM_DATE,
      dataIndex: "fromDate",
      key: "fromDate",
      width: widths.fromDate,
      onHeaderCell: () =>
        ({
          width: widths.fromDate,
          onResize: (w: number) => handleResize("fromDate", w),
        }) as object,
    },
    {
      title: () => (
        <Space size={4}>
          <ArrowRightOutlined style={{ color: "#1DA081" }} />
          {CHANGE_REST_DAY_LABEL.NEW_DATE}
        </Space>
      ),
      dataIndex: "toDate",
      key: "toDate",
      width: widths.toDate,
      onHeaderCell: () =>
        ({
          width: widths.toDate,
          onResize: (w: number) => handleResize("toDate", w),
        }) as object,
      render: (v: string) => (
        <span style={{ color: "#1DA081", fontWeight: 500 }}>{v}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "approvalStatus",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (val?: string) =>
        val ? (
          <Tag color={APPROVAL_STATUS_COLOR[val] ?? "default"}>
            {APPROVAL_STATUS_LABEL[val] ?? val}
          </Tag>
        ) : (
          "—"
        ),
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space size={4}>
          {record.approvalStatus === "ForApproval" && onApprove && (
            <Button
              type="text"
              icon={<CheckOutlined style={{ color: "#1DA081" }} />}
              onClick={() => onApprove(record.employeeId, record.batchCode)}
              title="Approve"
            />
          )}
          {record.approvalStatus === "ForApproval" && onDecline && (
            <Button
              type="text"
              danger
              icon={<CloseOutlined />}
              onClick={() => onDecline(record.employeeId, record.batchCode)}
              title="Decline"
            />
          )}
          {onDelete && (
            <Popconfirm
              title="Delete this record?"
              onConfirm={() => onDelete(record.employeeId, record.batchCode)}
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
    <div className="flex flex-col gap-3">
      <Input
        prefix={<SearchOutlined />}
        placeholder="Search employee, dates..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        allowClear
        style={{ maxWidth: 320 }}
      />
      <Table
        rowKey={(r) => `${r.batchCode}-${r.employeeId}`}
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

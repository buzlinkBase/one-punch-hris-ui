import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { ChangeHolidayResponse } from "../../models/api/response/change-holiday-response.model";
import { CHANGE_HOLIDAY_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: ChangeHolidayResponse[];
  loading?: boolean;
  onDelete?: (batchId: string) => void;
}

export default function ChangeHolidayTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    fullName: 150,
    holidayName: 150,
    clientName: 150,
    fromDate: 120,
    toDate: 120,
  });

  const filtered = data.filter((item) =>
    [
      item.fullName,
      item.holidayName,
      item.clientName,
      item.fromDate,
      item.toDate,
    ].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<ChangeHolidayResponse> = [
    {
      title: CHANGE_HOLIDAY_LABEL.EMPLOYEE,
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
      title: CHANGE_HOLIDAY_LABEL.HOLIDAY_NAME,
      dataIndex: "holidayName",
      key: "holidayName",
      width: widths.holidayName,
      onHeaderCell: () =>
        ({
          width: widths.holidayName,
          onResize: (w: number) => handleResize("holidayName", w),
        }) as object,
    },
    {
      title: CHANGE_HOLIDAY_LABEL.CLIENT,
      dataIndex: "clientName",
      key: "clientName",
      width: widths.clientName,
      onHeaderCell: () =>
        ({
          width: widths.clientName,
          onResize: (w: number) => handleResize("clientName", w),
        }) as object,
    },
    {
      title: CHANGE_HOLIDAY_LABEL.FROM_DATE,
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
      title: CHANGE_HOLIDAY_LABEL.TO_DATE,
      dataIndex: "toDate",
      key: "toDate",
      width: widths.toDate,
      onHeaderCell: () =>
        ({
          width: widths.toDate,
          onResize: (w: number) => handleResize("toDate", w),
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
            onClick={() =>
              navigate({
                to: `/change-schedule/change-holiday/${record.batchCode}`,
              })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this record?"
              onConfirm={() => onDelete(record.batchCode)}
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
        placeholder="Search..."
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

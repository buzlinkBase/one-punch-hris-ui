import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { ChangeRestDayResponse } from "../../models/api/response/change-rest-day-response.model";
import { CHANGE_REST_DAY_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: ChangeRestDayResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function ChangeRestDayTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    employeeName: 150,
    holidayName: 150,
    fromDate: 120,
    toDate: 120,
  });

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<ChangeRestDayResponse> = [
    {
      title: CHANGE_REST_DAY_LABEL.EMPLOYEE,
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
      title: CHANGE_REST_DAY_LABEL.HOLIDAY_NAME,
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
      title: CHANGE_REST_DAY_LABEL.TO_DATE,
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
                to: `/change-schedule/change-rest-day/${record.id}`,
              })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this record?"
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
        rowKey="id"
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

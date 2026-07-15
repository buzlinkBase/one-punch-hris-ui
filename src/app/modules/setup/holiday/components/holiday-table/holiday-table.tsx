import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { HolidayResponse } from "../../models/api/response/holiday-response.model";
import { HOLIDAY_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: HolidayResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function HolidayTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    description: 200,
    holDate: 120,
    holidayType: 120,
    workType: 120,
    areaName: 140,
    isPaid: 100,
    isRecuring: 100,
    status: 120,
  });

  const filtered = data.filter((item) =>
    [
      item.description,
      item.holDate,
      item.holidayType ?? item.holType,
      item.workType,
      item.areaName,
      item.status,
    ].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<HolidayResponse> = [
    {
      title: HOLIDAY_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      width: widths.description,
      onHeaderCell: () =>
        ({
          width: widths.description,
          onResize: (w: number) => handleResize("description", w),
        }) as object,
    },
    {
      title: HOLIDAY_LABEL.HOL_DATE,
      dataIndex: "holDate",
      key: "holDate",
      width: widths.holDate,
      onHeaderCell: () =>
        ({
          width: widths.holDate,
          onResize: (w: number) => handleResize("holDate", w),
        }) as object,
      sorter: (a, b) => a.holDate.localeCompare(b.holDate),
      render: (val: string) => {
        if (!val) return null;
        // API returns "MMM DD, 0" for recurring holidays (year=0); strip the year in that case
        const match = val.match(/^(.+),\s*(\d+)$/);
        if (match && match[2] === "0") return match[1];
        return val;
      },
    },
    {
      title: HOLIDAY_LABEL.HOL_TYPE,
      dataIndex: "holidayType",
      key: "holidayType",
      width: widths.holidayType,
      onHeaderCell: () =>
        ({
          width: widths.holidayType,
          onResize: (w: number) => handleResize("holidayType", w),
        }) as object,
      render: (_: unknown, record) => {
        const raw = record.holidayType ?? record.holType;
        const isLegal = raw?.toUpperCase() === "LEGAL";
        return (
          <Tag color={isLegal ? "blue" : "orange"}>
            {isLegal ? "Legal" : "Special"}
          </Tag>
        );
      },
    },
    {
      title: HOLIDAY_LABEL.WORK_TYPE,
      dataIndex: "workType",
      key: "workType",
      width: widths.workType,
      onHeaderCell: () =>
        ({
          width: widths.workType,
          onResize: (w: number) => handleResize("workType", w),
        }) as object,
      render: (v: string) => (
        <Tag color={v === "NonWorking" ? "red" : "green"}>
          {v === "NonWorking" ? "Non-Working" : "Working"}
        </Tag>
      ),
    },
    {
      title: HOLIDAY_LABEL.AREA,
      dataIndex: "areaName",
      key: "areaName",
      width: widths.areaName,
      onHeaderCell: () =>
        ({
          width: widths.areaName,
          onResize: (w: number) => handleResize("areaName", w),
        }) as object,
    },
    {
      title: HOLIDAY_LABEL.IS_PAID,
      dataIndex: "isPaid",
      key: "isPaid",
      width: widths.isPaid,
      onHeaderCell: () =>
        ({
          width: widths.isPaid,
          onResize: (w: number) => handleResize("isPaid", w),
        }) as object,
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Paid" : "Unpaid"}</Tag>
      ),
    },
    {
      title: HOLIDAY_LABEL.IS_RECURING,
      dataIndex: "isRecuring",
      key: "isRecuring",
      width: widths.isRecuring,
      onHeaderCell: () =>
        ({
          width: widths.isRecuring,
          onResize: (w: number) => handleResize("isRecuring", w),
        }) as object,
      render: (v: boolean) => (v ? "Yes" : "No"),
    },
    {
      title: HOLIDAY_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
      render: (v: string) => (
        <Tag color={v?.toUpperCase() === "ACTIVE" ? "success" : "default"}>
          {v?.toUpperCase() === "ACTIVE" ? "Active" : "Inactive"}
        </Tag>
      ),
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
            onClick={() => navigate({ to: `/setup/holiday/${record.id}` })}
          />
          {onDelete && (
            <Popconfirm
              title="Delete this holiday?"
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
        pagination={{ pageSize: 15 }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

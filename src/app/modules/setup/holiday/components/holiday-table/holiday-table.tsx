import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { HolidayResponse } from "../../models/api/response/holiday-response.model";
import { HOLIDAY_LABEL } from "../../constants/label.const";

interface Props {
  data: HolidayResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function HolidayTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    [
      item.description,
      item.holDate,
      item.holType,
      item.workType,
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
    },
    {
      title: HOLIDAY_LABEL.HOL_DATE,
      dataIndex: "holDate",
      key: "holDate",
      sorter: (a, b) => a.holDate.localeCompare(b.holDate),
    },
    {
      title: HOLIDAY_LABEL.HOL_TYPE,
      dataIndex: "holType",
      key: "holType",
      render: (v: string) => (
        <Tag color={v === "LEGAL" ? "blue" : "orange"}>
          {v === "LEGAL" ? "Legal" : "Special"}
        </Tag>
      ),
    },
    {
      title: HOLIDAY_LABEL.WORK_TYPE,
      dataIndex: "workType",
      key: "workType",
      render: (v: string) => (
        <Tag color={v === "NonWorking" ? "red" : "green"}>
          {v === "NonWorking" ? "Non-Working" : "Working"}
        </Tag>
      ),
    },
    {
      title: HOLIDAY_LABEL.IS_PAID,
      dataIndex: "isPaid",
      key: "isPaid",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "default"}>{v ? "Paid" : "Unpaid"}</Tag>
      ),
    },
    {
      title: HOLIDAY_LABEL.IS_RECURING,
      dataIndex: "isRecuring",
      key: "isRecuring",
      render: (v: boolean) => (v ? "Yes" : "No"),
    },
    { title: HOLIDAY_LABEL.STATUS, dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate({ to: `/setup/holiday/${record.id}` })}
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this holiday?"
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
      />
    </div>
  );
}

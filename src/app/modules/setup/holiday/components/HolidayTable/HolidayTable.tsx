import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
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
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<HolidayResponse> = [
    { title: HOLIDAY_LABEL.NAME, dataIndex: "name", key: "name" },
    { title: HOLIDAY_LABEL.DATE, dataIndex: "date", key: "date" },
    { title: HOLIDAY_LABEL.TYPE, dataIndex: "type", key: "type" },
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
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}

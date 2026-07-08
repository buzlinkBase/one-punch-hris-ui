import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { ChangeHolidayResponse } from "../../models/api/response/change-holiday-response.model";
import { CHANGE_HOLIDAY_LABEL } from "../../constants/label.const";

interface Props {
  data: ChangeHolidayResponse[];
  loading?: boolean;
  onDelete?: (batchId: string) => void;
}

export default function ChangeHolidayTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

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
    },
    {
      title: CHANGE_HOLIDAY_LABEL.HOLIDAY_NAME,
      dataIndex: "holidayName",
      key: "holidayName",
    },
    {
      title: CHANGE_HOLIDAY_LABEL.CLIENT,
      dataIndex: "clientName",
      key: "clientName",
    },
    {
      title: CHANGE_HOLIDAY_LABEL.FROM_DATE,
      dataIndex: "fromDate",
      key: "fromDate",
    },
    {
      title: CHANGE_HOLIDAY_LABEL.TO_DATE,
      dataIndex: "toDate",
      key: "toDate",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() =>
              navigate({
                to: `/change-schedule/change-holiday/${record.batchId}`,
              })
            }
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this record?"
              onConfirm={() => onDelete(record.batchId)}
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
        rowKey="batchId"
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}

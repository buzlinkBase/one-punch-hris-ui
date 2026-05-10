import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { ChangeRestDayResponse } from "../../models/api/response/change-rest-day-response.model";
import { CHANGE_REST_DAY_LABEL } from "../../constants/label.const";

interface Props {
  data: ChangeRestDayResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function ChangeRestDayTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

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
    },
    {
      title: CHANGE_REST_DAY_LABEL.HOLIDAY_NAME,
      dataIndex: "holidayName",
      key: "holidayName",
    },
    {
      title: CHANGE_REST_DAY_LABEL.FROM_DATE,
      dataIndex: "fromDate",
      key: "fromDate",
    },
    {
      title: CHANGE_REST_DAY_LABEL.TO_DATE,
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
                to: `/change-schedule/change-rest-day/${record.id}`,
              })
            }
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this record?"
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}

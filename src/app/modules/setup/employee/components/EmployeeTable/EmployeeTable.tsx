import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { EmployeeResponse } from "../../models/api/response/employee-response.model";
import { EMPLOYEE_LABEL } from "../../constants/label.const";

interface Props {
  data: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function EmployeeTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<EmployeeResponse> = [
    {
      title: EMPLOYEE_LABEL.EMPLOYEE_NO,
      dataIndex: "employeeNo",
      key: "employeeNo",
    },
    { title: EMPLOYEE_LABEL.LAST_NAME, dataIndex: "lastName", key: "lastName" },
    {
      title: EMPLOYEE_LABEL.FIRST_NAME,
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: EMPLOYEE_LABEL.EMPLOYMENT_STATUS,
      dataIndex: "employmentStatus",
      key: "employmentStatus",
    },
    { title: EMPLOYEE_LABEL.STATUS, dataIndex: "status", key: "status" },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate({ to: `/setup/employee/${record.id}` })}
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this employee?"
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

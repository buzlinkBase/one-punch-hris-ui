import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
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
      width: 120,
    },
    {
      title: EMPLOYEE_LABEL.BIO_ID,
      dataIndex: "bioId",
      key: "bioId",
      width: 80,
    },
    {
      title: EMPLOYEE_LABEL.LAST_NAME,
      dataIndex: "lastName",
      key: "lastName",
      width: 140,
    },
    {
      title: EMPLOYEE_LABEL.FIRST_NAME,
      dataIndex: "firstName",
      key: "firstName",
      width: 140,
    },
    {
      title: EMPLOYEE_LABEL.MIDDLE_NAME,
      dataIndex: "middleName",
      key: "middleName",
      width: 130,
      render: (v?: string) => v || "—",
    },
    {
      title: EMPLOYEE_LABEL.SUFFIX,
      dataIndex: "suffix",
      key: "suffix",
      width: 80,
      render: (v?: string) => v || "—",
    },
    {
      title: EMPLOYEE_LABEL.DEPARTMENT,
      dataIndex: "departmentName",
      key: "departmentName",
      width: 160,
      render: (v?: string) => v || "—",
    },
    {
      title: EMPLOYEE_LABEL.PAYROLL_GROUP,
      dataIndex: "payrollGroupName",
      key: "payrollGroupName",
      width: 150,
      render: (v?: string) => v || "—",
    },
    {
      title: EMPLOYEE_LABEL.TIME_SHIFT,
      dataIndex: "timeShiftName",
      key: "timeShiftName",
      width: 150,
      render: (v?: string) => v || "—",
    },
    {
      title: EMPLOYEE_LABEL.REST_DAYS,
      dataIndex: "restDays",
      key: "restDays",
      width: 220,
      render: (restDays?: EmployeeResponse["restDays"]) =>
        restDays?.length
          ? restDays.map((r) => (
              <Tag key={r.dayName} style={{ marginBottom: 2 }}>
                {r.dayName.slice(0, 3)}
              </Tag>
            ))
          : "—",
    },
    {
      title: EMPLOYEE_LABEL.EMPLOYMENT_STATUS,
      dataIndex: "employmentStatus",
      key: "employmentStatus",
      width: 150,
      render: (v?: string) => v || "—",
    },
    {
      title: EMPLOYEE_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (v?: string) =>
        v ? (
          <Tag color={v === "ACTIVE" ? "success" : "default"}>{v}</Tag>
        ) : "—",
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
        size="small"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
      />
    </div>
  );
}

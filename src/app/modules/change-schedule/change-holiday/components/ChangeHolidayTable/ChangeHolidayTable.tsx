import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { ChangeHolidayResponse } from "../../models/api/response/change-holiday-response.model";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import { CHANGE_HOLIDAY_LABEL } from "../../constants/label.const";

interface FlatRow extends ChangeHolidayResponse {
  _rowKey: string;
  _employeeId: string;
}

interface Props {
  data: ChangeHolidayResponse[];
  employees: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function ChangeHolidayTable({ data, employees, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const employeeMap = new Map(
    employees.map((e) => [e.id, `${e.employeeNo} - ${e.lastName}, ${e.firstName}`]),
  );

  const flatRows: FlatRow[] = data.flatMap((record) =>
    (record.employeeIds ?? []).map((employeeId) => ({
      ...record,
      _rowKey: `${record.id}-${employeeId}`,
      _employeeId: employeeId,
    })),
  );

  const filtered = flatRows.filter((item) => {
    const employeeName = employeeMap.get(item._employeeId) ?? "";
    return (
      employeeName.toLowerCase().includes(search.toLowerCase()) ||
      [item.holidayName, item.clientName, item.fromDate, item.toDate].some(
        (val) => String(val ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    );
  });

  const columns: ColumnsType<FlatRow> = [
    {
      title: CHANGE_HOLIDAY_LABEL.EMPLOYEE,
      key: "employee",
      render: (_, record) => employeeMap.get(record._employeeId) ?? record._employeeId,
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
              navigate({ to: `/change-schedule/change-holiday/${record.id}` })
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
        rowKey="_rowKey"
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

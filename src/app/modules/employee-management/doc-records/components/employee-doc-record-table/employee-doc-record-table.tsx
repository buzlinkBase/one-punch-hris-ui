import { useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Input,
  Select,
  Tag,
  Typography,
} from "antd";
import { SearchOutlined, PaperClipOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { EmployeeDocRecordResponse } from "../../models/api/response/employee-doc-record-response.model";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import {
  EMPLOYEE_DOC_RECORD_LABEL,
  DOC_RECORD_TYPE_OPTIONS,
} from "../../constants/label.const";

const { Text } = Typography;

interface Props {
  data: EmployeeDocRecordResponse[];
  employees: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  ...DOC_RECORD_TYPE_OPTIONS,
];

export default function EmployeeDocRecordTable({
  data,
  employees,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const employeeMap = new Map(
    employees.map((e) => [
      e.id,
      `${e.firstName} ${e.lastName} (${e.employeeNo})`,
    ]),
  );

  const employeeOptions = [
    { value: "", label: "All Employees" },
    ...employees.map((e) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName} (${e.employeeNo})`,
    })),
  ];

  const filtered = data.filter((item) => {
    const empName = employeeMap.get(item.employeeId) ?? "";
    const matchesSearch = [item.recordType, item.description, empName].some(
      (val) => val.toLowerCase().includes(search.toLowerCase()),
    );
    const matchesEmployee =
      !employeeFilter || item.employeeId === employeeFilter;
    const matchesType = !typeFilter || item.recordType === typeFilter;
    return matchesSearch && matchesEmployee && matchesType;
  });

  const columns: ColumnsType<EmployeeDocRecordResponse> = [
    {
      title: EMPLOYEE_DOC_RECORD_LABEL.EMPLOYEE,
      dataIndex: "employeeId",
      key: "employeeId",
      width: 240,
      render: (id: string) => employeeMap.get(id) ?? id,
    },
    {
      title: EMPLOYEE_DOC_RECORD_LABEL.RECORD_TYPE,
      dataIndex: "recordType",
      key: "recordType",
      width: 180,
      render: (val: string) => <Tag color="purple">{val}</Tag>,
    },
    {
      title: EMPLOYEE_DOC_RECORD_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      render: (val: string) => <Text ellipsis={{ tooltip: val }}>{val}</Text>,
    },
    {
      title: EMPLOYEE_DOC_RECORD_LABEL.FILE,
      dataIndex: "file",
      key: "file",
      width: 80,
      align: "center",
      render: (file: string) =>
        file ? (
          <a href={file} target="_blank" rel="noopener noreferrer">
            <PaperClipOutlined />
          </a>
        ) : (
          <span className="text-gray-300">—</span>
        ),
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
              navigate({ to: `/employee-management/doc-records/${record.id}` })
            }
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Delete this document record?"
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
      <div className="flex flex-wrap gap-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 260 }}
        />
        <Select
          showSearch
          optionFilterProp="label"
          options={employeeOptions}
          value={employeeFilter}
          onChange={setEmployeeFilter}
          style={{ width: 220 }}
          placeholder="Filter by employee"
        />
        <Select
          options={TYPE_FILTER_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
          style={{ width: 200 }}
          placeholder="Filter by record type"
        />
      </div>
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

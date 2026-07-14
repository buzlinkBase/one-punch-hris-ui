import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Select, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { EmployeeDependentResponse } from "../../models/api/response/employee-dependent-response.model";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import {
  EMPLOYEE_DEPENDENT_LABEL,
  RELATIONSHIP_OPTIONS,
  GENDER_OPTIONS,
} from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: EmployeeDependentResponse[];
  employees: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const RELATIONSHIP_FILTER_OPTIONS = [
  { value: "", label: "All Relationships" },
  ...RELATIONSHIP_OPTIONS,
];

const GENDER_FILTER_OPTIONS = [
  { value: "", label: "All Genders" },
  ...GENDER_OPTIONS,
];

export default function EmployeeDependentTable({
  data,
  employees,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  const { widths, handleResize } = useResizableColumns({
    employeeId: 240,
    fullName: 160,
    relationship: 140,
    gender: 100,
    dob: 130,
  });

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
    const matchesSearch = [
      item.fullName,
      item.relationship,
      item.gender,
      empName,
    ].some((val) => val.toLowerCase().includes(search.toLowerCase()));
    const matchesEmployee =
      !employeeFilter || item.employeeId === employeeFilter;
    const matchesRelationship =
      !relationshipFilter || item.relationship === relationshipFilter;
    const matchesGender = !genderFilter || item.gender === genderFilter;
    return (
      matchesSearch && matchesEmployee && matchesRelationship && matchesGender
    );
  });

  const columns: ColumnsType<EmployeeDependentResponse> = [
    {
      title: EMPLOYEE_DEPENDENT_LABEL.EMPLOYEE,
      dataIndex: "employeeId",
      key: "employeeId",
      width: widths.employeeId,
      onHeaderCell: () =>
        ({
          width: widths.employeeId,
          onResize: (w: number) => handleResize("employeeId", w),
        }) as object,
      render: (id: string) => employeeMap.get(id) ?? id,
    },
    {
      title: EMPLOYEE_DEPENDENT_LABEL.FULL_NAME,
      dataIndex: "fullName",
      key: "fullName",
      width: widths.fullName,
      onHeaderCell: () =>
        ({
          width: widths.fullName,
          onResize: (w: number) => handleResize("fullName", w),
        }) as object,
    },
    {
      title: EMPLOYEE_DEPENDENT_LABEL.RELATIONSHIP,
      dataIndex: "relationship",
      key: "relationship",
      width: widths.relationship,
      onHeaderCell: () =>
        ({
          width: widths.relationship,
          onResize: (w: number) => handleResize("relationship", w),
        }) as object,
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: EMPLOYEE_DEPENDENT_LABEL.GENDER,
      dataIndex: "gender",
      key: "gender",
      width: widths.gender,
      onHeaderCell: () =>
        ({
          width: widths.gender,
          onResize: (w: number) => handleResize("gender", w),
        }) as object,
      render: (val: string) => (
        <Tag color={val === "Male" ? "geekblue" : "magenta"}>{val}</Tag>
      ),
    },
    {
      title: EMPLOYEE_DEPENDENT_LABEL.DOB,
      dataIndex: "dob",
      key: "dob",
      width: widths.dob,
      onHeaderCell: () =>
        ({
          width: widths.dob,
          onResize: (w: number) => handleResize("dob", w),
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
              navigate({ to: `/employee-management/dependents/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Remove this dependent?"
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
          options={RELATIONSHIP_FILTER_OPTIONS}
          value={relationshipFilter}
          onChange={setRelationshipFilter}
          style={{ width: 180 }}
          placeholder="Filter by relationship"
        />
        <Select
          options={GENDER_FILTER_OPTIONS}
          value={genderFilter}
          onChange={setGenderFilter}
          style={{ width: 140 }}
          placeholder="Filter by gender"
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
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

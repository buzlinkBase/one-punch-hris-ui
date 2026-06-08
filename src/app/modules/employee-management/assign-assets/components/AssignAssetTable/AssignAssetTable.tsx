import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Select, Tag } from "antd";
import { SearchOutlined, PaperClipOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { AssignAssetResponse } from "../../models/api/response/assign-asset-response.model";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import { ASSIGN_ASSET_LABEL, ASSET_TYPE_OPTIONS } from "../../constants/label.const";

interface Props {
  data: AssignAssetResponse[];
  employees: EmployeeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active (Not Returned)" },
  { value: "returned", label: "Returned" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "All Types" },
  ...ASSET_TYPE_OPTIONS,
];

export default function AssignAssetTable({
  data,
  employees,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const employeeMap = new Map(
    employees.map((e) => [e.id, `${e.firstName} ${e.lastName} (${e.employeeNo})`]),
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
      item.assetType,
      item.assetDescription,
      item.model,
      item.brand,
      item.serialNo,
      empName,
    ].some((val) => val.toLowerCase().includes(search.toLowerCase()));
    const matchesEmployee = !employeeFilter || item.employeeId === employeeFilter;
    const matchesType = !typeFilter || item.assetType === typeFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "returned" ? !!item.returnedDate : !item.returnedDate);
    return matchesSearch && matchesEmployee && matchesType && matchesStatus;
  });

  const columns: ColumnsType<AssignAssetResponse> = [
    {
      title: ASSIGN_ASSET_LABEL.EMPLOYEE,
      dataIndex: "employeeId",
      key: "employeeId",
      width: 220,
      render: (id: string) => employeeMap.get(id) ?? id,
    },
    {
      title: ASSIGN_ASSET_LABEL.ASSET_TYPE,
      dataIndex: "assetType",
      key: "assetType",
      width: 150,
    },
    {
      title: ASSIGN_ASSET_LABEL.ASSET_DESCRIPTION,
      dataIndex: "assetDescription",
      key: "assetDescription",
    },
    {
      title: ASSIGN_ASSET_LABEL.BRAND,
      dataIndex: "brand",
      key: "brand",
      width: 110,
    },
    {
      title: ASSIGN_ASSET_LABEL.MODEL,
      dataIndex: "model",
      key: "model",
      width: 110,
    },
    {
      title: ASSIGN_ASSET_LABEL.SERIAL_NO,
      dataIndex: "serialNo",
      key: "serialNo",
      width: 130,
    },
    {
      title: ASSIGN_ASSET_LABEL.QTY,
      dataIndex: "qty",
      key: "qty",
      width: 70,
      align: "center",
    },
    {
      title: ASSIGN_ASSET_LABEL.ISSUANCE_DATE,
      dataIndex: "issuanceDate",
      key: "issuanceDate",
      width: 130,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) =>
        record.returnedDate ? (
          <Tag color="default">Returned</Tag>
        ) : (
          <Tag color="success">Active</Tag>
        ),
    },
    {
      title: ASSIGN_ASSET_LABEL.FILE,
      dataIndex: "file",
      key: "file",
      width: 90,
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
              navigate({ to: `/employee-management/assign-assets/${record.id}` })
            }
          >
            Edit
          </Button>
          {onDelete && (
            <Popconfirm
              title="Remove this asset assignment?"
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
          style={{ width: 160 }}
          placeholder="Filter by type"
        />
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 180 }}
          placeholder="Filter by status"
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

import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Select, Tag } from "antd";
import {
  SearchOutlined,
  PaperClipOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { AssignAssetResponse } from "../../models/api/response/assign-asset-response.model";
import type { EmployeeResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import {
  ASSIGN_ASSET_LABEL,
  ASSET_TYPE_OPTIONS,
} from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

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

  const { widths, handleResize } = useResizableColumns({
    employeeId: 220,
    assetType: 150,
    assetDescription: 180,
    brand: 110,
    model: 110,
    serialNo: 130,
    qty: 70,
    issuanceDate: 130,
    status: 120,
    file: 90,
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
      item.assetType,
      item.assetDescription,
      item.model,
      item.brand,
      item.serialNo,
      empName,
    ].some((val) => val.toLowerCase().includes(search.toLowerCase()));
    const matchesEmployee =
      !employeeFilter || item.employeeId === employeeFilter;
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
      width: widths.employeeId,
      onHeaderCell: () =>
        ({
          width: widths.employeeId,
          onResize: (w: number) => handleResize("employeeId", w),
        }) as object,
      render: (id: string) => employeeMap.get(id) ?? id,
    },
    {
      title: ASSIGN_ASSET_LABEL.ASSET_TYPE,
      dataIndex: "assetType",
      key: "assetType",
      width: widths.assetType,
      onHeaderCell: () =>
        ({
          width: widths.assetType,
          onResize: (w: number) => handleResize("assetType", w),
        }) as object,
    },
    {
      title: ASSIGN_ASSET_LABEL.ASSET_DESCRIPTION,
      dataIndex: "assetDescription",
      key: "assetDescription",
      width: widths.assetDescription,
      onHeaderCell: () =>
        ({
          width: widths.assetDescription,
          onResize: (w: number) => handleResize("assetDescription", w),
        }) as object,
    },
    {
      title: ASSIGN_ASSET_LABEL.BRAND,
      dataIndex: "brand",
      key: "brand",
      width: widths.brand,
      onHeaderCell: () =>
        ({
          width: widths.brand,
          onResize: (w: number) => handleResize("brand", w),
        }) as object,
    },
    {
      title: ASSIGN_ASSET_LABEL.MODEL,
      dataIndex: "model",
      key: "model",
      width: widths.model,
      onHeaderCell: () =>
        ({
          width: widths.model,
          onResize: (w: number) => handleResize("model", w),
        }) as object,
    },
    {
      title: ASSIGN_ASSET_LABEL.SERIAL_NO,
      dataIndex: "serialNo",
      key: "serialNo",
      width: widths.serialNo,
      onHeaderCell: () =>
        ({
          width: widths.serialNo,
          onResize: (w: number) => handleResize("serialNo", w),
        }) as object,
    },
    {
      title: ASSIGN_ASSET_LABEL.QTY,
      dataIndex: "qty",
      key: "qty",
      width: widths.qty,
      onHeaderCell: () =>
        ({
          width: widths.qty,
          onResize: (w: number) => handleResize("qty", w),
        }) as object,
      align: "center",
    },
    {
      title: ASSIGN_ASSET_LABEL.ISSUANCE_DATE,
      dataIndex: "issuanceDate",
      key: "issuanceDate",
      width: widths.issuanceDate,
      onHeaderCell: () =>
        ({
          width: widths.issuanceDate,
          onResize: (w: number) => handleResize("issuanceDate", w),
        }) as object,
    },
    {
      title: "Status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
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
      width: widths.file,
      onHeaderCell: () =>
        ({
          width: widths.file,
          onResize: (w: number) => handleResize("file", w),
        }) as object,
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
      width: 80,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              navigate({
                to: `/employee-management/assign-assets/${record.id}`,
              })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Remove this asset assignment?"
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
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

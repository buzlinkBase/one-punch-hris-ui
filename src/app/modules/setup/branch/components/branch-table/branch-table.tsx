import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { BranchResponse } from "../../models/api/response/branch-response.model";
import { BRANCH_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";
import { PH_REGION_OPTIONS } from "@/shared/constants/ph-regions.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const REGION_LABEL_BY_CODE = new Map<string, string>(
  PH_REGION_OPTIONS.map((r) => [r.value, r.label]),
);

interface Props {
  data: BranchResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function BranchTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    code: 120,
    name: 200,
    address: 200,
    region: 160,
    wageOrderClass: 140,
    boundary: 120,
    status: 120,
  });

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<BranchResponse> = [
    {
      title: BRANCH_LABEL.CODE,
      dataIndex: "code",
      key: "code",
      width: widths.code,
      onHeaderCell: () =>
        ({
          width: widths.code,
          onResize: (w: number) => handleResize("code", w),
        }) as object,
    },
    {
      title: BRANCH_LABEL.NAME,
      dataIndex: "name",
      key: "name",
      width: widths.name,
      onHeaderCell: () =>
        ({
          width: widths.name,
          onResize: (w: number) => handleResize("name", w),
        }) as object,
    },
    {
      title: BRANCH_LABEL.ADDRESS,
      dataIndex: "address",
      key: "address",
      width: widths.address,
      onHeaderCell: () =>
        ({
          width: widths.address,
          onResize: (w: number) => handleResize("address", w),
        }) as object,
    },
    {
      title: BRANCH_LABEL.REGION,
      dataIndex: "regionCode",
      key: "region",
      width: widths.region,
      onHeaderCell: () =>
        ({
          width: widths.region,
          onResize: (w: number) => handleResize("region", w),
        }) as object,
      render: (regionCode?: string | null) =>
        regionCode ? (REGION_LABEL_BY_CODE.get(regionCode) ?? regionCode) : "—",
    },
    {
      title: BRANCH_LABEL.WAGE_ORDER_CLASS,
      dataIndex: "wageOrderClass",
      key: "wageOrderClass",
      width: widths.wageOrderClass,
      onHeaderCell: () =>
        ({
          width: widths.wageOrderClass,
          onResize: (w: number) => handleResize("wageOrderClass", w),
        }) as object,
      render: (wageOrderClass?: string | null) => wageOrderClass || "—",
    },
    {
      title: "Boundary",
      key: "boundary",
      width: widths.boundary,
      onHeaderCell: () =>
        ({
          width: widths.boundary,
          onResize: (w: number) => handleResize("boundary", w),
        }) as object,
      render: (_, record) =>
        record.boundary ? (
          <Tag color="green">Area Set</Tag>
        ) : (
          <Tag color="default">No Area</Tag>
        ),
    },
    {
      title: BRANCH_LABEL.STATUS,
      dataIndex: "status",
      key: "status",
      width: widths.status,
      onHeaderCell: () =>
        ({
          width: widths.status,
          onResize: (w: number) => handleResize("status", w),
        }) as object,
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Space>
          <PermissionGate permission="Organization Setup:Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate({ to: `/setup/branch/${record.id}` })}
            />
          </PermissionGate>
          {onDelete && (
            <PermissionGate permission="Organization Setup:Delete">
              <Popconfirm
                title="Delete this branch?"
                onConfirm={() => onDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </PermissionGate>
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
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

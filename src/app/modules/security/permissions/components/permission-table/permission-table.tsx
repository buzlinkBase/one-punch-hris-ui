import { useMemo, useState } from "react";
import { Table, Input, Tag, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { PermissionResponse } from "../../models/api/response/permission-response.model";
import { PERMISSION_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: PermissionResponse[];
  loading?: boolean;
}

export default function PermissionTable({ data, loading }: Props) {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  const { widths, handleResize } = useResizableColumns({
    code: 220,
    module: 180,
    feature: 200,
    action: 110,
    description: 320,
  });

  const moduleOptions = useMemo(
    () => [
      { value: "", label: "All Modules" },
      ...[...new Set(data.map((p) => p.module))].map((module) => ({
        value: module,
        label: module,
      })),
    ],
    [data],
  );

  const filtered = data.filter((item) => {
    const matchesSearch =
      !search ||
      Object.values(item).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    const matchesModule = !moduleFilter || item.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const columns: ColumnsType<PermissionResponse> = [
    {
      title: PERMISSION_LABEL.CODE,
      dataIndex: "code",
      key: "code",
      width: widths.code,
      onHeaderCell: () =>
        ({
          width: widths.code,
          onResize: (w: number) => handleResize("code", w),
        }) as object,
      render: (val: string) => <code>{val}</code>,
    },
    {
      title: PERMISSION_LABEL.MODULE,
      dataIndex: "module",
      key: "module",
      width: widths.module,
      onHeaderCell: () =>
        ({
          width: widths.module,
          onResize: (w: number) => handleResize("module", w),
        }) as object,
    },
    {
      title: PERMISSION_LABEL.FEATURE,
      dataIndex: "feature",
      key: "feature",
      width: widths.feature,
      onHeaderCell: () =>
        ({
          width: widths.feature,
          onResize: (w: number) => handleResize("feature", w),
        }) as object,
    },
    {
      title: PERMISSION_LABEL.ACTION,
      dataIndex: "action",
      key: "action",
      width: widths.action,
      onHeaderCell: () =>
        ({
          width: widths.action,
          onResize: (w: number) => handleResize("action", w),
        }) as object,
      render: (val: string) => <Tag>{val}</Tag>,
    },
    {
      title: PERMISSION_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      width: widths.description,
      onHeaderCell: () =>
        ({
          width: widths.description,
          onResize: (w: number) => handleResize("description", w),
        }) as object,
      ellipsis: true,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ maxWidth: 260 }}
        />
        <Select
          options={moduleOptions}
          value={moduleFilter}
          onChange={setModuleFilter}
          style={{ minWidth: 170 }}
        />
      </div>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        size="small"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `${total} records` }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import type { MinimumWageRateResponse } from "../../models/api/response/minimum-wage-rate-response.model";
import { MINIMUM_WAGE_RATE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

interface Props {
  data: MinimumWageRateResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export default function MinimumWageRateTable({
  data,
  loading,
  onDelete,
}: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    regionName: 260,
    dailyRate: 130,
    effectiveDate: 140,
    wageOrderNo: 160,
  });

  const filtered = data.filter((item) =>
    [item.regionCode, item.regionName, item.wageOrderNo].some((val) =>
      String(val ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
  );

  const columns: ColumnsType<MinimumWageRateResponse> = [
    {
      title: MINIMUM_WAGE_RATE_LABEL.REGION,
      dataIndex: "regionName",
      key: "regionName",
      width: widths.regionName,
      onHeaderCell: () =>
        ({
          width: widths.regionName,
          onResize: (w: number) => handleResize("regionName", w),
        }) as object,
    },
    {
      title: MINIMUM_WAGE_RATE_LABEL.DAILY_RATE,
      dataIndex: "dailyRate",
      key: "dailyRate",
      align: "right",
      width: widths.dailyRate,
      onHeaderCell: () =>
        ({
          width: widths.dailyRate,
          onResize: (w: number) => handleResize("dailyRate", w),
        }) as object,
      render: fmt,
    },
    {
      title: MINIMUM_WAGE_RATE_LABEL.EFFECTIVE_DATE,
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      width: widths.effectiveDate,
      onHeaderCell: () =>
        ({
          width: widths.effectiveDate,
          onResize: (w: number) => handleResize("effectiveDate", w),
        }) as object,
      sorter: (a, b) => a.effectiveDate.localeCompare(b.effectiveDate),
      defaultSortOrder: "descend",
      render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
    },
    {
      title: MINIMUM_WAGE_RATE_LABEL.WAGE_ORDER_NO,
      dataIndex: "wageOrderNo",
      key: "wageOrderNo",
      width: widths.wageOrderNo,
      onHeaderCell: () =>
        ({
          width: widths.wageOrderNo,
          onResize: (w: number) => handleResize("wageOrderNo", w),
        }) as object,
      render: (v: string | null) => v ?? "—",
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
              navigate({ to: `/setup/minimum-wage-rate/${record.id}` })
            }
          />
          {onDelete && (
            <Popconfirm
              title="Delete this minimum wage rate?"
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
        pagination={{ pageSize: 15 }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

import { useState } from "react";
import { Table, Button, Space, Popconfirm, Input, Tag } from "antd";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "@tanstack/react-router";
import type { LeaveTypeResponse } from "../../models/api/response/leave-type-response.model";
import { LEAVE_TYPE_LABEL } from "../../constants/label.const";
import { ResizableTitle } from "@/shared/components/resizable-title";
import { useResizableColumns } from "@/shared/hooks/use-resizable-columns";

const PAY_SOURCE_COLOR: Record<string, string> = {
  Company: "blue",
  Government: "green",
  Shared: "cyan",
  Unpaid: "default",
  Other: "orange",
};

const PAY_SOURCE_LABEL: Record<string, string> = {
  Company: "Company (employer-funded)",
  Government: "Government (SSS / GSIS)",
  Shared: "Shared (employer advances, government reimburses)",
  Unpaid: "Unpaid (no pay)",
  Other: "Other",
};

const RESET_LABELS: Record<string, string> = {
  PerEvent: "Per Event",
  PerPeriod: "Per Period",
};

const ACCRUAL_LABELS: Record<string, string> = {
  None: "Manual",
  Monthly: "Monthly",
  Annually: "Annually",
  PerPayPeriod: "Per Pay Period",
  PerEvent: "Per Event",
};

const CARRY_OVER_COLOR: Record<string, string> = {
  Forfeit: "red",
  Unlimited: "green",
  Capped: "orange",
};

interface Props {
  data: LeaveTypeResponse[];
  loading?: boolean;
  onDelete?: (id: string) => void;
}

export default function LeaveTypeTable({ data, loading, onDelete }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { widths, handleResize } = useResizableColumns({
    code: 100,
    description: 200,
    category: 110,
    credits: 90,
    accrualBasis: 120,
    paySource: 130,
    leaveReset: 110,
    carryOverType: 110,
    isStatutory: 90,
    minServiceMonths: 100,
  });

  const filtered = data.filter((item) =>
    [item.code, item.description, item.category ?? "", item.remarks]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const columns: ColumnsType<LeaveTypeResponse> = [
    {
      title: LEAVE_TYPE_LABEL.CODE,
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
      title: LEAVE_TYPE_LABEL.DESCRIPTION,
      dataIndex: "description",
      key: "description",
      width: widths.description,
      onHeaderCell: () =>
        ({
          width: widths.description,
          onResize: (w: number) => handleResize("description", w),
        }) as object,
    },
    {
      title: LEAVE_TYPE_LABEL.CATEGORY,
      dataIndex: "category",
      key: "category",
      width: widths.category,
      onHeaderCell: () =>
        ({
          width: widths.category,
          onResize: (w: number) => handleResize("category", w),
        }) as object,
      render: (val?: string) =>
        val ? (
          <Tag color="purple">{val}</Tag>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: "Entitlement",
      dataIndex: "credits",
      key: "credits",
      width: widths.credits,
      onHeaderCell: () =>
        ({
          width: widths.credits,
          onResize: (w: number) => handleResize("credits", w),
        }) as object,
      render: (_: unknown, record: LeaveTypeResponse) => {
        if (record.accrualBasis === "Monthly")
          return `${record.accrualRate}/mo`;
        if (record.accrualBasis === "Annually")
          return `${record.accrualRate}/yr`;
        if (record.accrualBasis === "PerPayPeriod")
          return `${record.accrualRate}/pp`;
        const val = record.credits;
        return `${val} day${val !== 1 ? "s" : ""}`;
      },
    },
    {
      title: "Accrual",
      dataIndex: "accrualBasis",
      key: "accrualBasis",
      width: widths.accrualBasis,
      onHeaderCell: () =>
        ({
          width: widths.accrualBasis,
          onResize: (w: number) => handleResize("accrualBasis", w),
        }) as object,
      render: (val: string) => ACCRUAL_LABELS[val] ?? val,
    },
    {
      title: LEAVE_TYPE_LABEL.PAY_SOURCE,
      dataIndex: "paySource",
      key: "paySource",
      width: widths.paySource,
      onHeaderCell: () =>
        ({
          width: widths.paySource,
          onResize: (w: number) => handleResize("paySource", w),
        }) as object,
      render: (val: string) => (
        <Tag color={PAY_SOURCE_COLOR[val] ?? "default"}>
          {PAY_SOURCE_LABEL[val] ?? val}
        </Tag>
      ),
    },
    {
      title: "Reset",
      dataIndex: "leaveReset",
      key: "leaveReset",
      width: widths.leaveReset,
      onHeaderCell: () =>
        ({
          width: widths.leaveReset,
          onResize: (w: number) => handleResize("leaveReset", w),
        }) as object,
      render: (val: string) => RESET_LABELS[val] ?? val,
    },
    {
      title: "Carry-Over",
      dataIndex: "carryOverType",
      key: "carryOverType",
      width: widths.carryOverType,
      onHeaderCell: () =>
        ({
          width: widths.carryOverType,
          onResize: (w: number) => handleResize("carryOverType", w),
        }) as object,
      render: (val: string) => (
        <Tag color={CARRY_OVER_COLOR[val] ?? "default"}>{val}</Tag>
      ),
    },
    {
      title: "Min. Service",
      dataIndex: "minServiceMonths",
      key: "minServiceMonths",
      width: widths.minServiceMonths,
      onHeaderCell: () =>
        ({
          width: widths.minServiceMonths,
          onResize: (w: number) => handleResize("minServiceMonths", w),
        }) as object,
      render: (val: number) =>
        val === 0 ? (
          <span style={{ color: "#8c8c8c" }}>Immediate</span>
        ) : (
          `${val} mo.`
        ),
    },
    {
      title: "Statutory",
      dataIndex: "isStatutory",
      key: "isStatutory",
      width: widths.isStatutory,
      onHeaderCell: () =>
        ({
          width: widths.isStatutory,
          onResize: (w: number) => handleResize("isStatutory", w),
        }) as object,
      render: (val: boolean) =>
        val ? <Tag color="gold">Statutory</Tag> : null,
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
            onClick={() => navigate({ to: `/setup/leave-type/${record.id}` })}
          />
          {onDelete && (
            <Popconfirm
              title="Delete this leave type?"
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
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        sticky
        components={{ header: { cell: ResizableTitle } }}
      />
    </div>
  );
}

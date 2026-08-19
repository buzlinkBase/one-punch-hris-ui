import { useMemo } from "react";
import {
  Button,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import dayjs from "dayjs";
import { useEmployees } from "@/app/modules/setup/employee/hooks/use-employee-queries";
import {
  useSalaryAdjustments,
  useDeleteSalaryAdjustment,
} from "../../hooks/use-salary-adjustment-queries";
import type { SalaryAdjustmentResponse } from "../../models/api/response/salary-adjustment-response.model";
import {
  ADJUSTMENT_TYPE_COLOR,
  ADJUSTMENT_TYPE_LABEL,
} from "../../constants/label.const";
import { useState } from "react";

const { Title } = Typography;

export default function SalaryAdjustmentList() {
  const navigate = useNavigate();
  const [empFilter, setEmpFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<number | null>(null);

  const { data: items = [], isLoading } = useSalaryAdjustments();
  const { data: rawEmployees = [] } = useEmployees();
  const { mutate: remove } = useDeleteSalaryAdjustment();

  const empMap = useMemo(
    () =>
      new Map(rawEmployees.map((e) => [e.id, `${e.firstName} ${e.lastName}`])),
    [rawEmployees],
  );

  const empOptions = useMemo(
    () =>
      rawEmployees.map((e) => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`,
      })),
    [rawEmployees],
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (!empFilter || i.employeeId === empFilter) &&
          (typeFilter === null || i.adjustmentType === typeFilter),
      ),
    [items, empFilter, typeFilter],
  );

  const handleDelete = (id: string) => {
    remove(id, {
      onSuccess: () => message.success("Deleted."),
      onError: () => message.error("Delete failed."),
    });
  };

  const columns: ColumnsType<SalaryAdjustmentResponse> = [
    {
      title: "Employee",
      dataIndex: "employeeId",
      key: "employee",
      render: (v) => empMap.get(v) ?? v,
    },
    {
      title: "Type",
      dataIndex: "adjustmentType",
      key: "type",
      render: (v: number) => (
        <Tag color={ADJUSTMENT_TYPE_COLOR[v]}>{ADJUSTMENT_TYPE_LABEL[v]}</Tag>
      ),
    },
    {
      title: "Payroll Date",
      dataIndex: "payrollDate",
      key: "payrollDate",
      render: (v: string) => dayjs(v).format("MMM DD, YYYY"),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (v: number) =>
        v.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_, r) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              navigate({ to: `/applications/salary-adjustment/${r.id}` })
            }
          />
          <Popconfirm
            title="Delete this adjustment?"
            onConfirm={() => handleDelete(r.id)}
            okButtonProps={{ danger: true }}
            okText="Delete"
          >
            <Button size="small" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Salary Adjustments
            </Title>
            <p className="page-toolbar-subtitle">
              One-time salary, allowance, or deduction adjustments applied
              during payroll.
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              navigate({ to: "/applications/salary-adjustment/create" })
            }
          >
            Add
          </Button>
        </div>
        <div className="page-toolbar-filters">
          <Select
            allowClear
            showSearch
            placeholder="Filter by employee"
            options={empOptions}
            value={empFilter}
            onChange={setEmpFilter}
            filterOption={(input, opt) =>
              (opt?.label as string)
                ?.toLowerCase()
                .includes(input.toLowerCase())
            }
            style={{ width: 220 }}
          />
          <Select
            allowClear
            placeholder="Filter by type"
            options={[
              { value: 0, label: "Salary" },
              { value: 1, label: "Allowance" },
              { value: 2, label: "Deduction" },
            ]}
            value={typeFilter}
            onChange={(v) => setTypeFilter(v ?? null)}
            style={{ width: 140 }}
          />
        </div>
      </div>
      <Table
        rowKey="id"
        dataSource={filtered}
        columns={columns}
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}

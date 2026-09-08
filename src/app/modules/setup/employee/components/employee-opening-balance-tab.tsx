import { useMemo, useState } from "react";
import {
  Button,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  useOpeningBalancesByEmployee,
  useCreateOpeningBalance,
  useUpdateOpeningBalance,
  useDeleteOpeningBalance,
} from "../hooks/use-employee-relations-queries";
import type { PayrollOpeningBalanceResponse } from "../models/api/response/employee-relations-response.models";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const EMPTY = {
  year: dayjs().year(),
  basicPay: 0,
  overtimePay: 0,
  holidayPay: 0,
  allowances: 0,
  otherIncome: 0,
  bonuses: 0,
  nonTaxableIncome: 0,
  sssContribution: 0,
  philHealthContribution: 0,
  pagIbigContribution: 0,
  withholdingTax: 0,
  otherDeductions: 0,
};

interface Props {
  employeeId?: string;
}

export default function EmployeeOpeningBalanceTab({ employeeId }: Props) {
  const empId = employeeId ?? "";
  const { data = [], isLoading } = useOpeningBalancesByEmployee(empId);
  const { mutateAsync: add, isPending: isAdding } =
    useCreateOpeningBalance(empId);
  const { mutateAsync: upd, isPending: isUpdating } =
    useUpdateOpeningBalance(empId);
  const { mutate: del } = useDeleteOpeningBalance(empId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PayrollOpeningBalanceResponse | null>(
    null,
  );
  const [form, setForm] = useState(EMPTY);

  const grossIncome = useMemo(
    () =>
      form.basicPay +
      form.overtimePay +
      form.holidayPay +
      form.allowances +
      form.otherIncome +
      form.bonuses,
    [form],
  );
  const totalDeductions = useMemo(
    () =>
      form.sssContribution +
      form.philHealthContribution +
      form.pagIbigContribution +
      form.withholdingTax +
      form.otherDeductions,
    [form],
  );
  const netPay = grossIncome - totalDeductions;

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: PayrollOpeningBalanceResponse) {
    setEditing(row);
    setForm({
      year: row.year,
      basicPay: row.basicPay,
      overtimePay: row.overtimePay,
      holidayPay: row.holidayPay,
      allowances: row.allowances,
      otherIncome: row.otherIncome,
      bonuses: row.bonuses,
      nonTaxableIncome: row.nonTaxableIncome,
      sssContribution: row.sssContribution,
      philHealthContribution: row.philHealthContribution,
      pagIbigContribution: row.pagIbigContribution,
      withholdingTax: row.withholdingTax,
      otherDeductions: row.otherDeductions,
    });
    setOpen(true);
  }

  async function handleSave() {
    const payload = { ...form, employeeId: empId };
    if (editing) {
      await upd({ ...editing, ...payload });
      message.success("Updated.");
    } else {
      await add(payload);
      message.success("Added.");
    }
    setOpen(false);
    reset();
  }

  function handleDelete(row: PayrollOpeningBalanceResponse) {
    del(row.id, { onSuccess: () => message.success("Removed.") });
  }

  const columns: ColumnsType<PayrollOpeningBalanceResponse> = [
    { title: "Year", dataIndex: "year", key: "year", width: 90 },
    {
      title: "Gross Income",
      dataIndex: "grossIncome",
      key: "grossIncome",
      align: "right",
      render: fmt,
    },
    {
      title: "Total Deductions",
      dataIndex: "totalDeductions",
      key: "totalDeductions",
      align: "right",
      render: fmt,
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      align: "right",
      render: fmt,
    },
    {
      title: "",
      key: "actions",
      width: 72,
      fixed: "right",
      render: (_, row) => (
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEdit(row)}
          />
          <Popconfirm
            title="Remove this opening balance?"
            onConfirm={() => handleDelete(row)}
            okText="Remove"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col gap-1 mb-3">
        <p className="text-sm text-gray-500 m-0">
          For a company that started using this system mid-year, record this
          employee&apos;s own totals from the previous payroll system here — for
          the months before go-live. Year-End Tax Annualization, YTD Summary,
          13th Month Pay, and the BIR Alphalist/2316 all consolidate this
          automatically with payroll processed in this system for the matching
          year.
        </p>
      </div>
      <div className="flex justify-end mb-3">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          Add Opening Balance
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        size="small"
        loading={isLoading}
        pagination={{ pageSize: 8, showSizeChanger: false, size: "small" }}
        scroll={{ x: "max-content" }}
      />
      <Modal
        open={open}
        title={editing ? "Edit Opening Balance" : "Add Opening Balance"}
        onCancel={() => {
          setOpen(false);
          reset();
        }}
        onOk={handleSave}
        okText={editing ? "Update" : "Add"}
        confirmLoading={isAdding || isUpdating}
        destroyOnHidden
        width={640}
      >
        <Form layout="vertical" style={{ paddingTop: 8 }}>
          <Form.Item label="Year" required>
            <DatePicker
              picker="year"
              className="w-full"
              value={dayjs().year(form.year)}
              allowClear={false}
              onChange={(d) => d && setForm((f) => ({ ...f, year: d.year() }))}
            />
          </Form.Item>

          <Divider
            titlePlacement="left"
            plain
            className="!my-3 !text-xs !text-gray-500"
          >
            Earnings
          </Divider>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item label="Basic Pay (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.basicPay}
                onChange={(v) => setForm((f) => ({ ...f, basicPay: v ?? 0 }))}
              />
            </Form.Item>
            <Form.Item label="Overtime Pay (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.overtimePay}
                onChange={(v) =>
                  setForm((f) => ({ ...f, overtimePay: v ?? 0 }))
                }
              />
            </Form.Item>
            <Form.Item label="Holiday Pay (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.holidayPay}
                onChange={(v) => setForm((f) => ({ ...f, holidayPay: v ?? 0 }))}
              />
            </Form.Item>
            <Form.Item label="Allowances (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.allowances}
                onChange={(v) => setForm((f) => ({ ...f, allowances: v ?? 0 }))}
              />
            </Form.Item>
            <Form.Item label="Other Income (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.otherIncome}
                onChange={(v) =>
                  setForm((f) => ({ ...f, otherIncome: v ?? 0 }))
                }
              />
            </Form.Item>
            <Form.Item label="Bonuses (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.bonuses}
                onChange={(v) => setForm((f) => ({ ...f, bonuses: v ?? 0 }))}
              />
            </Form.Item>
          </div>
          <div className="flex justify-between text-sm font-medium bg-gray-50 rounded px-3 py-2 mb-2">
            <span>Gross Income</span>
            <span>₱ {fmt(grossIncome)}</span>
          </div>

          <Divider
            titlePlacement="left"
            plain
            className="!my-3 !text-xs !text-gray-500"
          >
            Statutory Deductions &amp; Tax
          </Divider>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item label="Non-Taxable Income (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.nonTaxableIncome}
                onChange={(v) =>
                  setForm((f) => ({ ...f, nonTaxableIncome: v ?? 0 }))
                }
              />
            </Form.Item>
            <Form.Item label="SSS Contribution (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.sssContribution}
                onChange={(v) =>
                  setForm((f) => ({ ...f, sssContribution: v ?? 0 }))
                }
              />
            </Form.Item>
            <Form.Item label="PhilHealth Contribution (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.philHealthContribution}
                onChange={(v) =>
                  setForm((f) => ({ ...f, philHealthContribution: v ?? 0 }))
                }
              />
            </Form.Item>
            <Form.Item label="Pag-IBIG Contribution (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.pagIbigContribution}
                onChange={(v) =>
                  setForm((f) => ({ ...f, pagIbigContribution: v ?? 0 }))
                }
              />
            </Form.Item>
            <Form.Item label="Withholding Tax (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.withholdingTax}
                onChange={(v) =>
                  setForm((f) => ({ ...f, withholdingTax: v ?? 0 }))
                }
              />
            </Form.Item>
            <Form.Item label="Other Deductions (₱)">
              <InputNumber
                className="w-full"
                min={0}
                value={form.otherDeductions}
                onChange={(v) =>
                  setForm((f) => ({ ...f, otherDeductions: v ?? 0 }))
                }
              />
            </Form.Item>
          </div>
          <div className="flex justify-between text-sm font-medium bg-gray-50 rounded px-3 py-2 mb-3">
            <span>Total Deductions</span>
            <span>₱ {fmt(totalDeductions)}</span>
          </div>

          <div className="flex justify-between text-base font-semibold bg-[#1DA081]/10 rounded px-3 py-2">
            <span>Net Pay</span>
            <span>₱ {fmt(netPay)}</span>
          </div>
        </Form>
      </Modal>
    </>
  );
}

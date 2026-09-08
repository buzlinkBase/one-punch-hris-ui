import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  usePriorEmployerTaxRecordsByEmployee,
  useCreatePriorEmployerTaxRecord,
  useUpdatePriorEmployerTaxRecord,
  useDeletePriorEmployerTaxRecord,
} from "../hooks/use-employee-relations-queries";
import type { PriorEmployerTaxRecordResponse } from "../models/api/response/employee-relations-response.models";

const fmt = (n: number) =>
  (n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const EMPTY = {
  year: dayjs().year(),
  hasPriorEmployer: true,
  priorEmployerName: "",
  grossIncomeYtd: 0,
  nonTaxableYtd: 0,
  statutoryDeductionsYtd: 0,
  taxWithheldYtd: 0,
};

interface Props {
  employeeId?: string;
}

export default function EmployeePriorEmployerTaxTab({ employeeId }: Props) {
  const empId = employeeId ?? "";
  const { data = [], isLoading } = usePriorEmployerTaxRecordsByEmployee(empId);
  const { mutateAsync: add, isPending: isAdding } =
    useCreatePriorEmployerTaxRecord(empId);
  const { mutateAsync: upd, isPending: isUpdating } =
    useUpdatePriorEmployerTaxRecord(empId);
  const { mutate: del } = useDeletePriorEmployerTaxRecord(empId);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PriorEmployerTaxRecordResponse | null>(
    null,
  );
  const [form, setForm] = useState(EMPTY);

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: PriorEmployerTaxRecordResponse) {
    setEditing(row);
    setForm({
      year: row.year,
      hasPriorEmployer: row.hasPriorEmployer,
      priorEmployerName: row.priorEmployerName ?? "",
      grossIncomeYtd: row.grossIncomeYtd,
      nonTaxableYtd: row.nonTaxableYtd,
      statutoryDeductionsYtd: row.statutoryDeductionsYtd,
      taxWithheldYtd: row.taxWithheldYtd,
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

  function handleDelete(row: PriorEmployerTaxRecordResponse) {
    del(row.id, { onSuccess: () => message.success("Removed.") });
  }

  const columns: ColumnsType<PriorEmployerTaxRecordResponse> = [
    { title: "Year", dataIndex: "year", key: "year", width: 90 },
    {
      title: "Prior Employer",
      key: "hasPriorEmployer",
      render: (_, r) =>
        r.hasPriorEmployer ? (
          <span>{r.priorEmployerName || "Yes"}</span>
        ) : (
          <Tag>None</Tag>
        ),
    },
    {
      title: "Gross Income YTD",
      dataIndex: "grossIncomeYtd",
      key: "gross",
      align: "right",
      render: fmt,
    },
    {
      title: "Non-Taxable YTD",
      dataIndex: "nonTaxableYtd",
      key: "nonTaxable",
      align: "right",
      render: fmt,
    },
    {
      title: "Statutory Deductions YTD",
      dataIndex: "statutoryDeductionsYtd",
      key: "statutory",
      align: "right",
      render: fmt,
    },
    {
      title: "Tax Withheld YTD",
      dataIndex: "taxWithheldYtd",
      key: "withheld",
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
            title="Remove this prior employer tax record?"
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
          For an employee hired mid-year from another employer, record the
          figures from their BIR Form 2316 here — Year-End Tax Annualization
          consolidates them with this employer&apos;s own payroll for the
          matching year.
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
          Add Prior Employer Record
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
        title={
          editing ? "Edit Prior Employer Record" : "Add Prior Employer Record"
        }
        onCancel={() => {
          setOpen(false);
          reset();
        }}
        onOk={handleSave}
        okText={editing ? "Update" : "Add"}
        confirmLoading={isAdding || isUpdating}
        destroyOnHidden
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
          <Form.Item label="Has a prior employer this year">
            <Switch
              checked={form.hasPriorEmployer}
              onChange={(v) => setForm((f) => ({ ...f, hasPriorEmployer: v }))}
            />
          </Form.Item>
          <Form.Item label="Prior Employer Name (optional)">
            <Input
              value={form.priorEmployerName}
              disabled={!form.hasPriorEmployer}
              onChange={(e) =>
                setForm((f) => ({ ...f, priorEmployerName: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Gross Income YTD (₱)">
            <InputNumber
              className="w-full"
              min={0}
              disabled={!form.hasPriorEmployer}
              value={form.grossIncomeYtd}
              onChange={(v) =>
                setForm((f) => ({ ...f, grossIncomeYtd: v ?? 0 }))
              }
            />
          </Form.Item>
          <Form.Item label="Non-Taxable YTD (₱)">
            <InputNumber
              className="w-full"
              min={0}
              disabled={!form.hasPriorEmployer}
              value={form.nonTaxableYtd}
              onChange={(v) =>
                setForm((f) => ({ ...f, nonTaxableYtd: v ?? 0 }))
              }
            />
          </Form.Item>
          <Form.Item label="Statutory Deductions YTD (₱)">
            <InputNumber
              className="w-full"
              min={0}
              disabled={!form.hasPriorEmployer}
              value={form.statutoryDeductionsYtd}
              onChange={(v) =>
                setForm((f) => ({ ...f, statutoryDeductionsYtd: v ?? 0 }))
              }
            />
          </Form.Item>
          <Form.Item label="Tax Withheld YTD (₱)">
            <InputNumber
              className="w-full"
              min={0}
              disabled={!form.hasPriorEmployer}
              value={form.taxWithheldYtd}
              onChange={(v) =>
                setForm((f) => ({ ...f, taxWithheldYtd: v ?? 0 }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

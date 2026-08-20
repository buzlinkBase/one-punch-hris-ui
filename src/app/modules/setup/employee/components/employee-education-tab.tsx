import { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useEducationsByEmployee,
  useCreateEducation,
  useUpdateEducation,
  useDeleteEducation,
} from "../hooks/use-employee-relations-queries";
import type { EducationResponse } from "../models/api/response/employee-relations-response.models";

const EMPTY = { schoolName: "", yearGraduated: new Date().getFullYear() };

interface Props {
  employeeId?: string;
  draftRecords?: EducationResponse[];
  onDraftChange?: (records: EducationResponse[]) => void;
}

export default function EmployeeEducationTab({
  employeeId,
  draftRecords,
  onDraftChange,
}: Props) {
  const isLive = !!employeeId;

  const { data: apiData = [], isLoading } = useEducationsByEmployee(
    employeeId ?? "",
  );
  const { mutateAsync: add, isPending: isAdding } = useCreateEducation(
    employeeId ?? "",
  );
  const { mutateAsync: upd, isPending: isUpdating } = useUpdateEducation(
    employeeId ?? "",
  );
  const { mutate: del } = useDeleteEducation(employeeId ?? "");

  const displayData = isLive ? apiData : (draftRecords ?? []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EducationResponse | null>(null);
  const [form, setForm] = useState(EMPTY);

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: EducationResponse) {
    setEditing(row);
    setForm({ schoolName: row.schoolName, yearGraduated: row.yearGraduated });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.schoolName.trim()) {
      message.warning("School name is required.");
      return;
    }
    if (isLive) {
      const payload = { ...form, employeeId: employeeId! };
      if (editing) {
        await upd({ ...editing, ...payload });
        message.success("Updated.");
      } else {
        await add(payload);
        message.success("Added.");
      }
    } else {
      const current = draftRecords ?? [];
      if (editing) {
        onDraftChange?.(
          current.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
        );
      } else {
        onDraftChange?.([
          ...current,
          { ...form, id: crypto.randomUUID(), employeeId: "" },
        ]);
      }
    }
    setOpen(false);
    reset();
  }

  function handleDelete(row: EducationResponse) {
    if (isLive) {
      del(row.id, { onSuccess: () => message.success("Removed.") });
    } else {
      onDraftChange?.((draftRecords ?? []).filter((r) => r.id !== row.id));
    }
  }

  const columns: ColumnsType<EducationResponse> = [
    {
      title: "School / Institution",
      dataIndex: "schoolName",
      key: "schoolName",
    },
    {
      title: "Year Graduated",
      dataIndex: "yearGraduated",
      key: "yearGraduated",
      width: 140,
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
            title="Remove this education record?"
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
      <div className="flex justify-end mb-3">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          Add Education
        </Button>
      </div>
      <Table
        rowKey="id"
        dataSource={displayData}
        columns={columns}
        size="small"
        loading={isLive && isLoading}
        pagination={{ pageSize: 8, showSizeChanger: false, size: "small" }}
        scroll={{ x: "max-content" }}
      />
      <Modal
        open={open}
        title={editing ? "Edit Education" : "Add Education"}
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
          <Form.Item label="School / Institution" required>
            <Input
              value={form.schoolName}
              onChange={(e) =>
                setForm((f) => ({ ...f, schoolName: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Year Graduated">
            <InputNumber
              className="w-full"
              min={1900}
              max={new Date().getFullYear()}
              value={form.yearGraduated}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  yearGraduated: v ?? new Date().getFullYear(),
                }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

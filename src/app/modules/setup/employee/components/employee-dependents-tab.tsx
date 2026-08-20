import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  useDependentsByEmployee,
  useCreateDependent,
  useUpdateDependent,
  useDeleteDependent,
} from "../hooks/use-employee-relations-queries";
import type { DependentResponse } from "../models/api/response/employee-relations-response.models";

const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Guardian",
  "Other",
].map((v) => ({ value: v, label: v }));

const EMPTY = { fullName: "", relationship: "", gender: "", dob: "" };

interface Props {
  employeeId?: string;
  draftRecords?: DependentResponse[];
  onDraftChange?: (records: DependentResponse[]) => void;
}

export default function EmployeeDependentsTab({
  employeeId,
  draftRecords,
  onDraftChange,
}: Props) {
  const isLive = !!employeeId;

  const { data: apiData = [], isLoading } = useDependentsByEmployee(
    employeeId ?? "",
  );
  const { mutateAsync: add, isPending: isAdding } = useCreateDependent(
    employeeId ?? "",
  );
  const { mutateAsync: upd, isPending: isUpdating } = useUpdateDependent(
    employeeId ?? "",
  );
  const { mutate: del } = useDeleteDependent(employeeId ?? "");

  const displayData = isLive ? apiData : (draftRecords ?? []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DependentResponse | null>(null);
  const [form, setForm] = useState(EMPTY);

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: DependentResponse) {
    setEditing(row);
    setForm({
      fullName: row.fullName,
      relationship: row.relationship,
      gender: row.gender,
      dob: row.dob ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.fullName.trim()) {
      message.warning("Full name is required.");
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

  function handleDelete(row: DependentResponse) {
    if (isLive) {
      del(row.id, { onSuccess: () => message.success("Removed.") });
    } else {
      onDraftChange?.((draftRecords ?? []).filter((r) => r.id !== row.id));
    }
  }

  const columns: ColumnsType<DependentResponse> = [
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    { title: "Relationship", dataIndex: "relationship", key: "relationship" },
    { title: "Gender", dataIndex: "gender", key: "gender", width: 100 },
    {
      title: "Date of Birth",
      dataIndex: "dob",
      key: "dob",
      width: 130,
      render: (v: string) => (v ? dayjs(v).format("MM/DD/YYYY") : "-"),
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
            title="Remove this dependent?"
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
          Add Dependent
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
        title={editing ? "Edit Dependent" : "Add Dependent"}
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
          <Form.Item label="Full Name" required>
            <Input
              value={form.fullName}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullName: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Relationship">
            <Select
              options={RELATIONSHIP_OPTIONS}
              value={form.relationship || undefined}
              onChange={(v) =>
                setForm((f) => ({ ...f, relationship: v ?? "" }))
              }
              allowClear
              showSearch
              placeholder="Select relationship"
            />
          </Form.Item>
          <Form.Item label="Gender">
            <Select
              options={GENDER_OPTIONS}
              value={form.gender || undefined}
              onChange={(v) => setForm((f) => ({ ...f, gender: v ?? "" }))}
              allowClear
              placeholder="Select gender"
            />
          </Form.Item>
          <Form.Item label="Date of Birth">
            <DatePicker
              className="w-full"
              value={form.dob ? dayjs(form.dob) : null}
              onChange={(d) =>
                setForm((f) => ({
                  ...f,
                  dob: d ? d.format("YYYY-MM-DD") : "",
                }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

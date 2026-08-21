import { useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Progress,
  Space,
  Table,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useSkillsByEmployee,
  useCreateSkill,
  useUpdateSkill,
  useDeleteSkill,
} from "../hooks/use-employee-relations-queries";
import type { SkillResponse } from "../models/api/response/employee-relations-response.models";

const EMPTY = { name: "", level: 5 };

interface Props {
  employeeId?: string;
  draftRecords?: SkillResponse[];
  onDraftChange?: (records: SkillResponse[]) => void;
}

export default function EmployeeSkillsTab({
  employeeId,
  draftRecords,
  onDraftChange,
}: Props) {
  const isLive = !!employeeId;

  const { data: apiData = [], isLoading } = useSkillsByEmployee(
    employeeId ?? "",
  );
  const { mutateAsync: add, isPending: isAdding } = useCreateSkill(
    employeeId ?? "",
  );
  const { mutateAsync: upd, isPending: isUpdating } = useUpdateSkill(
    employeeId ?? "",
  );
  const { mutate: del } = useDeleteSkill(employeeId ?? "");

  const displayData = isLive ? apiData : (draftRecords ?? []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SkillResponse | null>(null);
  const [form, setForm] = useState(EMPTY);

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: SkillResponse) {
    setEditing(row);
    setForm({ name: row.name, level: row.level });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      message.warning("Skill name is required.");
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

  function handleDelete(row: SkillResponse) {
    if (isLive) {
      del(row.id, { onSuccess: () => message.success("Removed.") });
    } else {
      onDraftChange?.((draftRecords ?? []).filter((r) => r.id !== row.id));
    }
  }

  const columns: ColumnsType<SkillResponse> = [
    { title: "Skill", dataIndex: "name", key: "name" },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 200,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={(v / 10) * 100}
            size="small"
            showInfo={false}
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: 28, textAlign: "right", fontSize: 12 }}>
            {v}/10
          </span>
        </div>
      ),
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
            title="Remove this skill?"
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
          Add Skill
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
        title={editing ? "Edit Skill" : "Add Skill"}
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
          <Form.Item label="Skill Name" required>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Microsoft Excel"
            />
          </Form.Item>
          <Form.Item
            label="Proficiency Level (0–10)"
            extra="0 = No experience, 10 = Expert"
          >
            <InputNumber
              className="w-full"
              min={0}
              max={10}
              step={0.5}
              precision={1}
              value={form.level}
              onChange={(v) => setForm((f) => ({ ...f, level: v ?? 0 }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

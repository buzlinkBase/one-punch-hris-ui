import { useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import {
  useDocRecordsByEmployee,
  useCreateDocRecord,
  useUpdateDocRecord,
  useDeleteDocRecord,
} from "../hooks/use-employee-relations-queries";
import type { DocRecordResponse } from "../models/api/response/employee-relations-response.models";

const { TextArea } = Input;

const EMPTY = { recordType: "", description: "", file: "" };

interface Props {
  employeeId?: string;
  draftRecords?: DocRecordResponse[];
  onDraftChange?: (records: DocRecordResponse[]) => void;
}

export default function EmployeeDocRecordsTab({
  employeeId,
  draftRecords,
  onDraftChange,
}: Props) {
  const isLive = !!employeeId;

  const { data: apiData = [], isLoading } = useDocRecordsByEmployee(
    employeeId ?? "",
  );
  const { mutateAsync: add, isPending: isAdding } = useCreateDocRecord(
    employeeId ?? "",
  );
  const { mutateAsync: upd, isPending: isUpdating } = useUpdateDocRecord(
    employeeId ?? "",
  );
  const { mutate: del } = useDeleteDocRecord(employeeId ?? "");

  const displayData = isLive ? apiData : (draftRecords ?? []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DocRecordResponse | null>(null);
  const [form, setForm] = useState(EMPTY);

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: DocRecordResponse) {
    setEditing(row);
    setForm({
      recordType: row.recordType,
      description: row.description,
      file: row.file ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.recordType.trim()) {
      message.warning("Record type is required.");
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

  function handleDelete(row: DocRecordResponse) {
    if (isLive) {
      del(row.id, { onSuccess: () => message.success("Removed.") });
    } else {
      onDraftChange?.((draftRecords ?? []).filter((r) => r.id !== row.id));
    }
  }

  const columns: ColumnsType<DocRecordResponse> = [
    {
      title: "Record Type",
      dataIndex: "recordType",
      key: "recordType",
      width: 160,
    },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "File / Reference", dataIndex: "file", key: "file", width: 180 },
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
            title="Remove this document record?"
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
          Add Document
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
        title={editing ? "Edit Document Record" : "Add Document Record"}
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
          <Form.Item label="Record Type" required>
            <Input
              value={form.recordType}
              onChange={(e) =>
                setForm((f) => ({ ...f, recordType: e.target.value }))
              }
              placeholder="e.g. NBI Clearance, Medical Certificate"
            />
          </Form.Item>
          <Form.Item label="Description">
            <TextArea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="File / Reference">
            <Input
              value={form.file}
              onChange={(e) => setForm((f) => ({ ...f, file: e.target.value }))}
              placeholder="File path or reference number"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

import { useState } from "react";
import {
  Button,
  DatePicker,
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
import dayjs from "dayjs";
import {
  useEmploymentHistoriesByEmployee,
  useCreateEmploymentHistory,
  useUpdateEmploymentHistory,
  useDeleteEmploymentHistory,
} from "../hooks/use-employee-relations-queries";
import type { EmploymentHistoryResponse } from "../models/api/response/employee-relations-response.models";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

const EMPTY = { companyName: "", position: "", fromDate: "", toDate: "" };

interface Props {
  employeeId?: string;
  draftRecords?: EmploymentHistoryResponse[];
  onDraftChange?: (records: EmploymentHistoryResponse[]) => void;
}

export default function EmployeeEmploymentHistoryTab({
  employeeId,
  draftRecords,
  onDraftChange,
}: Props) {
  const isLive = !!employeeId;
  const isMobile = useIsMobile();

  const { data: apiData = [], isLoading } = useEmploymentHistoriesByEmployee(
    employeeId ?? "",
  );
  const { mutateAsync: add, isPending: isAdding } = useCreateEmploymentHistory(
    employeeId ?? "",
  );
  const { mutateAsync: upd, isPending: isUpdating } =
    useUpdateEmploymentHistory(employeeId ?? "");
  const { mutate: del } = useDeleteEmploymentHistory(employeeId ?? "");

  const displayData = isLive ? apiData : (draftRecords ?? []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmploymentHistoryResponse | null>(
    null,
  );
  const [form, setForm] = useState(EMPTY);

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: EmploymentHistoryResponse) {
    setEditing(row);
    setForm({
      companyName: row.companyName,
      position: row.position,
      fromDate: row.fromDate ?? "",
      toDate: row.toDate ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.companyName.trim()) {
      message.warning("Company name is required.");
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

  function handleDelete(row: EmploymentHistoryResponse) {
    if (isLive) {
      del(row.id, { onSuccess: () => message.success("Removed.") });
    } else {
      onDraftChange?.((draftRecords ?? []).filter((r) => r.id !== row.id));
    }
  }

  const columns: ColumnsType<EmploymentHistoryResponse> = [
    { title: "Company", dataIndex: "companyName", key: "companyName" },
    { title: "Position", dataIndex: "position", key: "position" },
    {
      title: "From",
      dataIndex: "fromDate",
      key: "fromDate",
      width: 120,
      render: (v: string) => (v ? dayjs(v).format("MM/DD/YYYY") : "-"),
    },
    {
      title: "To",
      dataIndex: "toDate",
      key: "toDate",
      width: 120,
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
            title="Remove this employment record?"
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
          Add Record
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
        title={editing ? "Edit Employment Record" : "Add Employment Record"}
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
          <Form.Item label="Company Name" required>
            <Input
              value={form.companyName}
              onChange={(e) =>
                setForm((f) => ({ ...f, companyName: e.target.value }))
              }
            />
          </Form.Item>
          <Form.Item label="Position / Job Title">
            <Input
              value={form.position}
              onChange={(e) =>
                setForm((f) => ({ ...f, position: e.target.value }))
              }
            />
          </Form.Item>
          <div className={isMobile ? "form-grid-1" : "form-grid-2"}>
            <Form.Item label="From Date">
              <DatePicker
                className="w-full"
                value={form.fromDate ? dayjs(form.fromDate) : null}
                onChange={(d) =>
                  setForm((f) => ({
                    ...f,
                    fromDate: d ? d.format("YYYY-MM-DD") : "",
                  }))
                }
              />
            </Form.Item>
            <Form.Item label="To Date">
              <DatePicker
                className="w-full"
                value={form.toDate ? dayjs(form.toDate) : null}
                onChange={(d) =>
                  setForm((f) => ({
                    ...f,
                    toDate: d ? d.format("YYYY-MM-DD") : "",
                  }))
                }
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}

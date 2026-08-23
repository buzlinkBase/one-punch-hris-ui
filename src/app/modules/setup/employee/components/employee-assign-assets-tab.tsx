import { useState } from "react";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  useAssignAssetsByEmployee,
  useCreateAssignAsset,
  useUpdateAssignAsset,
  useDeleteAssignAsset,
} from "../hooks/use-employee-relations-queries";
import type { AssignAssetResponse } from "../models/api/response/employee-relations-response.models";
import { useIsMobile } from "@/shared/hooks/use-is-mobile";

const { TextArea } = Input;

const ASSET_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Returned", label: "Returned" },
  { value: "Bought", label: "Bought" },
  { value: "Lost", label: "Lost" },
  { value: "Damaged", label: "Damaged" },
  { value: "Transferred", label: "Transferred" },
];

const STATUS_COLOR: Record<string, string> = {
  Active: "success",
  Returned: "default",
  Bought: "blue",
  Lost: "error",
  Damaged: "warning",
  Transferred: "purple",
};

const EMPTY = {
  assetType: "",
  assetDescription: "",
  model: "",
  brand: "",
  serialNo: "",
  qty: 1,
  issuanceDate: "",
  returnedDate: "",
  status: "Active",
  remarks: "",
  file: "",
};

interface Props {
  employeeId?: string;
  draftRecords?: AssignAssetResponse[];
  onDraftChange?: (records: AssignAssetResponse[]) => void;
}

export default function EmployeeAssignAssetsTab({
  employeeId,
  draftRecords,
  onDraftChange,
}: Props) {
  const isLive = !!employeeId;
  const isMobile = useIsMobile();

  const { data: apiData = [], isLoading } = useAssignAssetsByEmployee(
    employeeId ?? "",
  );
  const { mutateAsync: add, isPending: isAdding } = useCreateAssignAsset(
    employeeId ?? "",
  );
  const { mutateAsync: upd, isPending: isUpdating } = useUpdateAssignAsset(
    employeeId ?? "",
  );
  const { mutate: del } = useDeleteAssignAsset(employeeId ?? "");

  const displayData = isLive ? apiData : (draftRecords ?? []);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AssignAssetResponse | null>(null);
  const [form, setForm] = useState(EMPTY);

  function reset() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(row: AssignAssetResponse) {
    setEditing(row);
    setForm({
      assetType: row.assetType ?? "",
      assetDescription: row.assetDescription ?? "",
      model: row.model ?? "",
      brand: row.brand ?? "",
      serialNo: row.serialNo ?? "",
      qty: row.qty ?? 1,
      issuanceDate: row.issuanceDate ?? "",
      returnedDate: row.returnedDate ?? "",
      status: row.status ?? "Active",
      remarks: row.remarks ?? "",
      file: row.file ?? "",
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.assetType.trim()) {
      message.warning("Asset type is required.");
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

  function handleDelete(row: AssignAssetResponse) {
    if (isLive) {
      del(row.id, { onSuccess: () => message.success("Removed.") });
    } else {
      onDraftChange?.((draftRecords ?? []).filter((r) => r.id !== row.id));
    }
  }

  const f =
    (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const columns: ColumnsType<AssignAssetResponse> = [
    {
      title: "Asset Type",
      dataIndex: "assetType",
      key: "assetType",
      width: 130,
    },
    {
      title: "Description",
      dataIndex: "assetDescription",
      key: "assetDescription",
    },
    { title: "Brand", dataIndex: "brand", key: "brand", width: 110 },
    { title: "Model", dataIndex: "model", key: "model", width: 110 },
    { title: "Serial No.", dataIndex: "serialNo", key: "serialNo", width: 130 },
    { title: "Qty", dataIndex: "qty", key: "qty", width: 60, align: "center" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (v: string) => (
        <Tag color={STATUS_COLOR[v] ?? "default"}>{v ?? "Active"}</Tag>
      ),
    },
    {
      title: "Issued",
      dataIndex: "issuanceDate",
      key: "issuanceDate",
      width: 115,
      render: (v: string) => (v ? dayjs(v).format("MM/DD/YYYY") : "-"),
    },
    {
      title: "Returned",
      dataIndex: "returnedDate",
      key: "returnedDate",
      width: 115,
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
            title="Remove this asset?"
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
          Add Asset
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
        title={editing ? "Edit Asset" : "Assign Asset"}
        onCancel={() => {
          setOpen(false);
          reset();
        }}
        onOk={handleSave}
        okText={editing ? "Update" : "Assign"}
        confirmLoading={isAdding || isUpdating}
        destroyOnHidden
        width={600}
      >
        <Form layout="vertical" style={{ paddingTop: 8 }}>
          <div className={isMobile ? "form-grid-1" : "form-grid-2"}>
            <Form.Item label="Asset Type" required>
              <Input
                value={form.assetType}
                onChange={f("assetType")}
                placeholder="e.g. Laptop, ID Card"
              />
            </Form.Item>
            <Form.Item label="Qty">
              <InputNumber
                className="w-full"
                min={1}
                value={form.qty}
                onChange={(v) => setForm((p) => ({ ...p, qty: v ?? 1 }))}
              />
            </Form.Item>
          </div>
          <Form.Item label="Description">
            <Input
              value={form.assetDescription}
              onChange={f("assetDescription")}
            />
          </Form.Item>
          <div className={isMobile ? "form-grid-1" : "form-grid-2"}>
            <Form.Item label="Brand">
              <Input value={form.brand} onChange={f("brand")} />
            </Form.Item>
            <Form.Item label="Model">
              <Input value={form.model} onChange={f("model")} />
            </Form.Item>
          </div>
          <div className={isMobile ? "form-grid-1" : "form-grid-2"}>
            <Form.Item label="Serial No.">
              <Input value={form.serialNo} onChange={f("serialNo")} />
            </Form.Item>
            <Form.Item label="Status">
              <Select
                options={ASSET_STATUS_OPTIONS}
                value={form.status}
                onChange={(v) =>
                  setForm((p) => ({ ...p, status: v ?? "Active" }))
                }
              />
            </Form.Item>
          </div>
          <div className={isMobile ? "form-grid-1" : "form-grid-2"}>
            <Form.Item label="Issuance Date">
              <DatePicker
                className="w-full"
                value={form.issuanceDate ? dayjs(form.issuanceDate) : null}
                onChange={(d) =>
                  setForm((p) => ({
                    ...p,
                    issuanceDate: d ? d.format("YYYY-MM-DD") : "",
                  }))
                }
              />
            </Form.Item>
            <Form.Item label="Returned Date">
              <DatePicker
                className="w-full"
                value={form.returnedDate ? dayjs(form.returnedDate) : null}
                onChange={(d) =>
                  setForm((p) => ({
                    ...p,
                    returnedDate: d ? d.format("YYYY-MM-DD") : "",
                  }))
                }
              />
            </Form.Item>
          </div>
          <Form.Item label="Remarks">
            <TextArea rows={2} value={form.remarks} onChange={f("remarks")} />
          </Form.Item>
          <Form.Item label="File / Reference">
            <Input
              value={form.file}
              onChange={f("file")}
              placeholder="File path or reference"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

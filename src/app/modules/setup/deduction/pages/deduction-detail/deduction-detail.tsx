import { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deductionFormSchema,
  type DeductionFormValues,
} from "../../models/forms/deduction-form.schema";
import {
  useDeduction,
  useCreateDeduction,
  useUpdateDeduction,
} from "../../hooks/use-deduction-queries";
import {
  useDeductionTypes,
  useCreateDeductionType,
  useUpdateDeductionType,
  useDeleteDeductionType,
} from "@/app/modules/setup/deduction-type/hooks/use-deduction-type-queries";
import type { DeductionTypeResponse } from "@/app/modules/setup/deduction-type/models/api/response/deduction-type-response.model";
import { DEDUCTION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title, Text } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

// ── Manage Deduction Types modal ──────────────────────────────────────────────

function ManageDeductionTypesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: types = [], isLoading } = useDeductionTypes();
  const { mutateAsync: add, isPending: isAdding } = useCreateDeductionType();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateDeductionType();
  const { mutate: remove } = useDeleteDeductionType();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");

  function resetForm() {
    setEditingId(null);
    setCode("");
    setName("");
    setStatus("ACTIVE");
  }

  function loadForEdit(row: DeductionTypeResponse) {
    setEditingId(row.id);
    setCode(row.code);
    setName(row.name);
    setStatus(row.status);
  }

  async function handleSave() {
    if (!code.trim() || !name.trim()) {
      message.warning("Code and Name are required.");
      return;
    }
    if (editingId) {
      await update({
        id: editingId,
        code: code.trim(),
        name: name.trim(),
        status,
      });
      message.success("Updated.");
    } else {
      await add({ code: code.trim(), name: name.trim(), status });
      message.success("Added.");
    }
    resetForm();
  }

  const columns: ColumnsType<DeductionTypeResponse> = [
    { title: "Code", dataIndex: "code", key: "code", width: 100 },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (v) => (
        <Tag
          color={v === "ACTIVE" ? "success" : "default"}
          className="text-[11px]"
        >
          {v === "ACTIVE" ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 72,
      render: (_, row) => (
        <Space size="small">
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => loadForEdit(row)}
          />
          <Popconfirm
            title="Delete this type?"
            onConfirm={() =>
              remove(row.id, { onSuccess: () => message.success("Deleted.") })
            }
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={() => {
        resetForm();
        onClose();
      }}
      footer={null}
      title="Manage Deduction Types"
      width={560}
      destroyOnHidden
    >
      {/* Mini form */}
      <div className="rounded-lg border border-solid border-(--ant-color-border) bg-(--ant-color-fill-quaternary) px-4 py-3 mb-4">
        <Text strong className="text-sm block mb-2">
          {editingId ? "Edit Type" : "Add New Type"}
        </Text>
        <div className="form-grid-2 gap-2 mb-2">
          <div>
            <div className="text-xs mb-1">Code</div>
            <Input
              size="small"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SSS"
            />
          </div>
          <div>
            <div className="text-xs mb-1">Name</div>
            <Input
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Government Deduction"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            size="small"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            className="w-30"
          />
          <Button
            type="primary"
            size="small"
            loading={isAdding || isUpdating}
            onClick={handleSave}
          >
            {editingId ? "Update" : "Add"}
          </Button>
          {editingId && (
            <Button size="small" onClick={resetForm}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <Table
        rowKey="id"
        dataSource={types}
        columns={columns}
        loading={isLoading}
        size="small"
        pagination={{ pageSize: 8, showSizeChanger: false, size: "small" }}
        rowClassName={(row) =>
          row.id === editingId ? "ant-table-row-selected" : ""
        }
      />
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DeductionDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useDeduction(isEdit ? id : undefined);
  const { data: deductionTypes = [] } = useDeductionTypes();
  const { mutateAsync: add, isPending: isCreating } = useCreateDeduction();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateDeduction();
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  const deductionTypeOptions = deductionTypes
    .filter((t) => t.status === "ACTIVE")
    .map((t) => ({ value: t.id, label: t.name }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DeductionFormValues>({
    resolver: zodResolver(deductionFormSchema),
    defaultValues: {
      code: "",
      name: "",
      deductionTypeId: "",
      status: "ACTIVE",
      allowEmployeeFiling: true,
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        deductionTypeId: selected.deductionTypeId,
        status: selected.status,
        allowEmployeeFiling: selected.allowEmployeeFiling ?? true,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: DeductionFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/deduction" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? DEDUCTION_LABEL.EDIT_TITLE
                : DEDUCTION_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define deduction master records for payroll computation.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/deduction" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={DEDUCTION_LABEL.CODE}
            validateStatus={errors.code ? "error" : ""}
            help={errors.code?.message}
          >
            <Controller
              name="code"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={DEDUCTION_LABEL.NAME}
            validateStatus={errors.name ? "error" : ""}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={
              <Space size={6}>
                {DEDUCTION_LABEL.DEDUCTION_TYPE}
                <Button
                  type="link"
                  size="small"
                  icon={<PlusOutlined />}
                  style={{ padding: 0, height: "auto", fontSize: 12 }}
                  onClick={() => setTypeModalOpen(true)}
                >
                  Manage Types
                </Button>
              </Space>
            }
            validateStatus={errors.deductionTypeId ? "error" : ""}
            help={errors.deductionTypeId?.message}
          >
            <Controller
              name="deductionTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  optionFilterProp="label"
                  options={deductionTypeOptions}
                  placeholder="Select deduction type"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={DEDUCTION_LABEL.STATUS}
            validateStatus={errors.status ? "error" : ""}
            help={errors.status?.message}
          >
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={STATUS_OPTIONS}
                  placeholder="Select status"
                />
              )}
            />
          </Form.Item>

          <Form.Item label={DEDUCTION_LABEL.ALLOW_EMPLOYEE_FILING}>
            <Space align="center">
              <Controller
                name="allowEmployeeFiling"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                    size="small"
                  />
                )}
              />
              <Text type="secondary" className="text-xs">
                When on, employees can file this in the Employee Portal (e.g.
                Request a Loan). When off, it&apos;s hidden from the portal and
                can only be filed by HR.
              </Text>
            </Space>
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/deduction" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <PermissionGate
                permission={
                  isEdit
                    ? "Deductions & Income Setup:Edit"
                    : "Deductions & Income Setup:Create"
                }
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isUpdating || isCreating}
                >
                  {NAVIGATION_BUTTON_LABEL.SAVE}
                </Button>
              </PermissionGate>
            </Space>
          </div>
        </Form>
      </div>

      <ManageDeductionTypesModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
      />
    </div>
  );
}

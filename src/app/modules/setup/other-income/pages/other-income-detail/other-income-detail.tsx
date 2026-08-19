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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import {
  otherIncomeFormSchema,
  type OtherIncomeFormValues,
} from "../../models/forms/other-income-form.schema";
import {
  useOtherIncome,
  useCreateOtherIncome,
  useUpdateOtherIncome,
} from "../../hooks/use-other-income-queries";
import {
  useOtherIncomeTypes,
  useCreateOtherIncomeType,
  useUpdateOtherIncomeType,
  useDeleteOtherIncomeType,
} from "@/app/modules/setup/other-income-type/hooks/use-other-income-type-queries";
import type { OtherIncomeTypeResponse } from "@/app/modules/setup/other-income-type/models/api/response/other-income-type-response.model";
import {
  INCOME_CLASS_OPTIONS,
  OTHER_INCOME_LABEL,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title, Text } = Typography;

// ── Manage Income Types modal ─────────────────────────────────────────────────

function ManageIncomeTypesModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: types = [], isLoading } = useOtherIncomeTypes();
  const { mutateAsync: add, isPending: isAdding } = useCreateOtherIncomeType();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateOtherIncomeType();
  const { mutate: remove } = useDeleteOtherIncomeType();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");

  function resetForm() {
    setEditingId(null);
    setDescription("");
  }

  function loadForEdit(row: OtherIncomeTypeResponse) {
    setEditingId(row.id);
    setDescription(row.description);
  }

  async function handleSave() {
    if (!description.trim()) {
      message.warning("Description is required.");
      return;
    }
    if (editingId) {
      await update({ id: editingId, description: description.trim() });
      message.success("Updated.");
    } else {
      await add({ description: description.trim() });
      message.success("Added.");
    }
    resetForm();
  }

  const columns: ColumnsType<OtherIncomeTypeResponse> = [
    { title: "Description", dataIndex: "description", key: "description" },
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
      title="Manage Income Types"
      width={480}
      destroyOnHidden
    >
      {/* Mini form */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #f0f0f0",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 16,
        }}
      >
        <Text
          strong
          style={{ fontSize: 13, display: "block", marginBottom: 8 }}
        >
          {editingId ? "Edit Type" : "Add New Type"}
        </Text>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, marginBottom: 4 }}>Description</div>
            <Input
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Allowance, Bonus"
              onPressEnter={handleSave}
            />
          </div>
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

export default function OtherIncomeDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  const { data: selected } = useOtherIncome(isEdit ? id : undefined);
  const { data: types = [] } = useOtherIncomeTypes();
  const { mutateAsync: add, isPending: isCreating } = useCreateOtherIncome();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateOtherIncome();

  const typeOptions = types.map((t) => ({ value: t.id, label: t.description }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OtherIncomeFormValues>({
    resolver: zodResolver(otherIncomeFormSchema),
    defaultValues: {
      code: "",
      name: "",
      incomeClass: "Regular",
      incomeTypeId: undefined,
      isTaxable: false,
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        incomeClass: selected.incomeClass,
        incomeTypeId: selected.incomeTypeId ?? undefined,
        isTaxable: selected.isTaxable,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: OtherIncomeFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/other-income" });
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? OTHER_INCOME_LABEL.EDIT_TITLE
                : OTHER_INCOME_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define an allowance, bonus, or other compensation item.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/other-income" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              label={OTHER_INCOME_LABEL.CODE}
              validateStatus={errors.code ? "error" : ""}
              help={errors.code?.message}
            >
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. RICE_SUB" />
                )}
              />
            </Form.Item>

            <Form.Item
              label={OTHER_INCOME_LABEL.NAME}
              validateStatus={errors.name ? "error" : ""}
              help={errors.name?.message}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. Rice Subsidy" />
                )}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <Form.Item
              label={OTHER_INCOME_LABEL.INCOME_CLASS}
              validateStatus={errors.incomeClass ? "error" : ""}
              help={errors.incomeClass?.message}
            >
              <Controller
                name="incomeClass"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={INCOME_CLASS_OPTIONS}
                    placeholder="Select income class"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={
                <Space size={6}>
                  {OTHER_INCOME_LABEL.INCOME_TYPE}
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
            >
              <Controller
                name="incomeTypeId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    options={typeOptions}
                    placeholder="Select category (optional)"
                    value={field.value ?? undefined}
                    onChange={(v) => field.onChange(v ?? undefined)}
                  />
                )}
              />
            </Form.Item>
          </div>

          <Form.Item label={OTHER_INCOME_LABEL.IS_TAXABLE}>
            <Controller
              name="isTaxable"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onChange={field.onChange}
                  checkedChildren="Taxable"
                  unCheckedChildren="Non-Taxable"
                />
              )}
            />
          </Form.Item>

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/other-income" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isCreating || isUpdating}
              >
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>

      <ManageIncomeTypesModal
        open={typeModalOpen}
        onClose={() => setTypeModalOpen(false)}
      />
    </div>
  );
}

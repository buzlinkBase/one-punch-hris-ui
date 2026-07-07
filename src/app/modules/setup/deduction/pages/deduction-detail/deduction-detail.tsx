import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  InputNumber,
} from "antd";
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
import { useDeductionTypes } from "@/app/modules/setup/deduction-type/hooks/use-deduction-type-queries";
import { DEDUCTION_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export default function DeductionDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useDeduction(isEdit ? id : undefined);
  const { data: deductionTypes = [] } = useDeductionTypes();
  const { mutateAsync: add, isPending: isCreating } = useCreateDeduction();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateDeduction();

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
      amount: 0,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        deductionTypeId: selected.deductionTypeId,
        amount: selected.amount,
        status: selected.status,
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
            label={DEDUCTION_LABEL.DEDUCTION_TYPE}
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
            label={DEDUCTION_LABEL.AMOUNT}
            validateStatus={errors.amount ? "error" : ""}
            help={errors.amount?.message}
          >
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  precision={2}
                  prefix="₱"
                  style={{ width: "100%" }}
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

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/deduction" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating || isCreating}
              >
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}

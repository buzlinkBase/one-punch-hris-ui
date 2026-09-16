import { useEffect } from "react";
import {
  Form,
  Button,
  Typography,
  Space,
  Tag,
  InputNumber,
  Select,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  wtaxTableFormSchema,
  type WtaxTableFormValues,
} from "../../models/forms/wtax-table-form.schema";
import {
  useWtaxTableRow,
  useCreateWtaxTableRow,
  useUpdateWtaxTableRow,
} from "../../hooks/use-wtax-table-queries";
import {
  WTAX_TABLE_LABEL,
  PAYROLL_TYPE_OPTIONS,
} from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

export default function WtaxTableDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useWtaxTableRow(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateWtaxTableRow();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateWtaxTableRow();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WtaxTableFormValues>({
    resolver: zodResolver(wtaxTableFormSchema) as Resolver<WtaxTableFormValues>,
    defaultValues: {
      payrollType: "SEMI_MONTHLY",
      rangeFrom: 0,
      rangeTo: 0,
      baseTaxDue: 0,
      addOnPercentage: 0,
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        payrollType: selected.payrollType,
        rangeFrom: selected.rangeFrom,
        rangeTo: selected.rangeTo,
        baseTaxDue: selected.baseTaxDue,
        addOnPercentage: selected.addOnPercentage,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: WtaxTableFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/wtax-table" });
  };

  const numField = (name: keyof WtaxTableFormValues, label: string) => (
    <Form.Item
      label={label}
      validateStatus={errors[name] ? "error" : ""}
      help={errors[name]?.message}
    >
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <InputNumber
            {...field}
            onChange={(v) => field.onChange(v ?? 0)}
            min={0}
            step={0.01}
            style={{ width: "100%" }}
          />
        )}
      />
    </Form.Item>
  );

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit
                ? WTAX_TABLE_LABEL.EDIT_TITLE
                : WTAX_TABLE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define a withholding tax bracket for a payroll type and salary
              range.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/wtax-table" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label={WTAX_TABLE_LABEL.PAYROLL_TYPE}
            validateStatus={errors.payrollType ? "error" : ""}
            help={errors.payrollType?.message}
          >
            <Controller
              name="payrollType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={PAYROLL_TYPE_OPTIONS}
                  placeholder="Select payroll type"
                />
              )}
            />
          </Form.Item>

          {numField("rangeFrom", WTAX_TABLE_LABEL.RANGE_FROM)}
          {numField("rangeTo", WTAX_TABLE_LABEL.RANGE_TO)}
          {numField("baseTaxDue", WTAX_TABLE_LABEL.BASE_TAX_DUE)}
          {numField("addOnPercentage", WTAX_TABLE_LABEL.ADD_ON_PERCENTAGE)}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/setup/wtax-table" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              <PermissionGate
                permission={
                  isEdit ? "Statutory Tables:Edit" : "Statutory Tables:Create"
                }
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreating || isUpdating}
                >
                  {NAVIGATION_BUTTON_LABEL.SAVE}
                </Button>
              </PermissionGate>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}

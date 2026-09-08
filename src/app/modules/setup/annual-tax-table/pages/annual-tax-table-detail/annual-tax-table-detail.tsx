import { useEffect } from "react";
import { Form, Button, Typography, Space, Tag, InputNumber } from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  annualTaxTableFormSchema,
  type AnnualTaxTableFormValues,
} from "../../models/forms/annual-tax-table-form.schema";
import {
  useAnnualTaxTableRow,
  useCreateAnnualTaxTableRow,
  useUpdateAnnualTaxTableRow,
} from "../../hooks/use-annual-tax-table-queries";
import { ANNUAL_TAX_TABLE_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";

const { Title } = Typography;

export default function AnnualTaxTableDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: selected } = useAnnualTaxTableRow(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } =
    useCreateAnnualTaxTableRow();
  const { mutateAsync: update, isPending: isUpdating } =
    useUpdateAnnualTaxTableRow();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnualTaxTableFormValues>({
    resolver: zodResolver(
      annualTaxTableFormSchema,
    ) as Resolver<AnnualTaxTableFormValues>,
    defaultValues: {
      rangeFrom: 0,
      rangeTo: 0,
      baseTaxDue: 0,
      addOnPercentage: 0,
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        rangeFrom: selected.rangeFrom,
        rangeTo: selected.rangeTo,
        baseTaxDue: selected.baseTaxDue,
        addOnPercentage: selected.addOnPercentage,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: AnnualTaxTableFormValues) => {
    if (isEdit && id) {
      await update({ id, ...values });
    } else {
      await add(values);
    }
    navigate({ to: "/setup/annual-tax-table" });
  };

  const numField = (name: keyof AnnualTaxTableFormValues, label: string) => (
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
                ? ANNUAL_TAX_TABLE_LABEL.EDIT_TITLE
                : ANNUAL_TAX_TABLE_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Define an annual income tax bracket and its rates.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/annual-tax-table" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          {numField("rangeFrom", ANNUAL_TAX_TABLE_LABEL.RANGE_FROM)}
          {numField("rangeTo", ANNUAL_TAX_TABLE_LABEL.RANGE_TO)}
          {numField("baseTaxDue", ANNUAL_TAX_TABLE_LABEL.BASE_TAX_DUE)}
          {numField(
            "addOnPercentage",
            ANNUAL_TAX_TABLE_LABEL.ADD_ON_PERCENTAGE,
          )}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button
                onClick={() => navigate({ to: "/setup/annual-tax-table" })}
              >
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
    </div>
  );
}

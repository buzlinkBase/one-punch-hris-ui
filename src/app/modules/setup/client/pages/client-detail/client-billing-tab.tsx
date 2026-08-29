import { useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  notification,
} from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientBillingFormSchema,
  type ClientBillingFormValues,
} from "../../models/forms/client-billing-form.schema";
import {
  useClientBilling,
  useUpdateClientBilling,
} from "../../hooks/use-client-billing-queries";
import {
  CLIENT_LABEL,
  CLIENT_BILLING_LABEL,
  BILLING_CYCLE_OPTIONS,
} from "../../constants/label.const";

interface Props {
  clientId: string;
}

export default function ClientBillingTab({ clientId }: Props) {
  const { data: billing, isLoading } = useClientBilling(clientId);
  const { mutateAsync: update, isPending } = useUpdateClientBilling(clientId);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientBillingFormValues>({
    resolver: zodResolver(clientBillingFormSchema),
    defaultValues: {
      tin: "",
      billingAddress: "",
      billingContactName: "",
      billingEmail: "",
      billingPhone: "",
      paymentTermsDays: 30,
      billingCycle: "Monthly",
      currency: "PHP",
      notes: null,
    },
  });

  useEffect(() => {
    if (billing) {
      reset({
        tin: billing.tin,
        billingAddress: billing.billingAddress,
        billingContactName: billing.billingContactName,
        billingEmail: billing.billingEmail,
        billingPhone: billing.billingPhone,
        paymentTermsDays: billing.paymentTermsDays,
        billingCycle: billing.billingCycle,
        currency: billing.currency,
        notes: billing.notes,
      });
    }
  }, [billing, reset]);

  const onSubmit = async (values: ClientBillingFormValues) => {
    try {
      await update(values);
      notification.success({
        message: "Billing info saved",
        description: "Client billing information has been updated.",
        placement: "topRight",
      });
    } catch {
      notification.error({
        message: "Save failed",
        description: "Failed to update billing information. Please try again.",
        placement: "topRight",
      });
    }
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="form-page-body"
    >
      <Card title={CLIENT_LABEL.TAB_BILLING} loading={isLoading} size="small">
        <div className="form-grid-2">
          <Form.Item
            label={CLIENT_BILLING_LABEL.TIN}
            validateStatus={errors.tin ? "error" : ""}
            help={errors.tin?.message}
          >
            <Controller
              name="tin"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.BILLING_CYCLE}
            validateStatus={errors.billingCycle ? "error" : ""}
            help={errors.billingCycle?.message}
          >
            <Controller
              name="billingCycle"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={BILLING_CYCLE_OPTIONS}
                  placeholder="Select billing cycle"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.PAYMENT_TERMS_DAYS}
            validateStatus={errors.paymentTermsDays ? "error" : ""}
            help={errors.paymentTermsDays?.message}
          >
            <Controller
              name="paymentTermsDays"
              control={control}
              render={({ field }) => (
                <InputNumber
                  {...field}
                  min={0}
                  style={{ width: "100%" }}
                  addonAfter="days"
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.CURRENCY}
            validateStatus={errors.currency ? "error" : ""}
            help={errors.currency?.message}
          >
            <Controller
              name="currency"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.BILLING_CONTACT_NAME}
            validateStatus={errors.billingContactName ? "error" : ""}
            help={errors.billingContactName?.message}
          >
            <Controller
              name="billingContactName"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.BILLING_EMAIL}
            validateStatus={errors.billingEmail ? "error" : ""}
            help={errors.billingEmail?.message}
          >
            <Controller
              name="billingEmail"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.BILLING_PHONE}
            validateStatus={errors.billingPhone ? "error" : ""}
            help={errors.billingPhone?.message}
          >
            <Controller
              name="billingPhone"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.BILLING_ADDRESS}
            validateStatus={errors.billingAddress ? "error" : ""}
            help={errors.billingAddress?.message}
          >
            <Controller
              name="billingAddress"
              control={control}
              render={({ field }) => <Input {...field} />}
            />
          </Form.Item>

          <Form.Item
            label={CLIENT_BILLING_LABEL.NOTES}
            className="col-span-2"
            validateStatus={errors.notes ? "error" : ""}
            help={errors.notes?.message}
          >
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Input.TextArea {...field} value={field.value ?? ""} rows={3} />
              )}
            />
          </Form.Item>
        </div>
      </Card>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Save Billing Info
          </Button>
        </Space>
      </div>
    </Form>
  );
}

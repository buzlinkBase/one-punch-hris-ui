import { useEffect } from "react";
import { Modal, Form, Select, Spin } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientPolicyFormSchema,
  type ClientPolicyFormValues,
} from "../../models/forms/client-policy-form.schema";
import {
  useClientPolicy,
  useUpdateClientPolicy,
} from "../../hooks/use-client-policy-queries";
import {
  OT_INCLUSION_OPTIONS,
  OT_ELIGIBILITY_OPTIONS,
} from "@/app/modules/setup/company-policy/constants/label.const";

interface Props {
  clientId: string | null;
  clientName?: string;
  onClose: () => void;
}

export default function ClientPolicyModal({
  clientId,
  clientName,
  onClose,
}: Props) {
  const { data, isLoading } = useClientPolicy(clientId ?? undefined);
  const { mutateAsync, isPending } = useUpdateClientPolicy(clientId ?? "");

  const { control, handleSubmit, reset } = useForm<ClientPolicyFormValues>({
    resolver: zodResolver(clientPolicyFormSchema),
    defaultValues: { otEligibility: null, otInclusionPolicy: null },
  });

  useEffect(() => {
    if (data) {
      reset({
        otEligibility: data.otEligibility ?? null,
        otInclusionPolicy: data.otInclusionPolicy ?? null,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: ClientPolicyFormValues) => {
    await mutateAsync({
      otEligibility: values.otEligibility ?? null,
      otInclusionPolicy: values.otInclusionPolicy ?? null,
    });
    onClose();
  };

  return (
    <Modal
      title={`OT Policy — ${clientName ?? clientId}`}
      open={!!clientId}
      onCancel={onClose}
      onOk={handleSubmit(onSubmit)}
      okText="Save"
      okButtonProps={{ loading: isPending }}
      destroyOnClose
      width={480}
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <Form layout="vertical" className="mt-4">
          <Form.Item label="OT Eligibility">
            <Controller
              name="otEligibility"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  placeholder="Select to override..."
                  options={OT_ELIGIBILITY_OPTIONS}
                  onChange={(v) => field.onChange(v ?? null)}
                />
              )}
            />
          </Form.Item>
          <Form.Item label="OT Inclusion Policy">
            <Controller
              name="otInclusionPolicy"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  allowClear
                  placeholder="Select to override..."
                  options={OT_INCLUSION_OPTIONS}
                  onChange={(v) => field.onChange(v ?? null)}
                />
              )}
            />
          </Form.Item>
          <p className="text-xs text-gray-400 mt-2">
            Leave a field empty to inherit the company-level setting.
          </p>
        </Form>
      )}
    </Modal>
  );
}

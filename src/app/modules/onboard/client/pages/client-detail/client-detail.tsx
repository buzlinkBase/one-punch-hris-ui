import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  Typography,
} from "antd";
import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import { CLIENT_LABEL } from "../../constants/label.const";
import {
  useClient,
  useCreateClient,
  useDeactivateClient,
  useUpdateClient,
} from "../../hooks/use-client-queries";
import type { DeactivateClient } from "../../models/api/request/deactivate-client.model";
import type { UpdateClient } from "../../models/api/request/update-client.model";
import {
  clientFormSchema,
  type ClientFormInput,
  type ClientFormValues,
} from "../../models/forms/client-form.schema";

const { Title, Text } = Typography;

export default function ClientDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: selected } = useClient(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateClient();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateClient();
  const { mutateAsync: deactivate, isPending: isDeactivating } =
    useDeactivateClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormInput, unknown, ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      clientCode: "",
      clientName: "",
      contactPerson: "",
      contactNumber: "",
      email: "",
      address: "",
      unpaidDues: 0,
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        clientCode: selected.clientCode,
        clientName: selected.clientName,
        contactPerson: selected.contactPerson,
        contactNumber: selected.contactNumber,
        email: selected.email,
        address: selected.address,
        unpaidDues: selected.unpaidDues,
      });
    }
  }, [isEdit, reset, selected]);

  const onSubmit: SubmitHandler<ClientFormValues> = async (values) => {
    if (isEdit && id) {
      const payload: UpdateClient = {
        id,
        ...values,
      };

      await update(payload);
    } else {
      await add(values);
    }

    navigate({ to: "/clients" });
  };

  const handleDeactivate = async () => {
    if (!id) {
      return;
    }

    const payload: DeactivateClient = {
      id,
      deactivationReason: "UNPAID_DUES",
    };

    await deactivate(payload);
    navigate({ to: "/clients" });
  };

  const isSubmitting = isCreating || isUpdating;
  const canDeactivate = Boolean(
    isEdit &&
    selected &&
    selected.status === "ACTIVE" &&
    selected.unpaidDues > 0,
  );

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="!mb-0">
              {isEdit ? CLIENT_LABEL.EDIT_TITLE : CLIENT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Keep client profile, contact, and billing details current.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            {selected ? (
              <Tag color={selected.status === "ACTIVE" ? "green" : "red"}>
                {selected.status}
              </Tag>
            ) : null}
            <Button onClick={() => navigate({ to: "/clients" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <div className="form-page-body">
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <section className="form-section-anchor">
            <Card className="form-section-card" title="Client Profile">
              <div className="form-grid-2">
                <Form.Item
                  label={CLIENT_LABEL.CLIENT_CODE}
                  validateStatus={errors.clientCode ? "error" : ""}
                  help={errors.clientCode?.message}
                >
                  <Controller
                    name="clientCode"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={CLIENT_LABEL.CLIENT_NAME}
                  validateStatus={errors.clientName ? "error" : ""}
                  help={errors.clientName?.message}
                >
                  <Controller
                    name="clientName"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={CLIENT_LABEL.CONTACT_PERSON}
                  validateStatus={errors.contactPerson ? "error" : ""}
                  help={errors.contactPerson?.message}
                >
                  <Controller
                    name="contactPerson"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={CLIENT_LABEL.CONTACT_NUMBER}
                  validateStatus={errors.contactNumber ? "error" : ""}
                  help={errors.contactNumber?.message}
                >
                  <Controller
                    name="contactNumber"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={CLIENT_LABEL.EMAIL}
                  validateStatus={errors.email ? "error" : ""}
                  help={errors.email?.message}
                >
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
                <Form.Item
                  label={CLIENT_LABEL.UNPAID_DUES}
                  validateStatus={errors.unpaidDues ? "error" : ""}
                  help={errors.unpaidDues?.message}
                >
                  <Controller
                    name="unpaidDues"
                    control={control}
                    render={({ field }) => (
                      <InputNumber
                        value={field.value as number}
                        className="w-full"
                        min={0}
                        precision={2}
                        prefix="P"
                        onChange={(value) => field.onChange(value ?? 0)}
                      />
                    )}
                  />
                </Form.Item>
                <Form.Item
                  label={CLIENT_LABEL.ADDRESS}
                  className="col-span-2"
                  validateStatus={errors.address ? "error" : ""}
                  help={errors.address?.message}
                >
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <Input.TextArea rows={3} {...field} />
                    )}
                  />
                </Form.Item>
              </div>
            </Card>
          </section>

          {selected ? (
            <section className="form-section-anchor">
              <Card className="form-section-card" title="Account Status">
                <div className="flex flex-col gap-2">
                  <Text>
                    Current status: <strong>{selected.status}</strong>
                  </Text>
                  <Text>
                    Outstanding dues:{" "}
                    <strong>P{selected.unpaidDues.toFixed(2)}</strong>
                  </Text>
                  {selected.deactivationReason ? (
                    <Text>
                      Deactivation reason:{" "}
                      <strong>{selected.deactivationReason}</strong>
                    </Text>
                  ) : null}
                </div>
              </Card>
            </section>
          ) : null}

          <div className="form-action-footer">
            <Space className="form-action-footer-row">
              <Button onClick={() => navigate({ to: "/clients" })}>
                {NAVIGATION_BUTTON_LABEL.BACK}
              </Button>
              {canDeactivate ? (
                <Button
                  danger
                  onClick={handleDeactivate}
                  loading={isDeactivating}
                >
                  {CLIENT_LABEL.DEACTIVATE_TITLE}
                </Button>
              ) : null}
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {NAVIGATION_BUTTON_LABEL.SAVE}
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </div>
  );
}

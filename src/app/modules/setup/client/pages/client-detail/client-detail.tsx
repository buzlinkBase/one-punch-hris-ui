import { useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  Tabs,
} from "antd";
import { useNavigate } from "@tanstack/react-router";
import { useRouteParams } from "@/shared/hooks/use-route-params";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientFormSchema,
  type ClientFormValues,
} from "../../models/forms/client-form.schema";
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from "../../hooks/use-client-queries";
import { CLIENT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import ClientBillingTab from "./client-billing-tab";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";

const { Title } = Typography;

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

interface GeneralInfoTabProps {
  id: string | undefined;
  isEdit: boolean;
}

function GeneralInfoTab({ id, isEdit }: GeneralInfoTabProps) {
  const navigate = useNavigate();
  const { data: selected } = useClient(isEdit ? id : undefined);
  const { mutateAsync: add, isPending: isCreating } = useCreateClient();
  const { mutateAsync: update, isPending: isUpdating } = useUpdateClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      code: "",
      name: "",
      status: "ACTIVE",
      email: "",
      phone: "",
      address: "",
      contactPerson: "",
    },
  });

  useEffect(() => {
    if (isEdit && selected) {
      reset({
        code: selected.code,
        name: selected.name,
        status: selected.status,
        email: selected.email,
        phone: selected.phone,
        address: selected.address,
        contactPerson: selected.contactPerson,
      });
    }
  }, [selected, isEdit, reset]);

  const onSubmit = async (values: ClientFormValues) => {
    // Client's PUT/POST endpoint round-trips the full record, not a partial patch -- this tab
    // never displays retirementDaysPerYear/uniformAllowance/uniformAllowanceBasis (edited
    // instead in Client Settings > Allowances), so it must carry whatever is already loaded
    // through unchanged rather than omit them, or saving General Info would silently wipe
    // Allowances.
    const allowanceFields = {
      retirementDaysPerYear: selected?.retirementDaysPerYear ?? null,
      uniformAllowance: selected?.uniformAllowance ?? null,
      uniformAllowanceBasis:
        selected?.uniformAllowanceBasis ?? ("TenureMonths" as const),
    };
    if (isEdit && id) await update({ id, ...values, ...allowanceFields });
    else await add({ ...values, ...allowanceFields });
    navigate({ to: "/setup/client" });
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="form-page-body"
    >
      <Form.Item
        label={CLIENT_LABEL.CODE}
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
        label={CLIENT_LABEL.NAME}
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
        label={CLIENT_LABEL.STATUS}
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
        label={CLIENT_LABEL.PHONE}
        validateStatus={errors.phone ? "error" : ""}
        help={errors.phone?.message}
      >
        <Controller
          name="phone"
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
        label={CLIENT_LABEL.ADDRESS}
        validateStatus={errors.address ? "error" : ""}
        help={errors.address?.message}
      >
        <Controller
          name="address"
          control={control}
          render={({ field }) => <Input.TextArea {...field} rows={2} />}
        />
      </Form.Item>

      <div className="form-action-footer">
        <Space className="form-action-footer-row">
          <Button onClick={() => navigate({ to: "/setup/client" })}>
            {NAVIGATION_BUTTON_LABEL.BACK}
          </Button>
          <PermissionGate
            permission={
              isEdit ? "Workforce Setup:Edit" : "Workforce Setup:Create"
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
  );
}

export default function ClientDetail() {
  const { id } = useRouteParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              {isEdit ? CLIENT_LABEL.EDIT_TITLE : CLIENT_LABEL.CREATE_TITLE}
            </Title>
            <p className="page-toolbar-subtitle">
              Configure client account details for assignment and billing.
            </p>
          </div>
          <Space>
            <Tag color={isEdit ? "processing" : "success"}>
              {isEdit ? "Editing" : "New Record"}
            </Tag>
            <Button onClick={() => navigate({ to: "/setup/client" })}>
              {NAVIGATION_BUTTON_LABEL.BACK}
            </Button>
          </Space>
        </div>
      </div>

      <Tabs
        type="card"
        items={[
          {
            key: "general",
            label: CLIENT_LABEL.TAB_GENERAL,
            forceRender: true,
            children: <GeneralInfoTab id={id} isEdit={isEdit} />,
          },
          {
            key: "billing",
            label: CLIENT_LABEL.TAB_BILLING,
            disabled: !isEdit,
            forceRender: true,
            children: isEdit && id ? <ClientBillingTab clientId={id} /> : null,
          },
        ]}
      />
    </div>
  );
}

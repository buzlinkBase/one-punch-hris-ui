import { useEffect, useMemo, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Tag,
  Tabs,
  message,
} from "antd";
import { BankOutlined } from "@ant-design/icons";
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
  useUploadClientLogo,
  useRemoveClientLogo,
} from "../../hooks/use-client-queries";
import { useOperationAreas } from "@/app/modules/setup/operation-area/hooks/use-operation-area-queries";
import { ImageUpload } from "@/shared/components/image-upload/image-upload";
import { authStorage } from "@/core/auth/auth-storage";
import { CLIENT_LABEL } from "../../constants/label.const";
import { NAVIGATION_BUTTON_LABEL } from "@/shared/constants/navigation.const";
import ClientBillingTab from "./client-billing-tab";
import { EmployeeSelect } from "@/shared/components/employee-select/employee-select";
import { PermissionGate } from "@/shared/components/permission-gate/permission-gate";
import { useUnsavedChangesGuard } from "@/shared/hooks/use-unsaved-changes-guard";

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
  const { mutateAsync: uploadLogo } = useUploadClientLogo();
  const { mutateAsync: removeLogo } = useRemoveClientLogo();
  const { data: areas = [], isLoading: areasLoading } = useOperationAreas();
  // A site belongs to one client, so only offer the untagged ones and this client's own.
  const areaOptions = useMemo(
    () =>
      areas
        .filter((a) => !a.clientId || a.clientId === id)
        .map((a) => ({ value: a.id, label: `${a.code} - ${a.name}` })),
    [areas, id],
  );
  // A new client's logo waits here until the record exists.
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);
  // Local override of the saved logo ("" = removed); undefined shows what the server has.
  const [logoPreview, setLogoPreview] = useState<string | undefined>();
  // Same gate as the logo endpoint: anyone who may edit -- or, while creating, add -- clients.
  const canEditLogo = authStorage.hasAnyPermission(
    "Workforce Setup:Edit",
    ...(isEdit ? [] : ["Workforce Setup:Create"]),
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
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
      headEmployeeId: null,
      areaIds: [],
    },
  });
  const { allowNavigation } = useUnsavedChangesGuard(isDirty);

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
        headEmployeeId: selected.headEmployeeId ?? null,
        areaIds: selected.areaIds ?? [],
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
    if (isEdit && id) {
      await update({ id, ...values, ...allowanceFields });
    } else {
      const created = await add({ ...values, ...allowanceFields });
      if (pendingLogo && created.id) {
        try {
          await uploadLogo({ id: created.id, file: pendingLogo });
        } catch {
          message.warning(
            "The client was saved, but the logo couldn't be uploaded. Open the client to try again.",
          );
        }
      }
    }
    allowNavigation();
    navigate({ to: "/setup/client" });
  };

  return (
    <Form
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="form-page-body"
    >
      {/* Saved on its own, right away; for a new client it's held and uploaded once the
          record exists (see onSubmit). */}
      <Form.Item label={CLIENT_LABEL.LOGO}>
        <ImageUpload
          crop="logo"
          label="logo"
          shape="square"
          value={logoPreview ?? selected?.logoUrl ?? undefined}
          placeholder={<BankOutlined />}
          disabled={!canEditLogo}
          onUpload={async (file) => {
            if (isEdit && id) {
              setLogoPreview(await uploadLogo({ id, file }));
            } else {
              setPendingLogo(file);
              setLogoPreview(URL.createObjectURL(file));
            }
          }}
          onRemove={async () => {
            if (isEdit && id) await removeLogo(id);
            else setPendingLogo(null);
            setLogoPreview("");
          }}
        />
      </Form.Item>

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
        label="Client Head"
        extra="Used by approval workflows that route to the applicant's client head."
      >
        <Controller
          name="headEmployeeId"
          control={control}
          render={({ field }) => (
            <EmployeeSelect
              value={field.value}
              onChange={field.onChange}
              placeholder="Select who heads this client's account"
            />
          )}
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

      <Form.Item
        label={CLIENT_LABEL.AREAS}
        extra={CLIENT_LABEL.AREAS_HELP}
        validateStatus={errors.areaIds ? "error" : ""}
        help={errors.areaIds?.message}
      >
        <Controller
          name="areaIds"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              mode="multiple"
              allowClear
              showSearch
              optionFilterProp="label"
              loading={areasLoading}
              options={areaOptions}
              placeholder={CLIENT_LABEL.AREAS_PLACEHOLDER}
            />
          )}
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

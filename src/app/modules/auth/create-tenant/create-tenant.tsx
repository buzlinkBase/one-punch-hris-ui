import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Collapse,
  Form,
  Input,
  Button,
  Select,
  Typography,
  notification,
} from "antd";
import { ArrowLeftOutlined, BankOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTenantFormSchema,
  type CreateTenantFormValues,
} from "./create-tenant-form.schema";
import {
  useCreateTenantMutation,
  useFetchTenantCreationStatus,
} from "@/app/modules/auth/login/hooks/use-auth-mutations";
import { authStorage } from "@/core/auth/auth-storage";
import { tenantHub } from "@/core/signalr/tenant-hub.connection";
import { TENANT_FAILED_STATUSES } from "@/core/signalr/tenant-hub.types";
import type { CreateTenantRequest } from "@/app/modules/auth/login/models/api/request/create-tenant-request.model";
import { COMPANY_POLICY_LABEL } from "@/app/modules/setup/company-policy/constants/label.const";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";
import { CompanyClassificationFields } from "@/shared/components/company-classification-fields/company-classification-fields";
import {
  ACQUISITION_OTHER_SOURCE,
  ACQUISITION_SOURCE_OPTIONS,
  CLASSIFICATION_LABEL,
} from "@/shared/industry/constants/classification.const";

const { Title, Text } = Typography;

// Picked from dropdowns (the classification section below) rather than typed.
const CLASSIFICATION_FIELDS = [
  "industryCode",
  "subIndustryCode",
  "businessType",
  "companySize",
  "acquisitionSource",
  "acquisitionSourceOther",
] as const;

type OptionalFieldName = Exclude<
  keyof CreateTenantFormValues,
  "tenantName" | (typeof CLASSIFICATION_FIELDS)[number]
>;

interface OptionalField {
  name: OptionalFieldName;
  label: string;
  placeholder?: string;
  wide?: boolean;
}

const L = COMPANY_POLICY_LABEL;

const OPTIONAL_SECTIONS: {
  key: string;
  title: string;
  fields: OptionalField[];
}[] = [
  {
    key: "details",
    title: "Company details",
    fields: [
      { name: "tin", label: L.TIN, placeholder: "e.g. 000-000-000-000" },
      { name: "rdoCode", label: L.RDO_CODE, placeholder: "e.g. 044" },
      {
        name: "address",
        label: L.ADDRESS,
        placeholder: "Company address",
        wide: true,
      },
      { name: "contact", label: L.CONTACT, placeholder: "Contact number" },
      { name: "email", label: L.EMAIL, placeholder: "company@example.com" },
    ],
  },
  {
    key: "government",
    title: "Government registration",
    fields: [
      { name: "sssNumber", label: L.SSS_NUMBER },
      { name: "philHealthNumber", label: L.PHILHEALTH_NUMBER },
      { name: "pagIbigNumber", label: L.PAGIBIG_NUMBER },
      {
        name: "authorizedSignatoryName",
        label: L.AUTHORIZED_SIGNATORY_NAME,
      },
      {
        name: "authorizedSignatoryTitle",
        label: L.AUTHORIZED_SIGNATORY_TITLE,
      },
    ],
  },
];

// Blank optional fields are dropped so the server only receives what the user actually entered.
const toRequest = (values: CreateTenantFormValues): CreateTenantRequest => {
  const request: CreateTenantRequest = {
    tenantName: values.tenantName.trim(),
  };
  for (const section of OPTIONAL_SECTIONS) {
    for (const { name } of section.fields) {
      const value = values[name]?.trim();
      if (value) request[name] = value;
    }
  }
  for (const name of CLASSIFICATION_FIELDS) {
    const value = values[name]?.trim();
    if (value) request[name] = value;
  }
  // The free-text answer only means something alongside "Other".
  if (request.acquisitionSource !== ACQUISITION_OTHER_SOURCE) {
    delete request.acquisitionSourceOther;
  }
  return request;
};

export default function CreateTenant() {
  const navigate = useNavigate();
  // A tenant stuck in "Provisioning" isn't a dashboard the user can actually go back to yet --
  // only count tenants that have actually finished setup, so a dormant/in-flight request left
  // over from an interrupted creation doesn't wrongly make this look like a "New Company"
  // (rather than first-time "Create Your Company") screen with a Back-to-dashboard link
  // that leads nowhere useful.
  const usableTenants = authStorage
    .getTenants()
    .filter((t) => t.state !== "Provisioning");
  const hasExistingTenants = usableTenants.length > 0;
  const [provisioning, setProvisioning] = useState(false);
  const { mutateAsync: createTenant } = useCreateTenantMutation();
  const fetchCreationStatus = useFetchTenantCreationStatus();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantFormValues>({
    resolver: zodResolver(createTenantFormSchema),
    defaultValues: { tenantName: "" },
  });
  const [
    industryCode,
    subIndustryCode,
    businessType,
    companySize,
    acquisitionSource,
  ] = useWatch({
    control,
    name: [
      "industryCode",
      "subIndustryCode",
      "businessType",
      "companySize",
      "acquisitionSource",
    ],
  });

  // Shared tail of both a fresh submission and resuming an interrupted one: wait for
  // provisioning to finish, reconcile the stored tenant state, then enter the company.
  const waitAndFinalize = useCallback(
    async (tenantId: string, tenantName: string) => {
      setProvisioning(true);
      const { ready, timedOut } = await tenantHub.waitForProvisioning(tenantId);

      let finalReady = ready;

      if (!ready && timedOut) {
        const status = await fetchCreationStatus(tenantId).catch(() => null);

        if (
          status &&
          TENANT_FAILED_STATUSES.includes(status.status.toLowerCase())
        ) {
          setProvisioning(false);
          notification.error({
            message: "Setup failed",
            description: `We couldn't finish setting up "${tenantName}". Please try again.`,
            placement: "topRight",
          });
          return;
        }

        finalReady = status?.isReady ?? false;

        if (!finalReady) {
          notification.info({
            message: "Still setting up",
            description:
              "Your company is finishing setup in the background — we'll notify you once it's ready.",
            placement: "topRight",
          });
        }
      }

      // Update the stored tenant entry's state now that TenantCreated fired.
      // Do NOT call selectTenant here — membership is not yet "Active" at this
      // point in provisioning, so that endpoint returns 403. The session token
      // from createTenant already has tenantId embedded; the menu-lock + polling
      // in use-tenant-hub will handle unlocking once HrDb is ready.
      const userAfterProvisioning = authStorage.getUser()!;
      const updatedTenants = (userAfterProvisioning.tenants ?? []).map((t) =>
        t.tenantId === tenantId
          ? { ...t, state: finalReady ? "Created" : "Provisioning" }
          : t,
      );
      authStorage.save(authStorage.getToken()!, {
        ...userAfterProvisioning,
        tenants: updatedTenants,
      });

      setProvisioning(false);
      window.location.assign("/dashboard");
    },
    [fetchCreationStatus],
  );

  useEffect(() => {
    if (!authStorage.getToken()) {
      navigate({ to: "/login", replace: true });
      return;
    }

    // A refresh mid-setup used to drop the in-flight request and land back on this blank form
    // (the browser never left /create-tenant, since that only happens after provisioning
    // finishes) -- resume waiting on it instead of making the user retype the name and
    // resubmit. Matched against the session's current tenantId (set by onSubmit's save() right
    // before the wait) so this doesn't also fire for some unrelated stale Provisioning entry
    // still sitting in the cached tenant list from a genuinely abandoned attempt.
    const currentTenantId = authStorage.getTenantId();
    const stuckProvisioning = authStorage
      .getTenants()
      .find(
        (t) => t.state === "Provisioning" && t.tenantId === currentTenantId,
      );
    if (stuckProvisioning) {
      // Deferred a tick so the setProvisioning(true) inside waitAndFinalize doesn't run
      // synchronously within the effect body (react-hooks/set-state-in-effect).
      queueMicrotask(() => {
        void waitAndFinalize(
          stuckProvisioning.tenantId,
          stuckProvisioning.name,
        );
      });
    }
  }, [navigate, waitAndFinalize]);

  const onSubmit = async (values: CreateTenantFormValues) => {
    try {
      const result = await createTenant(toRequest(values));
      const claims = authStorage.getTenantClaims(result.accessToken);
      const currentUser = authStorage.getUser()!;

      // The new tenant's ID — prefer the JWT claim (most authoritative), then
      // fall back to the first entry in result.tenants that isn't already known.
      const existingIds = new Set(
        (currentUser.tenants ?? []).map((t) => t.tenantId),
      );
      const newTenantFromResult = result.tenants.find(
        (t) => !existingIds.has(t.tenantId),
      );
      const tenantId =
        claims.tenantId ??
        newTenantFromResult?.tenantId ??
        result.tenants[0]?.tenantId ??
        null;

      // Build a TenantSummary for the new company so it always appears in the
      // sidebar dropdown, even if the backend omits still-provisioning tenants
      // from the returned list.
      const newEntry: TenantSummary = newTenantFromResult ?? {
        tenantId: tenantId ?? "",
        name: values.tenantName,
        state: "Provisioning",
        roles: currentUser.roles ?? ["Admin"],
        permissions: currentUser.permissions ?? [],
        hrDbStatus: null,
        hrDbReady: false,
      };

      // Merge: existing tenants + new one (deduplicated by tenantId)
      const mergedTenants: TenantSummary[] = tenantId
        ? [
            ...(currentUser.tenants ?? []).filter(
              (t) => t.tenantId !== tenantId,
            ),
            newEntry,
          ]
        : ((result.tenants.length > 0 ? result.tenants : currentUser.tenants) ??
          []);

      authStorage.save(result.accessToken, {
        ...currentUser,
        roles: result.roles,
        permissions: result.permissions,
        tenants: mergedTenants,
        tenantId,
        tenantName: claims.tenantName ?? values.tenantName,
      });

      if (tenantId) {
        await waitAndFinalize(tenantId, values.tenantName);
      } else {
        window.location.assign("/dashboard");
      }
    } catch {
      setProvisioning(false);
      notification.error({
        message: "Couldn't create company",
        description: "Failed to create company. Please try again.",
        placement: "topRight",
      });
    }
  };

  const sectionItems = OPTIONAL_SECTIONS.map((section) => ({
    key: section.key,
    label: (
      <span>
        {section.title} <Text type="secondary">(Optional)</Text>
      </span>
    ),
    forceRender: true,
    children: (
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        {section.fields.map((f) => (
          <Form.Item
            key={f.name}
            label={
              <span>
                {f.label} <Text type="secondary">(Optional)</Text>
              </span>
            }
            validateStatus={errors[f.name] ? "error" : ""}
            help={errors[f.name]?.message}
            className={f.wide ? "sm:col-span-2" : undefined}
          >
            <Controller
              name={f.name}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={f.placeholder}
                  disabled={provisioning}
                />
              )}
            />
          </Form.Item>
        ))}
      </div>
    ),
  }));

  const classificationItem = {
    key: "classification",
    label: (
      <span>
        {CLASSIFICATION_LABEL.SECTION_CLASSIFICATION}{" "}
        <Text type="secondary">(Optional)</Text>
      </span>
    ),
    forceRender: true,
    children: (
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <CompanyClassificationFields
          value={{ industryCode, subIndustryCode, businessType, companySize }}
          onChange={(next) => {
            setValue("industryCode", next.industryCode ?? "");
            setValue("subIndustryCode", next.subIndustryCode ?? "");
            setValue("businessType", next.businessType ?? "");
            setValue("companySize", next.companySize ?? "");
          }}
          disabled={provisioning}
        />
        <Form.Item
          label={CLASSIFICATION_LABEL.HOW_DID_YOU_HEAR}
          className="sm:col-span-2"
        >
          <Select
            allowClear
            disabled={provisioning}
            placeholder="Select one"
            options={ACQUISITION_SOURCE_OPTIONS}
            value={acquisitionSource || undefined}
            onChange={(source) => {
              setValue("acquisitionSource", source ?? "");
              if (source !== ACQUISITION_OTHER_SOURCE) {
                setValue("acquisitionSourceOther", "");
              }
            }}
          />
        </Form.Item>
        {acquisitionSource === ACQUISITION_OTHER_SOURCE && (
          <Form.Item
            label={CLASSIFICATION_LABEL.HOW_DID_YOU_HEAR_OTHER}
            className="sm:col-span-2"
          >
            <Controller
              name="acquisitionSourceOther"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ""}
                  maxLength={200}
                  disabled={provisioning}
                />
              )}
            />
          </Form.Item>
        )}
      </div>
    ),
  };

  return (
    <Card className="auth-card login-card border-0">
      {hasExistingTenants && (
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate({ to: "/dashboard" })}
          style={{ marginBottom: 12, padding: 0, color: "#6b7280" }}
        >
          Back to dashboard
        </Button>
      )}
      <div className="login-header">
        <div
          className="login-icon-placeholder"
          aria-label="App icon placeholder"
        >
          <BankOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          {hasExistingTenants ? "New Company" : "Create Your Company"}
        </Title>
        <Text className="login-subtitle">
          {provisioning
            ? "Setting up your company — this only takes a moment."
            : hasExistingTenants
              ? "Set up a new company to manage a separate organization."
              : "You don't have an organization yet. Create one to get started."}
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label={
            <span>
              Company Name <Text type="secondary">(Required)</Text>
            </span>
          }
          required
          validateStatus={errors.tenantName ? "error" : ""}
          help={errors.tenantName?.message}
          className="login-form-item"
        >
          <Controller
            name="tenantName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Enter company name"
                size="large"
                disabled={provisioning}
              />
            )}
          />
        </Form.Item>

        <Text type="secondary" className="mb-3 block text-xs">
          Only the company name is required. Fill in what you have now — you can
          add or change the rest anytime in Company Settings.
        </Text>

        <Collapse
          ghost
          className="mb-4"
          items={[
            ...sectionItems.slice(0, 1),
            classificationItem,
            ...sectionItems.slice(1),
          ]}
        />

        <Form.Item className="mb-0!">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || provisioning}
            disabled={provisioning}
            block
            size="large"
          >
            {provisioning
              ? "Setting up company…"
              : hasExistingTenants
                ? "Create Company"
                : "Create Company"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

import { useEffect, useState } from "react";
import { Card, Form, Input, Button, Typography, notification } from "antd";
import { ArrowLeftOutlined, BankOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTenantFormSchema,
  type CreateTenantFormValues,
} from "./create-tenant-form.schema";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { authStorage } from "@/core/auth/auth-storage";
import { tenantHub } from "@/core/signalr/tenant-hub.connection";
import { TENANT_FAILED_STATUSES } from "@/core/signalr/tenant-hub.types";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

const { Title, Text } = Typography;

export default function CreateTenant() {
  const navigate = useNavigate();
  const hasExistingTenants = (authStorage.getTenants().length ?? 0) > 0;
  const [provisioning, setProvisioning] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantFormValues>({
    resolver: zodResolver(createTenantFormSchema),
    defaultValues: { tenantName: "" },
  });

  useEffect(() => {
    if (!authStorage.getToken()) {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate]);

  const onSubmit = async (values: CreateTenantFormValues) => {
    try {
      const result = await authApi.createTenant(values);
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

      // Build a TenantSummary for the new workspace so it always appears in the
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
        setProvisioning(true);
        const { ready, timedOut } =
          await tenantHub.waitForProvisioning(tenantId);

        let finalReady = ready;

        if (!ready && timedOut) {
          const status = await authApi
            .getTenantCreationStatus(tenantId)
            .catch(() => null);

          if (
            status &&
            TENANT_FAILED_STATUSES.includes(status.status.toLowerCase())
          ) {
            setProvisioning(false);
            notification.error({
              message: "Setup failed",
              description: `We couldn't finish setting up "${values.tenantName}". Please try again.`,
              placement: "topRight",
            });
            return;
          }

          finalReady = status?.isReady ?? false;

          if (!finalReady) {
            notification.info({
              message: "Still setting up",
              description:
                "Your workspace is finishing setup in the background — we'll notify you once it's ready.",
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
      }

      window.location.assign("/dashboard");
    } catch {
      setProvisioning(false);
      notification.error({
        message: "Creation failed",
        description: "Failed to create workspace. Please try again.",
        placement: "topRight",
      });
    }
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
          {hasExistingTenants ? "New Workspace" : "Create Your Organization"}
        </Title>
        <Text className="login-subtitle">
          {provisioning
            ? "Setting up your workspace — this only takes a moment."
            : hasExistingTenants
              ? "Set up a new workspace to manage a separate organization."
              : "You don't have an organization yet. Create one to get started."}
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Workspace Name"
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
                placeholder="Enter workspace name"
                size="large"
                disabled={provisioning}
              />
            )}
          />
        </Form.Item>

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
              ? "Setting up workspace…"
              : hasExistingTenants
                ? "Create Workspace"
                : "Create Organization"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

import { useEffect } from "react";
import { Card, Form, Input, Button, Typography, notification } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import {
  createTenantFormSchema,
  type CreateTenantFormValues,
} from "./create-tenant-form.schema";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { authStorage } from "@/core/auth/auth-storage";
import type { ApiResponse } from "@/shared/types/api-response.model";

const { Title, Text } = Typography;

export default function CreateTenant() {
  const navigate = useNavigate();

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
      const user = authStorage.getUser();
      authStorage.save(result.accessToken, {
        ...user!,
        tenants: result.tenants,
        tenantId: claims.tenantId ?? result.tenants[0]?.tenantId ?? null,
        tenantName: claims.tenantName,
      });
      navigate({ to: "/dashboard" });
    } catch (err) {
      const description = axios.isAxiosError(err)
        ? ((err.response?.data as ApiResponse<{ errorMessage: string }>)?.data
            ?.errorMessage ?? "Failed to create organization. Please try again.")
        : "An unexpected error occurred.";
      notification.error({
        message: "Creation failed",
        description,
        placement: "topRight",
      });
    }
  };

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div className="login-icon-placeholder" aria-label="App icon placeholder">
          <BankOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Create Your Organization
        </Title>
        <Text className="login-subtitle">
          You don't have an organization yet. Create one to get started.
        </Text>
      </div>

      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Form.Item
          label="Organization Name"
          validateStatus={errors.tenantName ? "error" : ""}
          help={errors.tenantName?.message}
          className="login-form-item"
        >
          <Controller
            name="tenantName"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter organization name" size="large" />
            )}
          />
        </Form.Item>

        <Form.Item className="!mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
            size="large"
          >
            Create Organization
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

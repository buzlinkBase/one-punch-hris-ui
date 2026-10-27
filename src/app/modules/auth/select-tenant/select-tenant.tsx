import { useEffect, useState } from "react";
import { Card, Typography, List, Button, notification } from "antd";
import { BankOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import { useSelectTenantMutation } from "@/app/modules/auth/login/hooks/use-auth-mutations";
import { authStorage } from "@/core/auth/auth-storage";
import { authErrorMessage } from "@/core/auth/auth-error-message";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";

const { Title, Text } = Typography;

export default function SelectTenant() {
  const navigate = useNavigate();
  const [tenants] = useState<TenantSummary[]>(() => authStorage.getTenants());
  const [loadingTenant, setLoadingTenant] = useState<string | null>(null);
  const { mutateAsync: selectTenant } = useSelectTenantMutation();

  useEffect(() => {
    if (!authStorage.getToken() || tenants.length === 0) {
      navigate({ to: "/login", replace: true });
    }
  }, [navigate, tenants]);

  const handleSelect = async (tenantId: string) => {
    setLoadingTenant(tenantId);
    try {
      const result = await selectTenant(tenantId);
      const claims = authStorage.getTenantClaims(result.accessToken);
      const user = authStorage.getUser();
      authStorage.save(result.accessToken, {
        ...user!,
        roles: result.roles,
        permissions: result.permissions,
        tenantId: claims.tenantId ?? tenantId,
        tenantName: claims.tenantName,
        tenants: result.tenants ?? user?.tenants,
      });
      navigate({ to: "/dashboard" });
    } catch (err) {
      const description = authErrorMessage(
        err,
        "Couldn't switch to this company. Please try again.",
      );
      notification.error({
        message: "Couldn't switch company",
        description,
        placement: "topRight",
      });
    } finally {
      setLoadingTenant(null);
    }
  };

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div
          className="login-icon-placeholder"
          aria-label="App icon placeholder"
        >
          <BankOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Select a Company
        </Title>
        <Text className="login-subtitle">
          Your account has access to multiple company. Choose one to continue.
        </Text>
      </div>

      <List
        dataSource={tenants}
        renderItem={(tenant) => (
          <List.Item>
            <Button
              block
              size="large"
              icon={<BankOutlined />}
              loading={loadingTenant === tenant.tenantId}
              disabled={
                loadingTenant !== null && loadingTenant !== tenant.tenantId
              }
              onClick={() => handleSelect(tenant.tenantId)}
              style={{ justifyContent: "flex-start" }}
            >
              {tenant.name}
            </Button>
          </List.Item>
        )}
      />
    </Card>
  );
}

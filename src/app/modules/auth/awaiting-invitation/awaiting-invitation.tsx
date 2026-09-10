import { useEffect, useState } from "react";
import { Card, Typography, Button, Space, notification } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { authStorage } from "@/core/auth/auth-storage";
import type { ApiResponse } from "@/shared/types/api-response.model";
import type { InvitationResponse } from "@/app/modules/auth/login/models/api/response/invitation-response.model";

const { Title, Text } = Typography;

export default function AwaitingInvitation() {
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<InvitationResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const [accepting, setAccepting] = useState(false);

  const checkInvitation = async () => {
    try {
      const result = await authApi.getPendingInvitation();
      if (result) {
        setInvitation(result);
      } else {
        notification.info({
          message: "Invitation resolved",
          description: "Please sign in again to refresh your access.",
          placement: "topRight",
        });
        authStorage.clear();
        navigate({ to: "/login", replace: true });
      }
    } finally {
      setChecking(false);
    }
  };

  const handleCheckAgain = () => {
    setChecking(true);
    checkInvitation();
  };

  const handleAccept = async () => {
    if (!invitation) return;

    setAccepting(true);
    try {
      const result = await authApi.acceptInvitation({
        token: invitation.token,
      });
      const claims = authStorage.getTenantClaims(result.accessToken);
      const user = authStorage.getUser();
      const resultIds = new Set(result.tenants.map((t) => t.tenantId));
      const preserved = (user?.tenants ?? []).filter(
        (t) => !resultIds.has(t.tenantId),
      );
      authStorage.save(result.accessToken, {
        ...user!,
        roles: result.roles,
        permissions: result.permissions,
        tenants: [...result.tenants, ...preserved],
        tenantId: claims.tenantId ?? result.tenants[0]?.tenantId ?? null,
        tenantName: claims.tenantName,
      });
      window.location.assign("/dashboard");
    } catch (err) {
      const description = axios.isAxiosError(err)
        ? ((err.response?.data as ApiResponse<{ errorMessage: string }>)?.data
            ?.errorMessage ?? "Failed to accept invitation. Please try again.")
        : "An unexpected error occurred.";
      notification.error({
        message: "Acceptance failed",
        description,
        placement: "topRight",
      });
    } finally {
      setAccepting(false);
    }
  };

  useEffect(() => {
    if (!authStorage.getToken()) {
      navigate({ to: "/login", replace: true });
      return;
    }
    checkInvitation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div
          className="login-icon-placeholder"
          aria-label="App icon placeholder"
        >
          <ClockCircleOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Awaiting Confirmation
        </Title>
        <Text className="login-subtitle">
          {invitation
            ? `You've been invited to join ${invitation.tenantName}. Accept the invitation to continue.`
            : "Checking your invitation status..."}
        </Text>
      </div>

      <Space direction="vertical" style={{ width: "100%" }}>
        <Button
          type="primary"
          block
          size="large"
          loading={accepting}
          disabled={!invitation}
          onClick={handleAccept}
        >
          Accept Invitation
        </Button>
        <Button
          block
          size="large"
          loading={checking}
          onClick={handleCheckAgain}
        >
          Check again
        </Button>
      </Space>
    </Card>
  );
}

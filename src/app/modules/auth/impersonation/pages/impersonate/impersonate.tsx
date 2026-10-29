import { useEffect, useState } from "react";
import { Button, Card, Spin, Typography } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";
import { impersonationApi } from "../../services/impersonation.api";
import { startImpersonatedSession } from "@/core/auth/impersonation";
import { resolveTenantDestination } from "@/core/auth/tenant-routing";

const { Title, Text } = Typography;

// The one-time code can be redeemed once, and is taken out of the address bar as soon as it is read.
// React runs effects twice in development, so the code and the exchange are kept at module level and
// both runs share them: the second run would otherwise find no code, and must not redeem it again.
const code = new URLSearchParams(window.location.search).get("code");
let exchange: Promise<void> | null = null;

function signInWithCode(code: string): Promise<void> {
  exchange ??= impersonationApi.exchange(code).then(startImpersonatedSession);
  return exchange;
}

/**
 * Where the support console sends an operator: redeems the one-time code from the link, becomes the
 * impersonated user in this tab only, drops the code from the address bar and opens the app.
 */
export default function Impersonate() {
  const [failed, setFailed] = useState(!code);

  useEffect(() => {
    if (!code) return;

    // The code is single use: take it out of the address bar and history straight away.
    window.history.replaceState(null, "", window.location.pathname);

    signInWithCode(code)
      .then(async () => {
        const destination = await resolveTenantDestination();
        window.location.replace(destination ?? "/dashboard");
      })
      .catch(() => setFailed(true));
  }, []);

  if (!failed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spin size="large" tip="Signing in…" />
      </div>
    );
  }

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div className="login-icon-placeholder" aria-label="Sign-in failed">
          <CloseCircleOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          This sign-in link is no longer valid
        </Title>
        <Text className="login-subtitle">
          The link works once and only for a minute. Start again from the
          support console.
        </Text>
      </div>
      <div className="text-center">
        <Button type="primary" size="large" onClick={() => window.close()}>
          Close this tab
        </Button>
      </div>
    </Card>
  );
}

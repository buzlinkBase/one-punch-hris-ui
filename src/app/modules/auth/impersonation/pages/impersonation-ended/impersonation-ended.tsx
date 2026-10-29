import { Button, Card, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/** Shown in an impersonation tab once its session is over; nothing of the session is left in the browser. */
export default function ImpersonationEnded() {
  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div className="login-icon-placeholder" aria-label="Session ended">
          <CheckCircleOutlined />
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          Impersonation session ended
        </Title>
        <Text className="login-subtitle">
          You are no longer signed in as this user. You can close this tab.
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

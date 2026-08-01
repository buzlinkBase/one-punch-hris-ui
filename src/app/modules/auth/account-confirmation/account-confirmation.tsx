import { Card, Typography, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Link, useLocation } from "@tanstack/react-router";

const { Title, Text } = Typography;

export default function AccountConfirmation() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isError = location.pathname.endsWith("/error");

  const name = params.get("name");
  const email = params.get("email");
  const reason = params.get("reason");

  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        <div
          className="login-icon-placeholder"
          aria-label="App icon placeholder"
        >
          {isError ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
        </div>
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          {isError ? "Confirmation failed" : "Account confirmed"}
        </Title>
        <Text className="login-subtitle">
          {isError
            ? (reason ??
              "This confirmation link is invalid or has expired. Please try registering again.")
            : `${name ? `${name}, y` : "Y"}our account${email ? ` (${email})` : ""} is confirmed. You can now sign in.`}
        </Text>
      </div>
      <div style={{ textAlign: "center" }}>
        <Link to={isError ? "/register" : "/login"}>
          <Button type="primary" size="large">
            {isError ? "Back to registration" : "Sign in"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}

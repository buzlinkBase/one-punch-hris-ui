import type { ReactNode } from "react";
import { Card, Spin, Typography } from "antd";

const { Title, Text } = Typography;

interface InvitationStatusCardProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Renders the subtitle as an error message. */
  danger?: boolean;
  /** Shows a spinner under the header (in-flight states). */
  loading?: boolean;
  /** Actions (buttons/links) rendered below the header. */
  children?: ReactNode;
}

/** The one card layout every non-form accept-invitation state renders through. */
export default function InvitationStatusCard({
  icon,
  title,
  subtitle,
  danger = false,
  loading = false,
  children,
}: InvitationStatusCardProps) {
  return (
    <Card className="auth-card login-card border-0">
      <div className="login-header">
        {icon && (
          <div
            className="login-icon-placeholder"
            aria-label="App icon placeholder"
          >
            {icon}
          </div>
        )}
        <Text className="login-kicker">One Punch HRIS</Text>
        <Title level={3} className="login-title">
          {title}
        </Title>
        {subtitle && (
          <Text className="login-subtitle" type={danger ? "danger" : undefined}>
            {subtitle}
          </Text>
        )}
      </div>
      {loading && <Spin className="block mx-auto" />}
      {children}
    </Card>
  );
}

import { Button, Typography } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface Props {
  tenantName: string | null;
  failed: boolean;
}

export default function ProvisioningScreen({ tenantName, failed }: Props) {
  const workspace = tenantName ?? "your workspace";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 200px)",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Icon ring */}
      <div style={{ position: "relative", marginBottom: 32 }}>
        {/* Outer pulse ring — only shown while provisioning */}
        {!failed && (
          <>
            <div
              className="animate-ping"
              style={{
                position: "absolute",
                inset: -12,
                borderRadius: "50%",
                backgroundColor: "#1DA081",
                opacity: 0.15,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                backgroundColor: "#1DA081",
                opacity: 0.1,
              }}
            />
          </>
        )}

        {/* Centre icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: failed ? "#fff1f0" : "#e6f7f2",
            border: `2px solid ${failed ? "#ffa39e" : "#a7e3d0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {failed ? (
            <CloseCircleOutlined style={{ fontSize: 36, color: "#ff4d4f" }} />
          ) : (
            <LoadingOutlined style={{ fontSize: 36, color: "#1DA081" }} spin />
          )}
        </div>
      </div>

      {/* Headline */}
      <Title level={3} style={{ marginBottom: 8, marginTop: 0 }}>
        {failed ? "Workspace setup failed" : "Setting up your workspace"}
      </Title>

      {/* Sub-text */}
      <Text
        type="secondary"
        style={{
          fontSize: 15,
          maxWidth: 420,
          display: "block",
          lineHeight: 1.6,
        }}
      >
        {failed ? (
          <>
            We couldn&apos;t finish setting up <strong>{workspace}</strong>.
            Please try refreshing the page or contact support if the issue
            persists.
          </>
        ) : (
          <>
            We&apos;re provisioning resources for <strong>{workspace}</strong>.
            This usually takes a few minutes. The app will unlock automatically
            once it&apos;s ready — no need to refresh.
          </>
        )}
      </Text>

      {/* Steps */}
      {!failed && (
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 40,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { label: "Workspace created", done: true },
            { label: "Configuring HR database", done: false },
            { label: "Finalizing setup", done: false },
          ].map((step) => (
            <div
              key={step.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: step.done ? "#1DA081" : "#9ca3af",
              }}
            >
              {step.done ? (
                <CheckCircleOutlined style={{ color: "#1DA081" }} />
              ) : (
                <LoadingOutlined style={{ color: "#d1d5db" }} spin />
              )}
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Failed action */}
      {failed && (
        <Button
          icon={<ReloadOutlined />}
          style={{ marginTop: 24 }}
          onClick={() => window.location.reload()}
        >
          Refresh page
        </Button>
      )}

      {/* Quiet hint */}
      {!failed && (
        <Text
          type="secondary"
          style={{ fontSize: 12, marginTop: 32, opacity: 0.6 }}
        >
          You can safely leave this tab open — we&apos;ll notify you when
          it&apos;s done.
        </Text>
      )}
    </div>
  );
}

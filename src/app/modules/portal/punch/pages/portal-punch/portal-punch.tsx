import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Empty,
  List,
  Tag,
  Typography,
  message,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import {
  useMyPunch,
  useMyPunchStatus,
} from "../../../shared/hooks/use-my-employee-queries";
import {
  formatCountdown,
  parseWallClock,
  secondsUntilNextPunch,
} from "../../utils/punch-clock.util";
import { WriteGate } from "@/shared/components/write-gate/write-gate";

const { Title, Text } = Typography;

export default function PortalPunch() {
  const { data: status, isLoading } = useMyPunchStatus();
  const { mutateAsync: punch, isPending } = useMyPunch();

  // Re-render every second for the live clock and the countdown.
  const [nowMs, setNowMs] = useState(() => performance.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(performance.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Monotonic, so changing the device's clock can't move the displayed time or the countdown.
  const elapsedMs = status ? Math.max(0, nowMs - status.receivedAt) : 0;
  const serverNow = status
    ? parseWallClock(status.now).add(elapsedMs, "millisecond")
    : null;
  const waitSeconds = status
    ? secondsUntilNextPunch(status.nextAllowedAt, status.now, elapsedMs)
    : 0;

  const onPunch = async () => {
    try {
      await punch();
      message.success("Punch recorded.");
    } catch (error) {
      message.error(
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Unable to record your punch.",
      );
    }
  };

  return (
    <div className="content-page">
      <div className="page-toolbar">
        <div className="page-toolbar-row">
          <div>
            <Title level={4} className="mb-0!">
              Punch In / Out
            </Title>
            <p className="page-toolbar-subtitle">
              Record your time from here instead of the biometric device or the
              mobile app.
            </p>
          </div>
        </div>
      </div>

      <div className="form-page-body">
        <div className="flex flex-col gap-4 max-w-xl mx-auto">
          <Card loading={isLoading}>
            <div className="flex flex-col items-center gap-3 py-4">
              <Text type="secondary">
                {serverNow?.format("dddd, MMMM D, YYYY")} · Philippine Time
              </Text>
              <div className="text-5xl font-semibold tabular-nums">
                {serverNow?.format("HH:mm:ss") ?? "--:--:--"}
              </div>
              <WriteGate>
                <Button
                  type="primary"
                  size="large"
                  icon={<ClockCircleOutlined />}
                  className="w-full max-w-xs"
                  loading={isPending}
                  disabled={!status || waitSeconds > 0}
                  onClick={onPunch}
                >
                  {waitSeconds > 0
                    ? `Wait ${formatCountdown(waitSeconds)}`
                    : "Punch Now"}
                </Button>
              </WriteGate>
              {status && (
                <Text type="secondary" className="text-center text-sm">
                  {status.lastPunchAt
                    ? `Last punch: ${parseWallClock(status.lastPunchAt).format("MMM D, HH:mm:ss")}. `
                    : "No punch recorded yet. "}
                  You can punch again {status.cooldownMinutes} minute
                  {status.cooldownMinutes === 1 ? "" : "s"} after your last
                  punch.
                </Text>
              )}
            </div>
          </Card>

          <Alert
            type="info"
            showIcon
            message="Your punch is recorded using the server's Philippine Time (PHT). Your device's clock is never used."
          />

          <Card size="small" title="Today's punches" loading={isLoading}>
            {status && status.today.length > 0 ? (
              <List
                size="small"
                dataSource={status.today}
                renderItem={(entry) => (
                  <List.Item
                    extra={<Tag>{String(entry.source).toUpperCase()}</Tag>}
                  >
                    {parseWallClock(entry.at).format("HH:mm:ss")}
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No punches yet today"
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

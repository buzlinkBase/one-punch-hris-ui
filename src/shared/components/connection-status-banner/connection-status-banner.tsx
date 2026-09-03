import { useEffect, useState } from "react";
import { Alert, Button, Space } from "antd";
import {
  DisconnectOutlined,
  ReloadOutlined,
  CloudSyncOutlined,
} from "@ant-design/icons";
import { queryClient } from "@/core/query-client";
import { useConnectionStore } from "@/core/stores/connection.store";

// Auto-retry cadence while the server looks unreachable — quiet background refetches of
// whatever queries are currently on screen, so the banner clears itself the moment the
// server comes back without the user having to do anything.
const AUTO_RETRY_MS = 8000;

export function ConnectionStatusBanner() {
  const isOffline = useConnectionStore((s) => s.isOffline);
  const isServerUnreachable = useConnectionStore((s) => s.isServerUnreachable);
  const setOffline = useConnectionStore((s) => s.setOffline);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOffline]);

  const retry = async () => {
    setIsRetrying(true);
    try {
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setIsRetrying(false);
    }
  };

  // Only auto-retry the "server unreachable" case — if the browser itself is offline there's
  // no point hammering the API until the `online` event fires above.
  useEffect(() => {
    if (!isServerUnreachable || isOffline) return;
    const id = setInterval(() => {
      queryClient.refetchQueries({ type: "active" }).catch(() => {});
    }, AUTO_RETRY_MS);
    return () => clearInterval(id);
  }, [isServerUnreachable, isOffline]);

  if (!isOffline && !isServerUnreachable) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2000,
      }}
    >
      <Alert
        banner
        type={isOffline ? "error" : "warning"}
        icon={isOffline ? <DisconnectOutlined /> : <CloudSyncOutlined spin />}
        showIcon
        message={
          <Space size="middle" wrap style={{ width: "100%" }}>
            <span>
              {isOffline
                ? "You're offline — check your internet connection."
                : "Can't reach the server. We'll keep retrying automatically."}
            </span>
            {!isOffline && (
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={retry}
                loading={isRetrying}
              >
                Retry now
              </Button>
            )}
          </Space>
        }
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Button, Result, Spin } from "antd";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  isChunkLoadError,
  reloadForNewVersion,
} from "@/core/app-update/chunk-load-recovery";

/**
 * The router's error screen. A page that failed to load because a new version was deployed
 * reloads itself once; anything else gets a friendly message with a way out, not raw error text.
 */
export function RouteErrorFallback({ error }: ErrorComponentProps) {
  const [reloading] = useState(
    () => isChunkLoadError(error) && reloadForNewVersion(),
  );

  useEffect(() => {
    if (!reloading) console.error(error);
  }, [error, reloading]);

  if (reloading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Spin size="large" />
        <p className="text-(--ant-color-text-secondary)">
          Updating to the latest version…
        </p>
      </div>
    );
  }

  return (
    <Result
      status="warning"
      title="Something went wrong"
      subTitle={
        isChunkLoadError(error)
          ? "This page couldn't be loaded. Reload to get the latest version of the app."
          : "This page ran into a problem. Reload the page, or go back to the dashboard."
      }
      extra={[
        <Button
          key="reload"
          type="primary"
          onClick={() => window.location.reload()}
        >
          Reload page
        </Button>,
        <Button key="home" onClick={() => window.location.assign("/dashboard")}>
          Go to Dashboard
        </Button>,
      ]}
    />
  );
}

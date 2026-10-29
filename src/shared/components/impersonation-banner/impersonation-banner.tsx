import { useEffect, useState } from "react";
import { Button } from "antd";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import {
  leaveImpersonation,
  stopImpersonation,
} from "@/core/auth/impersonation";

const BODY_CLASS = "impersonating";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Fixed, non-dismissible bar across the top of an impersonation session: who is being impersonated,
 * who is behind it, how long is left, and the Stop button. Renders nothing for a normal session.
 * The session cannot be refreshed, so when the clock runs out it ends here.
 */
export function ImpersonationBanner() {
  const user = useAuthUser();
  const info = authStorage.getImpersonation();
  const [now, setNow] = useState(() => Date.now());
  const [stopping, setStopping] = useState(false);

  const active = info !== null;
  const expiresAtMs = info ? new Date(info.expiresAt).getTime() : 0;
  const company = user?.tenantName ? ` (${user.tenantName})` : "";

  useEffect(() => {
    if (!active) return;
    document.body.classList.add(BODY_CLASS);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      document.body.classList.remove(BODY_CLASS);
      window.clearInterval(timer);
    };
  }, [active]);

  useEffect(() => {
    if (active && now >= expiresAtMs) leaveImpersonation();
  }, [active, now, expiresAtMs]);

  if (!info) return null;

  const handleStop = async () => {
    setStopping(true);
    await stopImpersonation();
  };

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-[2000] flex h-10 items-center justify-between gap-3 bg-red-600 px-4 text-sm font-medium text-white shadow-md"
    >
      <span className="flex min-w-0 items-center gap-2">
        <SafetyCertificateOutlined />
        <span className="truncate">
          {`Support session: you are ${user?.name ?? "this user"}${company}, signed in by ${info.operatorEmail}. Everything you do is recorded.`}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className="tabular-nums">
          {formatRemaining(expiresAtMs - now)} left
        </span>
        <Button size="small" loading={stopping} onClick={handleStop}>
          Stop impersonating
        </Button>
      </span>
    </div>
  );
}

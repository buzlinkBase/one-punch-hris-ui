import { useEffect } from "react";
import { notification } from "antd";
import { setNotify } from "@/shared/utils/notify";

export function NotificationProvider() {
  const [api, contextHolder] = notification.useNotification();

  useEffect(() => {
    setNotify(api);
  }, [api]);

  return <>{contextHolder}</>;
}

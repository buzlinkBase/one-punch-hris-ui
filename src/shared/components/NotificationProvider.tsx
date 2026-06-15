import { notification } from "antd";
import type { NotificationInstance } from "antd/es/notification/interface";

let _notify: NotificationInstance | null = null;

export function getNotify(): NotificationInstance {
  if (!_notify) throw new Error("NotificationProvider is not mounted.");
  return _notify;
}

export function NotificationProvider() {
  const [api, contextHolder] = notification.useNotification();
  _notify = api;
  return <>{contextHolder}</>;
}

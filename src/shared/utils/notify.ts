import type { NotificationInstance } from "antd/es/notification/interface";

let _notify: NotificationInstance | null = null;

export function setNotify(instance: NotificationInstance): void {
  _notify = instance;
}

export function getNotify(): NotificationInstance {
  if (!_notify) throw new Error("NotificationProvider is not mounted.");
  return _notify;
}

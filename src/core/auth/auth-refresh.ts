import { authStorage } from "./auth-storage";
import { authApi } from "@/app/modules/auth/login/services/auth.api";

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

function flushQueue(token: string) {
  queue.forEach((resolve) => resolve(token));
  queue = [];
}

function clearQueue() {
  queue = [];
}

export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve) => {
      queue.push(resolve);
    });
  }

  isRefreshing = true;

  try {
    const { accessToken, email, name, roles, permissions } =
      await authApi.refresh();
    const user = authStorage.getUser();
    authStorage.save(
      accessToken,
      user ?? {
        email,
        name,
        roles,
        permissions,
      },
    );

    flushQueue(accessToken);
    return accessToken;
  } catch (err) {
    clearQueue();
    authStorage.clear();
    window.location.href = "/login";
    throw err;
  } finally {
    isRefreshing = false;
  }
}

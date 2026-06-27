import axios from "axios";
import { authStorage } from "./auth-storage";

const REFRESH_ENDPOINT = `${import.meta.env.VITE_PREFIX_AUTH}/api/${import.meta.env.VITE_API_VERSION}/users/refresh`;

interface RefreshResponse {
  accessToken: string;
  email: string;
  name: string;
  role: string;
}

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
    const { data } = await axios.post<{ data: RefreshResponse }>(
      `${import.meta.env.VITE_API_URL}${REFRESH_ENDPOINT}`,
      undefined,
      { withCredentials: true },
    );

    const { accessToken, email, name, role } = data.data;
    const user = authStorage.getUser();
    authStorage.save(
      accessToken,
      user ?? {
        email,
        name,
        role,
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

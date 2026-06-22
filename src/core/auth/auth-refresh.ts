import axios from "axios";
import { authStorage } from "./auth-storage";

const REFRESH_ENDPOINT = `${import.meta.env.VITE_PREFIX_AUTH}/api/${import.meta.env.VITE_API_VERSION}/users/refresh`;

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiry: string;
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
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) throw new Error("No refresh token");

    const { data } = await axios.post<{ data: RefreshResponse }>(
      `${import.meta.env.VITE_API_URL}${REFRESH_ENDPOINT}`,
      { refreshToken },
    );

    const { accessToken, refreshToken: newRefreshToken, expiry } = data.data;
    const user = authStorage.getUser();
    authStorage.save(
      accessToken,
      newRefreshToken,
      user ?? { email: "" },
      expiry,
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

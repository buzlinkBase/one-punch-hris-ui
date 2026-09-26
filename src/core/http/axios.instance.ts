import axios from "axios";
import { applyAuthInterceptor } from "./interceptors/auth.interceptor";
import { applyErrorInterceptor } from "./interceptors/error.interceptor";

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:1442/",
  // Without this, a hung/slow backend call leaves the caller's promise pending forever --
  // confirmed to produce a stuck Sign In button, a permanent blank page on route beforeLoad
  // hooks, and a Web Lock that never releases across tabs (auth-refresh.ts). 30s is generous
  // enough for slow connections while still bounding every request in the app.
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-App-Version": "1.0.0",
    "X-Client": "hris-react",
  },
});

applyAuthInterceptor(axiosInstance);
applyErrorInterceptor(axiosInstance);

export default axiosInstance;

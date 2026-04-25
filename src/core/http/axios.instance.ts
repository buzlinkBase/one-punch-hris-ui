import axios from 'axios';
import { applyAuthInterceptor } from './interceptors/auth.interceptor';
import { applyErrorInterceptor } from './interceptors/error.interceptor';

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? 'http://localhost:1442/'}${import.meta.env.VITE_API_VERSION ?? 'v1'}/`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-App-Version': '1.0.0',
    'X-Client': 'hris-react',
  },
});

applyAuthInterceptor(axiosInstance);
applyErrorInterceptor(axiosInstance);

export default axiosInstance;

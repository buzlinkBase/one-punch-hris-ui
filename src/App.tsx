import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { ConfigProvider } from "antd";
import { theme } from "antd";
import { GoogleOAuthProvider } from "@react-oauth/google";
import router from "@/app/routes/AppRoutes";
import { queryClient } from "@/core/query-client";
import { THEME_CONFIG } from "@/core/theme.config";
import { NotificationProvider } from "@/shared/components/NotificationProvider";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: THEME_CONFIG.primaryColor,
          colorSuccess: THEME_CONFIG.colors.success,
          colorBgLayout: "#f7fbfa",
          colorBgContainer: "#ffffff",
          colorBorderSecondary: "#e3f3ef",
          borderRadius: 10,
          fontFamily:
            "Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        },
        components: {
          Layout: {
            bodyBg: "#f7fbfa",
            siderBg: "#ffffff",
            headerBg: "#ffffff",
          },
          Menu: {
            itemBg: "#ffffff",
            itemColor: "#305b52",
            itemHoverBg: "#eef9f6",
            itemHoverColor: THEME_CONFIG.primaryColor,
            itemSelectedBg: "#e8f7f2",
            itemSelectedColor: THEME_CONFIG.primaryColor,
            activeBarHeight: 0,
          },
          Card: {
            borderRadiusLG: 18,
          },
          Button: {
            borderRadius: 10,
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <NotificationProvider />
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
    </GoogleOAuthProvider>
  );
}

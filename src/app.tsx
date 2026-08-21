import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "@tanstack/react-router";
import { ConfigProvider } from "antd";
import { theme } from "antd";
import { GoogleOAuthProvider } from "@react-oauth/google";
import router from "@/app/routes/app-routes";
import { queryClient } from "@/core/query-client";
import { THEME_CONFIG } from "@/core/theme.config";
import { useThemeStore } from "@/core/stores/theme.store";
import { NotificationProvider } from "@/shared/components/notification-provider";

function ThemeApplier() {
  const mode = useThemeStore((s) => s.mode);
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [mode]);
  return null;
}

export default function App() {
  const mode = useThemeStore((s) => s.mode);
  const isDark = mode === "dark";

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeApplier />
      <ConfigProvider
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: THEME_CONFIG.primaryColor,
            colorSuccess: THEME_CONFIG.colors.success,
            colorBgLayout: isDark ? "#0e1c19" : "#f7fbfa",
            colorBgContainer: isDark ? "#162820" : "#ffffff",
            colorBorderSecondary: isDark ? "#1e3830" : "#e3f3ef",
            borderRadius: 10,
            fontFamily:
              "Poppins, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
          },
          components: {
            Layout: {
              bodyBg: isDark ? "#0e1c19" : "#f7fbfa",
              siderBg: isDark ? "#111f1b" : "#ffffff",
              headerBg: isDark ? "#111f1b" : "#ffffff",
            },
            Menu: {
              itemBg: isDark ? "#111f1b" : "#ffffff",
              itemColor: isDark ? "#c8e6df" : "#305b52",
              itemHoverBg: isDark ? "#1d3530" : "#eef9f6",
              itemHoverColor: THEME_CONFIG.primaryColor,
              itemSelectedBg: isDark ? "#1a3d35" : "#e8f7f2",
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

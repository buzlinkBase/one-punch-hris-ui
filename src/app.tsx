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
import { ConnectionStatusBanner } from "@/shared/components/connection-status-banner/connection-status-banner";

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
            boxShadow: isDark
              ? "0 12px 32px rgba(0, 0, 0, 0.45)"
              : "0 12px 32px rgba(29, 160, 129, 0.14)",
            boxShadowSecondary: isDark
              ? "0 8px 20px rgba(0, 0, 0, 0.35)"
              : "0 8px 20px rgba(29, 160, 129, 0.10)",
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
              controlHeight: 38,
              fontWeight: 600,
              primaryShadow: isDark
                ? "0 8px 20px rgba(29, 160, 129, 0.30)"
                : "0 8px 20px rgba(29, 160, 129, 0.22)",
            },
            Input: {
              borderRadius: 10,
              controlHeight: 38,
              activeShadow: `0 0 0 3px ${isDark ? "rgba(29, 160, 129, 0.25)" : "rgba(29, 160, 129, 0.14)"}`,
            },
            InputNumber: {
              borderRadius: 10,
              controlHeight: 38,
            },
            Select: {
              borderRadius: 10,
              controlHeight: 38,
            },
            DatePicker: {
              borderRadius: 10,
              controlHeight: 38,
            },
            Table: {
              borderRadius: 12,
              headerBg: isDark ? "#16302a" : "#f2faf7",
              headerColor: isDark ? "#c8e6df" : "#2f665b",
              headerSplitColor: "transparent",
              rowHoverBg: isDark ? "#1a3229" : "#f5fcfa",
              borderColor: isDark ? "#1e3830" : "#e3f3ef",
              cellPaddingBlock: 12,
            },
            Tabs: {
              itemSelectedColor: THEME_CONFIG.primaryColor,
              itemHoverColor: THEME_CONFIG.primaryColor,
              inkBarColor: THEME_CONFIG.primaryColor,
            },
            Tag: {
              borderRadiusSM: 999,
            },
            Modal: {
              borderRadiusLG: 16,
            },
            Dropdown: {
              borderRadiusLG: 12,
            },
            Tooltip: {
              // Tooltips stay a deliberately elevated "spotlight" in both themes rather than
              // antd's flat black default — dark teal bubble on the light theme, inverted to a
              // light teal bubble on the dark theme so it still pops against an already-dark
              // page, both tinted to the app's palette instead of plain black/white.
              colorBgSpotlight: isDark ? "#e8f7f2" : "#16302a",
              colorTextLightSolid: isDark ? "#0e1c19" : "#c8e6df",
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ConnectionStatusBanner />
          <NotificationProvider />
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ConfigProvider>
    </GoogleOAuthProvider>
  );
}

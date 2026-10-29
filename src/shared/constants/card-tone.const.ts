export type CardTone = "primary" | "success" | "warning" | "error" | "info";

// Full class names so Tailwind can see them. Every color is an antd theme token, so cards follow the
// brand color and dark mode.

/** For a Card with an antd `title`: colored top edge, softly tinted header, colored title and figure. */
export const CARD_HEAD_TONE_CLASS: Record<CardTone, string> = {
  primary:
    "border-t-4 border-t-(--ant-color-primary) [&_.ant-card-head]:bg-(--ant-color-primary-bg) [&_.ant-card-head-title]:text-(--ant-color-primary) [&_.ant-statistic-content]:text-(--ant-color-primary)",
  success:
    "border-t-4 border-t-(--ant-color-success) [&_.ant-card-head]:bg-(--ant-color-success-bg) [&_.ant-card-head-title]:text-(--ant-color-success) [&_.ant-statistic-content]:text-(--ant-color-success)",
  warning:
    "border-t-4 border-t-(--ant-color-warning) [&_.ant-card-head]:bg-(--ant-color-warning-bg) [&_.ant-card-head-title]:text-(--ant-color-warning) [&_.ant-statistic-content]:text-(--ant-color-warning)",
  error:
    "border-t-4 border-t-(--ant-color-error) [&_.ant-card-head]:bg-(--ant-color-error-bg) [&_.ant-card-head-title]:text-(--ant-color-error) [&_.ant-statistic-content]:text-(--ant-color-error)",
  info: "border-t-4 border-t-(--ant-color-info) [&_.ant-card-head]:bg-(--ant-color-info-bg) [&_.ant-card-head-title]:text-(--ant-color-info) [&_.ant-statistic-content]:text-(--ant-color-info)",
};

/** For a Card whose title is a heading in the body (the admin dashboard): colored top edge and heading. */
export const CARD_EDGE_TONE_CLASS: Record<CardTone, string> = {
  primary:
    "border-t-4 border-t-(--ant-color-primary) [&_h5]:text-(--ant-color-primary)",
  success:
    "border-t-4 border-t-(--ant-color-success) [&_h5]:text-(--ant-color-success)",
  warning:
    "border-t-4 border-t-(--ant-color-warning) [&_h5]:text-(--ant-color-warning)",
  error:
    "border-t-4 border-t-(--ant-color-error) [&_h5]:text-(--ant-color-error)",
  info: "border-t-4 border-t-(--ant-color-info) [&_h5]:text-(--ant-color-info)",
};

import { theme } from "antd";
import { useThemeStore } from "@/core/stores/theme.store";

/**
 * Categorical series colors, brand teal first, in a fixed order -- a chart's Nth series always
 * gets slot N, so a color follows its series and never its rank. Validated with the dataviz
 * palette checker (lightness band, chroma, colorblind and normal-vision separation of adjacent
 * slots) in both modes; dark mode is its own set of steps of the same hues, not an inversion.
 * Light-mode yellow and pink sit under 3:1 on white, which is why every chart also has a Table view.
 * Six slots is the ceiling: a seventh series must be folded into "Other", never a new hue.
 */
export const SERIES_COLORS = {
  light: ["#1DA081", "#2a78d6", "#eb6834", "#4a3aa7", "#eda100", "#e87ba4"],
  dark: ["#199e70", "#3987e5", "#d95926", "#9085e9", "#c98500", "#d55181"],
} as const;

export interface ChartTheme {
  series: readonly string[];
  surface: string;
  grid: string;
  axisText: string;
  cursor: string;
}

/** Colors for a chart in the current light/dark mode, the recessive parts from antd tokens. */
export function useChartTheme(): ChartTheme {
  const mode = useThemeStore((s) => s.mode);
  const { token } = theme.useToken();
  return {
    series: SERIES_COLORS[mode],
    surface: token.colorBgContainer,
    grid: token.colorBorderSecondary,
    axisText: token.colorTextSecondary,
    cursor: token.colorFillSecondary,
  };
}

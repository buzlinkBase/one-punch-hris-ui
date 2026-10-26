import type { ReactNode } from "react";
import { AppEmpty } from "./app-empty";

/** Table `locale` prop that renders AppEmpty instead of antd's default "No data". */
export function tableEmptyLocale(description: ReactNode, action?: ReactNode) {
  return { emptyText: <AppEmpty description={description} action={action} /> };
}

import { formatMoney } from "@/shared/utils/money.util";
export const formatPeso = (n: number) => `₱${formatMoney(n)}`;

export const formatPeso = (n: number) =>
  `₱${(n ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

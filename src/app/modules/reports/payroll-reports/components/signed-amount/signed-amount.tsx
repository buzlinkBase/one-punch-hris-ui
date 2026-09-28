const fmt = (n: number) =>
  Math.abs(n ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });

// A ledger movement: positive adds to the balance, negative (red, leading "−") deducts from it.
export function SignedAmount({ value }: { value: number }) {
  if (value < 0) return <span className="text-red-600">−{fmt(value)}</span>;
  return <span>{fmt(value)}</span>;
}

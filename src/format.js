export const DEFAULT_CURRENCY = "NGN";

// Formats an amount in its own currency, e.g. formatMoney(12500, "USD") -> "$12,500.00".
export function formatMoney(amount, currency = DEFAULT_CURRENCY, options = {}) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return "—";
  const code = currency || DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
      ...options,
    }).format(amount);
  } catch {
    // Unknown currency code: fall back to "12,500 XYZ".
    return `${Number(amount).toLocaleString()} ${code}`;
  }
}

// Standard symbol for a currency code, e.g. "NGN" -> "₦". Used instead of the API's
// `symbol` field, which is seeded with placeholders like "#" and "E".
export function currencySymbol(currency = DEFAULT_CURRENCY) {
  try {
    return (
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      })
        .formatToParts(0)
        .find((p) => p.type === "currency")?.value || currency
    );
  } catch {
    return currency;
  }
}

// Sums `amount` per currency so different currencies are never added together,
// e.g. "₦50,000.00 · $120.00". Returns a zero in the default currency when empty.
export function formatTotals(items) {
  const totals = new Map();
  for (const item of items) {
    const code = item.currency || DEFAULT_CURRENCY;
    totals.set(code, (totals.get(code) || 0) + (item.amount || 0));
  }
  if (totals.size === 0) return formatMoney(0);
  return [...totals].map(([code, sum]) => formatMoney(sum, code)).join(" · ");
}

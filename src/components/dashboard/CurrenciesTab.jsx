import { currencySymbol, formatMoney } from "../../format";
import EmptyState from "./EmptyState";
import { cardColor, COLORS, pageTitleStyle } from "./theme";

export default function CurrenciesTab({ currencies, status }) {
  return (
    <div>
      <h2 style={pageTitleStyle}>Currencies</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {currencies.map((c, i) => (
          <div
            key={c.code}
            style={{
              background: "#12122a",
              border: "1px solid #1e1e3a",
              borderRadius: "14px",
              padding: "1.25rem",
              borderTop: `3px solid ${cardColor(i)}`,
            }}
          >
            <p
              style={{
                margin: "0 0 0.25rem",
                fontWeight: "900",
                fontSize: "1.8rem",
                color: cardColor(i),
              }}
            >
              {currencySymbol(c.code)}
            </p>
            <p style={{ margin: 0, color: "#fff", fontWeight: "800" }}>{c.code}</p>
            <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.8rem" }}>{c.name}</p>
            <p
              style={{
                margin: "0.75rem 0 0",
                color: COLORS.green,
                fontSize: "0.9rem",
                fontWeight: "700",
              }}
            >
              {formatMoney(c.exchangeRate, "NGN", { maximumFractionDigits: 4 })}
            </p>
          </div>
        ))}
        {currencies.length === 0 && (
          <EmptyState
            status={status}
            icon="💱"
            message="No currencies available"
            style={{ gridColumn: "1/-1" }}
          />
        )}
      </div>
    </div>
  );
}

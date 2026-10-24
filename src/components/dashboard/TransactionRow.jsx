import { formatMoney } from "../../format";
import StatusBadge from "./StatusBadge";
import { statusColor } from "./theme";

// One contribution or payout in a list.
export default function TransactionRow({ item, icon, iconBackground, dateLabel, date, action }) {
  return (
    <div
      style={{
        background: "#12122a",
        border: "1px solid #1e1e3a",
        borderRadius: "14px",
        padding: "1rem 1.25rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: `3px solid ${statusColor(item.status)}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: iconBackground,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}
        >
          {icon}
        </div>
        <div>
          <p style={{ margin: 0, color: "#fff", fontWeight: "700" }}>
            {formatMoney(item.amount, item.currency)}
          </p>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem" }}>
            Cycle {item.cycleNumber} · {item.currency}
          </p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <StatusBadge
          status={item.status}
          style={{ padding: "0.25rem 0.75rem", fontSize: "0.75rem" }}
        />
        {date && (
          <p style={{ margin: "0.25rem 0 0", color: "#4b5563", fontSize: "0.75rem" }}>
            {dateLabel}: {new Date(date).toLocaleDateString()}
          </p>
        )}
        {action}
      </div>
    </div>
  );
}

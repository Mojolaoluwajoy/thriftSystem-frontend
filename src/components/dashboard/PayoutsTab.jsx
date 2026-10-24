import EmptyState from "./EmptyState";
import { pageTitleStyle } from "./theme";
import TransactionRow from "./TransactionRow";

export default function PayoutsTab({ payouts, status }) {
  return (
    <div>
      <h2 style={pageTitleStyle}>My Payouts</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {payouts.map((p) => (
          <TransactionRow
            key={p.id}
            item={p}
            icon="💸"
            iconBackground="rgba(16,185,129,0.15)"
            dateLabel="Scheduled"
            date={p.scheduledDate}
          />
        ))}
        {payouts.length === 0 && <EmptyState status={status} icon="💸" message="No payouts yet" />}
      </div>
    </div>
  );
}

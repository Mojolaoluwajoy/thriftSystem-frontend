import EmptyState from "./EmptyState";
import PayButton from "./PayButton";
import { pageTitleStyle, statusColor } from "./theme";
import TransactionRow from "./TransactionRow";

export default function ContributionsTab({ contributions, status, token, onChanged, onLogout }) {
  return (
    <div>
      <h2 style={pageTitleStyle}>My Contributions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {contributions.map((c) => (
          <TransactionRow
            key={c.id}
            item={c}
            icon="💳"
            iconBackground={`${statusColor(c.status)}20`}
            dateLabel="Due"
            date={c.dueDate}
            action={
              <PayButton contribution={c} token={token} onLogout={onLogout} onSettled={onChanged} />
            }
          />
        ))}
        {contributions.length === 0 && (
          <EmptyState status={status} icon="💳" message="No contributions yet" />
        )}
      </div>
    </div>
  );
}

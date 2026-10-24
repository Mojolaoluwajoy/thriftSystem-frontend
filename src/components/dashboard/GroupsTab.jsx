import { useState } from "react";
import { formatMoney } from "../../format";
import CreateGroupForm from "./CreateGroupForm";
import EmptyState from "./EmptyState";
import GroupDetails from "./GroupDetails";
import { frequencyLabel } from "./groups";
import StatusBadge from "./StatusBadge";
import { cardColor } from "./theme";

export default function GroupsTab({
  user,
  token,
  groups,
  status,
  currencies,
  showCreate,
  onToggleCreate,
  onCreated,
  onChanged,
  onLogout,
}) {
  const [selectedId, setSelectedId] = useState(null);

  if (selectedId) {
    return (
      <GroupDetails
        groupId={selectedId}
        user={user}
        token={token}
        onBack={() => setSelectedId(null)}
        onChanged={onChanged}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: 0, fontWeight: "900", color: "#fff", fontSize: "1.8rem" }}>
          My Groups
        </h2>
        <button
          onClick={() => onToggleCreate(!showCreate)}
          style={{
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            border: "none",
            borderRadius: "12px",
            color: "#fff",
            fontWeight: "800",
            fontSize: "0.9rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          + Create Group
        </button>
      </div>

      {showCreate && (
        <CreateGroupForm
          token={token}
          currencies={currencies}
          onCreated={onCreated}
          onCancel={() => onToggleCreate(false)}
          onLogout={onLogout}
        />
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {groups.map((g, i) => (
          <GroupCard
            key={g.id}
            group={g}
            accent={cardColor(i)}
            onOpen={() => setSelectedId(g.id)}
          />
        ))}
        {groups.length === 0 && (
          <EmptyState
            status={status}
            icon="👥"
            message="No groups yet. Create your first thrift group!"
            style={{ gridColumn: "1/-1" }}
          />
        )}
      </div>
    </div>
  );
}

function GroupCard({ group: g, accent, onOpen }) {
  const details = [
    ["Amount", formatMoney(g.contributionAmount, g.currency)],
    ["Members", `${g.memberIds?.length || 0}/${g.totalMembers}`],
    ["Cycle", `${g.currentCycle}/${g.totalCycles}`],
    ["Frequency", frequencyLabel(g.frequency)],
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${g.name}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        background: "#12122a",
        border: "1px solid #1e1e3a",
        borderRadius: "16px",
        padding: "1.25rem",
        borderTop: `3px solid ${accent}`,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <h3 style={{ margin: 0, color: "#fff", fontWeight: "800", fontSize: "1rem" }}>{g.name}</h3>
        <StatusBadge status={g.status} style={{ padding: "0.2rem 0.6rem" }} />
      </div>
      {g.description && (
        <p style={{ margin: "0 0 0.75rem", color: "#6b7280", fontSize: "0.85rem" }}>
          {g.description}
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
        {details.map(([label, val]) => (
          <div
            key={label}
            style={{ background: "#0a0a1a", borderRadius: "8px", padding: "0.5rem 0.75rem" }}
          >
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {label}
            </p>
            <p style={{ margin: 0, color: "#fff", fontSize: "0.85rem", fontWeight: "700" }}>
              {val}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

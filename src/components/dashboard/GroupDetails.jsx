import { useState } from "react";
import { apiRequest } from "../../api";
import { formatMoney } from "../../format";
import EmptyState from "./EmptyState";
import { frequencyLabel } from "./groups";
import PayButton from "./PayButton";
import { buildSchedule } from "./schedule";
import StatusBadge from "./StatusBadge";
import { COLORS, errorBoxStyle, inputStyle, labelStyle } from "./theme";
import useGroupDetails from "./useGroupDetails";

const cardStyle = {
  background: "#12122a",
  border: "1px solid #1e1e3a",
  borderRadius: "16px",
  padding: "1.25rem",
  marginBottom: "1.25rem",
};
const sectionTitle = { margin: "0 0 1rem", color: "#fff", fontWeight: "800", fontSize: "1rem" };
const mutedText = { margin: 0, color: "#6b7280", fontSize: "0.85rem" };
const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

export default function GroupDetails({ groupId, user, token, onBack, onChanged, onLogout }) {
  const { group, contributions, payouts, names, status, error, reload, retry } = useGroupDetails(
    groupId,
    token,
    onLogout,
  );

  const backButton = (
    <button
      onClick={onBack}
      style={{
        background: "transparent",
        border: "none",
        color: "#a78bfa",
        cursor: "pointer",
        fontFamily: "inherit",
        fontWeight: "700",
        padding: 0,
        marginBottom: "1.25rem",
      }}
    >
      ← All groups
    </button>
  );

  if (!group) {
    return (
      <div>
        {backButton}
        {status === "error" && (
          <div style={{ ...errorBoxStyle, display: "flex", justifyContent: "space-between" }}>
            <span>Couldn't load this group: {error}</span>
            <button
              onClick={retry}
              style={{
                background: "transparent",
                border: "none",
                color: "#f87171",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Retry
            </button>
          </div>
        )}
        <EmptyState status={status === "error" ? "error" : "loading"} />
      </div>
    );
  }

  const nameOf = (id) =>
    id === user.id ? `${user.firstName} ${user.lastName} (you)` : names[id] || `Member ${id}`;
  const isAdmin = group.adminId === user.id;
  const schedule = buildSchedule(group, payouts);
  const refresh = () => {
    reload();
    onChanged();
  };

  return (
    <div>
      {backButton}

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            marginBottom: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, color: "#fff", fontWeight: "900", fontSize: "1.6rem" }}>
            {group.name}
          </h2>
          <StatusBadge status={group.status} />
        </div>
        {group.description && (
          <p style={{ ...mutedText, marginBottom: "1rem" }}>{group.description}</p>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.5rem",
          }}
        >
          {[
            ["Contribution", formatMoney(group.contributionAmount, group.currency)],
            ["Frequency", frequencyLabel(group.frequency)],
            ["Members", `${group.memberIds?.length || 0}/${group.totalMembers}`],
            ["Cycle", `${group.currentCycle}/${group.totalCycles}`],
            [group.status === "FORMING" ? "Planned start" : "Started", formatDate(group.startDate)],
            ["Admin", nameOf(group.adminId)],
          ].map(([label, value]) => (
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
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {group.status === "FORMING" &&
        (isAdmin ? (
          <AdminSetup group={group} token={token} onDone={refresh} onLogout={onLogout} />
        ) : (
          <div style={cardStyle}>
            <p style={mutedText}>
              ⏳ This group hasn't started yet. The admin will start it once everyone has joined.
            </p>
          </div>
        ))}

      {group.status === "ACTIVE" && group.currentCycle > 0 && (
        <CurrentCycle
          group={group}
          contributions={contributions}
          schedule={schedule}
          nameOf={nameOf}
          userId={user.id}
          token={token}
          onChanged={refresh}
          onLogout={onLogout}
        />
      )}

      <div style={cardStyle}>
        <h3 style={sectionTitle}>Members &amp; payout order</h3>
        <p style={{ ...mutedText, marginBottom: "1rem" }}>
          Members collect in the order they joined. Dates marked ≈ are estimates until that cycle
          opens.
        </p>
        <PayoutSchedule schedule={schedule} currentCycle={group.currentCycle} nameOf={nameOf} />
      </div>
    </div>
  );
}

function AdminSetup({ group, token, onDone, onLogout }) {
  const [memberId, setMemberId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const memberCount = group.memberIds?.length || 0;
  const isFull = memberCount >= group.totalMembers;

  const run = async (action) => {
    setError("");
    setBusy(true);
    try {
      await action();
      onDone();
      return true;
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    const id = memberId.trim();
    if (!id) return setError("Enter the member's User ID");
    if (group.memberIds?.includes(id)) return setError("That user is already in this group");
    const added = await run(() =>
      apiRequest(`/group/${group.id}/members/${encodeURIComponent(id)}`, {
        method: "POST",
        token,
      }),
    );
    if (added) setMemberId("");
  };

  const startGroup = () =>
    run(() => apiRequest(`/group/${group.id}/start`, { method: "POST", token }));

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitle}>Set up your group</h3>
      {error && <div style={errorBoxStyle}>{error}</div>}

      <form onSubmit={addMember} noValidate style={{ marginBottom: "1.25rem" }}>
        <label style={labelStyle} htmlFor="member-id">
          Add a member by User ID
        </label>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <input
            id="member-id"
            placeholder="e.g. 6650f1c2a9b8..."
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            disabled={isFull}
            style={inputStyle}
          />
          <button type="submit" disabled={busy || isFull} style={primaryButton(busy || isFull)}>
            Add
          </button>
        </div>
        <p style={{ ...mutedText, fontSize: "0.75rem", marginTop: "6px" }}>
          {isFull ? "The group is full." : "Members can find their User ID on their Profile tab."}
        </p>
      </form>

      <button
        onClick={startGroup}
        disabled={busy || memberCount < 2}
        style={primaryButton(busy || memberCount < 2)}
      >
        Start group
      </button>
      <p style={{ ...mutedText, fontSize: "0.75rem", marginTop: "6px" }}>
        {memberCount < 2
          ? "You need at least 2 members to start."
          : `Starting opens cycle 1 for ${memberCount} members. No one can join after that.`}
      </p>
    </div>
  );
}

function CurrentCycle({
  group,
  contributions,
  schedule,
  nameOf,
  userId,
  token,
  onChanged,
  onLogout,
}) {
  const cycle = group.currentCycle;
  const row = schedule[cycle - 1];
  const cycleContributions = contributions.filter((c) => c.cycleNumber === cycle);
  const paid = cycleContributions.filter((c) => c.status === "SUCCESSFUL").length;
  const total = group.memberIds?.length || cycleContributions.length;
  const dueDate = cycleContributions[0]?.dueDate;

  return (
    <div style={cardStyle}>
      <h3 style={sectionTitle}>
        Cycle {cycle} of {group.totalCycles}
      </h3>
      <p style={{ ...mutedText, marginBottom: "0.75rem" }}>
        Collecting: <strong style={{ color: "#fff" }}>{row ? nameOf(row.userId) : "—"}</strong>
        {dueDate && <> · contributions due {formatDate(dueDate)}</>}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={paid}
        aria-label="Members paid this cycle"
        style={{ height: "8px", background: "#0a0a1a", borderRadius: "4px", overflow: "hidden" }}
      >
        <div
          style={{
            width: `${total ? (paid / total) * 100 : 0}%`,
            height: "100%",
            background: COLORS.green,
          }}
        />
      </div>
      <p style={{ ...mutedText, margin: "6px 0 1rem", fontSize: "0.8rem" }}>
        {paid} of {total} members paid
      </p>
      {cycleContributions.map((c) => (
        <div
          key={c.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.5rem 0",
            borderBottom: "1px solid #1e1e3a",
          }}
        >
          <span style={{ color: "#fff", fontSize: "0.85rem" }}>{nameOf(c.userId)}</span>
          <div style={{ textAlign: "right" }}>
            <StatusBadge status={c.status} />
            {c.userId === userId && (
              <PayButton contribution={c} token={token} onLogout={onLogout} onSettled={onChanged} />
            )}
          </div>
        </div>
      ))}
      {group.adminId === userId && row?.payout && (
        <ProcessPayout
          payout={row.payout}
          recipient={nameOf(row.userId)}
          allPaid={total > 0 && paid >= total}
          token={token}
          onDone={onChanged}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}

// Payouts the backend will (re)send: new ones, and transfers that failed or were reversed.
const PROCESSABLE_PAYOUTS = ["PENDING", "FAILED", "REVERSED"];

function ProcessPayout({ payout, recipient, allPaid, token, onDone, onLogout }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (payout.status === "PROCESSING") {
    return (
      <p style={{ ...mutedText, marginTop: "1rem" }}>
        ⏳ Payout to {recipient} is being processed. This page updates once Paystack confirms the
        transfer.
      </p>
    );
  }
  if (!PROCESSABLE_PAYOUTS.includes(payout.status)) return null;

  const retrying = payout.status !== "PENDING";
  const process = async () => {
    setError("");
    setBusy(true);
    try {
      await apiRequest(`/payouts/${payout.id}/process`, { method: "POST", token });
      onDone();
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ marginTop: "1.25rem" }}>
      {error && <div style={errorBoxStyle}>{error}</div>}
      {retrying && payout.failureReason && (
        <p style={{ ...mutedText, color: "#f87171", marginBottom: "0.5rem" }}>
          Last attempt failed: {payout.failureReason}
        </p>
      )}
      <button onClick={process} disabled={busy || !allPaid} style={primaryButton(busy || !allPaid)}>
        {busy
          ? "Sending payout…"
          : `${retrying ? "Retry payout" : "Process payout"} · ${formatMoney(payout.amount, payout.currency)} to ${recipient}`}
      </button>
      {!allPaid && (
        <p style={{ ...mutedText, fontSize: "0.75rem", marginTop: "6px" }}>
          Available once every member has paid for this cycle.
        </p>
      )}
    </div>
  );
}

function PayoutSchedule({ schedule, currentCycle, nameOf }) {
  if (schedule.length === 0) return <p style={mutedText}>No members yet.</p>;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        <thead>
          <tr>
            {["#", "Member", "Collects", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  ...labelStyle,
                  textAlign: "left",
                  padding: "0 0.5rem 0.5rem",
                  borderBottom: "1px solid #1e1e3a",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => {
            const isCurrent = row.cycle === currentCycle;
            return (
              <tr
                key={row.cycle}
                style={{ background: isCurrent ? "rgba(124,58,237,0.12)" : "transparent" }}
              >
                <td style={cell}>{row.cycle}</td>
                <td style={{ ...cell, color: "#fff" }}>{nameOf(row.userId)}</td>
                <td style={cell}>
                  {row.estimated && row.date ? "≈ " : ""}
                  {formatDate(row.date)}
                </td>
                <td style={cell}>
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const cell = { padding: "0.6rem 0.5rem", color: "#a0a0c0", borderBottom: "1px solid #1e1e3a" };

const primaryButton = (disabled) => ({
  padding: "0.7rem 1.25rem",
  background: disabled ? "#3d3d6b" : "linear-gradient(135deg, #7c3aed, #06b6d4)",
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontWeight: "800",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
});

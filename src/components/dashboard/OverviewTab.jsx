import { formatMoney, formatTotals } from "../../format";
import { frequencyLabel } from "./groups";
import StatusBadge from "./StatusBadge";
import { COLORS } from "./theme";

const greetingFor = (hour) =>
  hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

export default function OverviewTab({ user, groups, contributions, payouts }) {
  const stats = [
    {
      label: "Active Groups",
      value: groups.filter((g) => g.status === "ACTIVE").length,
      color: COLORS.purple,
      icon: "👥",
    },
    {
      label: "Total Contributed",
      value: formatTotals(contributions.filter((c) => c.status === "SUCCESSFUL")),
      color: COLORS.cyan,
      icon: "💳",
    },
    {
      label: "Total Payouts",
      value: formatTotals(payouts.filter((p) => p.status === "SUCCESSFUL")),
      color: COLORS.amber,
      icon: "💸",
    },
    {
      label: "Pending",
      value: contributions.filter((c) => c.status === "PENDING").length,
      color: COLORS.pink,
      icon: "⏳",
    },
  ];

  const recent = [
    {
      title: "Recent Groups",
      items: groups.slice(0, 3),
      getTitle: (g) => g.name,
      getSub: (g) =>
        `${formatMoney(g.contributionAmount, g.currency)} · ${frequencyLabel(g.frequency)}`,
      icon: "👥",
    },
    {
      title: "Recent Contributions",
      items: contributions.slice(0, 3),
      getTitle: (c) => formatMoney(c.amount, c.currency),
      getSub: (c) => `Cycle ${c.cycleNumber} · ${c.currency}`,
      icon: "💳",
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            margin: 0,
            fontWeight: "900",
            fontSize: "2.2rem",
            color: "#fff",
            letterSpacing: "-1px",
          }}
        >
          {greetingFor(new Date().getHours())},{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {user.firstName}
          </span>{" "}
          👋
        </h1>
        <p style={{ margin: "0.5rem 0 0", color: "#6b7280" }}>Here's your financial overview</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {recent.map((section) => (
          <RecentList key={section.title} {...section} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div
      style={{
        background: "#12122a",
        border: `1px solid ${color}40`,
        borderRadius: "16px",
        padding: "1.25rem",
        borderTop: `3px solid ${color}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: color,
          opacity: 0.1,
        }}
      />
      <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {label}
      </p>
      <p style={{ margin: "0.25rem 0 0", fontWeight: "900", fontSize: "1.6rem", color: "#fff" }}>
        {value}
      </p>
    </div>
  );
}

function RecentList({ title, items, getTitle, getSub, icon }) {
  return (
    <div
      style={{
        background: "#12122a",
        border: "1px solid #1e1e3a",
        borderRadius: "16px",
        padding: "1.25rem",
      }}
    >
      <h3 style={{ margin: "0 0 1rem", color: "#fff", fontWeight: "800", fontSize: "1rem" }}>
        {title}
      </h3>
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 0",
            borderBottom: "1px solid #1e1e3a",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#fff", fontWeight: "600", fontSize: "0.9rem" }}>
              {getTitle(item)}
            </p>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem" }}>{getSub(item)}</p>
          </div>
          <StatusBadge status={item.status} />
        </div>
      ))}
      {items.length === 0 && (
        <p
          style={{ color: "#4b5563", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}
        >
          {icon} No data yet
        </p>
      )}
    </div>
  );
}

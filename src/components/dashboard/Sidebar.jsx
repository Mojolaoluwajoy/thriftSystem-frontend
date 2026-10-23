import Avatar from "./Avatar";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "groups", label: "My Groups", icon: "👥" },
  { id: "contributions", label: "Contributions", icon: "💳" },
  { id: "payouts", label: "Payouts", icon: "💸" },
  { id: "currencies", label: "Currencies", icon: "💱" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const ellipsis = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

export default function Sidebar({ active, onSelect, user, onLogout }) {
  return (
    <div
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "#0d0d1f",
        borderRight: "1px solid #1e1e3a",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 1rem",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "2.5rem",
          padding: "0 0.5rem",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "900",
            color: "#fff",
            fontSize: "1.2rem",
          }}
        >
          T
        </div>
        <span
          style={{ fontWeight: "900", color: "#fff", fontSize: "1.1rem", letterSpacing: "-0.5px" }}
        >
          ThriftSystem
        </span>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: isActive ? "rgba(124,58,237,0.2)" : "transparent",
                color: isActive ? "#a78bfa" : "#6b7280",
                fontWeight: isActive ? "700" : "400",
                fontSize: "0.9rem",
                textAlign: "left",
                transition: "all 0.15s",
                marginBottom: "4px",
                borderLeft: isActive ? "3px solid #7c3aed" : "3px solid transparent",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          background: "#12122a",
          borderRadius: "14px",
          padding: "1rem",
          border: "1px solid #1e1e3a",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}
        >
          <Avatar user={user} size="40px" fontSize="0.9rem" fontWeight="800" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: "700",
                fontSize: "0.85rem",
                ...ellipsis,
              }}
            >
              {user.firstName} {user.lastName}
            </p>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.75rem", ...ellipsis }}>
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            width: "100%",
            padding: "0.5rem",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "8px",
            color: "#f87171",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontFamily: "inherit",
            fontWeight: "600",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

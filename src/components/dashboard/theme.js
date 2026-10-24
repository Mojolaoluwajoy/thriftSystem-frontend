export const COLORS = {
  purple: "#7c3aed",
  cyan: "#06b6d4",
  amber: "#f59e0b",
  green: "#10b981",
  pink: "#ec4899",
  red: "#ef4444",
};

// Accent colours cycled through for card borders.
export const CARD_COLORS = [COLORS.purple, COLORS.cyan, COLORS.amber, COLORS.green, COLORS.pink];
export const cardColor = (i) => CARD_COLORS[i % CARD_COLORS.length];

export const statusColor = (s) =>
  ({
    ACTIVE: COLORS.green,
    COMPLETED: COLORS.cyan,
    PENDING: COLORS.amber,
    SUCCESSFUL: COLORS.green,
    FAILED: COLORS.red,
    PROCESSING: COLORS.purple,
    SUSPENDED: COLORS.red,
    INACTIVE: "#6b7280",
    FORMING: "#60a5fa",
    UPCOMING: "#6b7280",
    REVERSED: COLORS.red,
  })[s] || "#6b7280";

export const errorBoxStyle = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  borderRadius: "10px",
  padding: "0.75rem 1rem",
  color: "#f87171",
  fontSize: "0.85rem",
  marginBottom: "1.5rem",
};

export const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  background: "#1a1a2e",
  border: "1.5px solid #2d2d4e",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export const labelStyle = {
  display: "block",
  color: "#a0a0c0",
  fontSize: "0.75rem",
  fontWeight: "700",
  letterSpacing: "1px",
  marginBottom: "6px",
  textTransform: "uppercase",
};

export const pageTitleStyle = {
  margin: "0 0 1.5rem",
  fontWeight: "900",
  color: "#fff",
  fontSize: "1.8rem",
};

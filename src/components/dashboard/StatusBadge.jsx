import { statusColor } from "./theme";

export default function StatusBadge({ status, style }) {
  return (
    <span
      style={{
        padding: "0.2rem 0.7rem",
        borderRadius: "20px",
        fontSize: "0.7rem",
        fontWeight: "700",
        background: `${statusColor(status)}20`,
        color: statusColor(status),
        ...style,
      }}
    >
      {status}
    </span>
  );
}

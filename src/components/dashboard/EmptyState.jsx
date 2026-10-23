export default function EmptyState({ icon, message, style }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#4b5563", ...style }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{icon}</div>
      <p>{message}</p>
    </div>
  );
}

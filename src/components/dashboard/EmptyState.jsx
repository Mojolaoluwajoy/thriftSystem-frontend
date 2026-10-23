// Shown in place of an empty list. `status` comes from useDashboardData, so the
// "nothing here yet" message only appears once the list has actually loaded.
export default function EmptyState({ status = "ready", icon, message, style }) {
  const [shownIcon, text] =
    status === "loading"
      ? ["⏳", "Loading…"]
      : status === "error"
        ? ["⚠️", "Couldn't load this list. Use Retry above to try again."]
        : [icon, message];

  return (
    <div role="status" style={{ textAlign: "center", padding: "3rem", color: "#4b5563", ...style }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{shownIcon}</div>
      <p>{text}</p>
    </div>
  );
}

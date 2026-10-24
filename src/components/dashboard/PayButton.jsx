import { useState } from "react";
import { canPay, goToCheckout, PAYABLE_CURRENCY, startCheckout } from "./payments";

// "Pay" for one of the member's own contributions: opens Paystack checkout in this tab.
// `onSettled` refreshes the lists when the backend says it has already been paid.
export default function PayButton({ contribution, token, onLogout, onSettled }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!canPay(contribution)) {
    if (contribution.status === "PENDING" && contribution.currency !== PAYABLE_CURRENCY) {
      return <p style={noteStyle}>Online payment is only available in {PAYABLE_CURRENCY}</p>;
    }
    return null;
  }

  const pay = async () => {
    setError("");
    setBusy(true);
    try {
      goToCheckout(await startCheckout(contribution.id, token));
    } catch (err) {
      setBusy(false);
      if (err.status === 401) return onLogout();
      setError(err.message);
      if (/already been paid/i.test(err.message)) onSettled?.();
    }
  };

  return (
    <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
      <button
        onClick={pay}
        disabled={busy}
        style={{
          padding: "0.4rem 1rem",
          background: busy ? "#3d3d6b" : "linear-gradient(135deg, #7c3aed, #06b6d4)",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          fontWeight: "800",
          fontSize: "0.8rem",
          cursor: busy ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {busy ? "Opening checkout…" : contribution.status === "PENDING" ? "Pay" : "Retry payment"}
      </button>
      {error && (
        <p role="alert" style={{ ...noteStyle, color: "#f87171" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const noteStyle = {
  margin: "0.25rem 0 0",
  color: "#6b7280",
  fontSize: "0.75rem",
  maxWidth: "220px",
};

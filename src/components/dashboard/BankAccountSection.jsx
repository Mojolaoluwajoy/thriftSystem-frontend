import { useEffect, useState } from "react";
import { apiRequest } from "../../api";
import { BANKS, OTHER_BANK, toBankAccountRequest, validateBankAccount } from "./banks";
import { COLORS, errorBoxStyle, inputStyle, labelStyle } from "./theme";

const EMPTY_FORM = { accountNumber: "", bank: "", otherCode: "", accountName: "" };

// Lets a member link the bank account their payouts are sent to.
export default function BankAccountSection({ token, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest("/user/me", { token }).then(setProfile, (err) => {
      if (err.status === 401) return onLogout();
      setLoadError(err.message);
    });
  }, [token, onLogout]);

  const update = (key, value) => {
    setForm({ ...form, [key]: value });
    // The bank select and "other" code input share the bankCode error.
    const errorKey = key === "bank" || key === "otherCode" ? "bankCode" : key;
    setFieldErrors({ ...fieldErrors, [errorKey]: undefined });
  };

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validateBankAccount(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      const updated = await apiRequest("/user/me/bank-account", {
        method: "PUT",
        token,
        body: toBankAccountRequest(form),
      });
      setProfile(updated);
      setForm(EMPTY_FORM);
      setEditing(false);
    } catch (err) {
      if (err.status === 401) return onLogout();
      setFieldErrors(err.fieldErrors || {});
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle = (key) => ({
    ...inputStyle,
    ...(fieldErrors[key] && { border: `1.5px solid ${COLORS.red}` }),
  });
  const fieldError = (key) =>
    fieldErrors[key] && (
      <p style={{ margin: "4px 0 0", color: "#f87171", fontSize: "0.75rem" }}>{fieldErrors[key]}</p>
    );

  return (
    <div style={{ marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid #1e1e3a" }}>
      <h3 style={{ margin: "0 0 0.5rem", color: "#fff", fontWeight: "800", fontSize: "1rem" }}>
        🏦 Payout bank account
      </h3>

      {loadError && <div style={errorBoxStyle}>Couldn't load your bank details: {loadError}</div>}
      {!profile && !loadError && <p style={muted}>Loading…</p>}

      {profile && !editing && (
        <>
          <p style={{ ...muted, marginBottom: "0.75rem" }}>
            {profile.bankAccountLinked ? (
              <>
                ✅ Linked: <strong style={{ color: "#fff" }}>{profile.bankAccountName}</strong>.
                Your payouts are sent to this account.
              </>
            ) : (
              "⚠️ No bank account linked yet. Add one so your group can pay you when it's your turn."
            )}
          </p>
          <button onClick={() => setEditing(true)} style={buttonStyle(false)}>
            {profile.bankAccountLinked ? "Change bank account" : "Add bank account"}
          </button>
        </>
      )}

      {editing && (
        <form onSubmit={save} noValidate>
          {error && <div style={errorBoxStyle}>{error}</div>}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle} htmlFor="bank">
              Bank
            </label>
            <select
              id="bank"
              value={form.bank}
              onChange={(e) => update("bank", e.target.value)}
              aria-invalid={Boolean(fieldErrors.bankCode)}
              style={fieldStyle("bankCode")}
            >
              <option value="">Choose your bank</option>
              {BANKS.map((b) => (
                <option key={b.code} value={b.code} style={{ background: "#1a1a2e" }}>
                  {b.name}
                </option>
              ))}
              <option value={OTHER_BANK} style={{ background: "#1a1a2e" }}>
                Other (enter bank code)
              </option>
            </select>
            {form.bank === OTHER_BANK && (
              <input
                id="other-bank-code"
                placeholder="Bank code, e.g. 50211"
                value={form.otherCode}
                onChange={(e) => update("otherCode", e.target.value)}
                style={{ ...fieldStyle("bankCode"), marginTop: "0.5rem" }}
              />
            )}
            {fieldError("bankCode")}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle} htmlFor="account-number">
              Account number
            </label>
            <input
              id="account-number"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit NUBAN"
              value={form.accountNumber}
              onChange={(e) => update("accountNumber", e.target.value.replace(/\D/g, ""))}
              aria-invalid={Boolean(fieldErrors.accountNumber)}
              style={fieldStyle("accountNumber")}
            />
            {fieldError("accountNumber")}
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle} htmlFor="account-name">
              Account name
            </label>
            <input
              id="account-name"
              placeholder="As shown on your bank account"
              value={form.accountName}
              onChange={(e) => update("accountName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.accountName)}
              style={fieldStyle("accountName")}
            />
            {fieldError("accountName")}
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" disabled={saving} style={buttonStyle(saving)}>
              {saving ? "Verifying…" : "Save bank account"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setForm(EMPTY_FORM);
                setFieldErrors({});
                setError("");
              }}
              style={{
                ...buttonStyle(false),
                background: "transparent",
                border: "1px solid #2d2d4e",
                color: "#6b7280",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const muted = { margin: 0, color: "#6b7280", fontSize: "0.85rem" };

const buttonStyle = (disabled) => ({
  padding: "0.7rem 1.25rem",
  background: disabled ? "#3d3d6b" : "linear-gradient(135deg, #7c3aed, #06b6d4)",
  border: "none",
  borderRadius: "10px",
  color: "#fff",
  fontWeight: "800",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
});

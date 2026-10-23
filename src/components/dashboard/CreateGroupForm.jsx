import { useState } from "react";
import { apiRequest } from "../../api";
import { currencySymbol } from "../../format";
import {
  EMPTY_GROUP_FORM,
  FREQUENCIES,
  frequencyLabel,
  toCreateGroupRequest,
  validateGroup,
} from "./groups";
import { COLORS, errorBoxStyle, inputStyle, labelStyle } from "./theme";

export default function CreateGroupForm({ token, currencies, onCreated, onCancel, onLogout }) {
  const [form, setForm] = useState(EMPTY_GROUP_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errors = validateGroup(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      await apiRequest("/group/create-group", {
        method: "POST",
        token,
        body: toCreateGroupRequest(form),
      });
      setForm(EMPTY_GROUP_FORM);
      setFieldErrors({});
      onCreated();
    } catch (err) {
      if (err.status === 401) return onLogout();
      setFieldErrors(err.fieldErrors || {});
      setError(err.message || "Couldn't create group.");
    } finally {
      setLoading(false);
    }
  };

  const textFields = [
    ["Group Name", "name", "text", "e.g. Office Thrift 2026", {}],
    ["Description", "description", "text", "Optional", {}],
    [
      `Amount (${currencySymbol(form.currency)})`,
      "contributionAmount",
      "number",
      "e.g. 10000",
      { min: "0.01", step: "0.01" },
    ],
    ["Total Members", "totalMembers", "number", "e.g. 10", { min: "1", step: "1" }],
    ["Start Date", "startDate", "date", "", {}],
  ];

  return (
    <div
      style={{
        background: "#12122a",
        border: "1px solid #2d2d4e",
        borderRadius: "16px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
      }}
    >
      <h3 style={{ margin: "0 0 1rem", color: "#fff", fontWeight: "800" }}>Create New Group</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {textFields.map(([label, key, type, ph, attrs]) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type}
                placeholder={ph}
                required={key !== "description"}
                {...attrs}
                value={form[key]}
                onChange={(e) => {
                  setForm({ ...form, [key]: e.target.value });
                  setFieldErrors({ ...fieldErrors, [key]: undefined });
                }}
                aria-invalid={Boolean(fieldErrors[key])}
                style={{ ...inputStyle, ...(fieldErrors[key] && { borderColor: COLORS.red }) }}
              />
              {fieldErrors[key] && (
                <p style={{ margin: "4px 0 0", color: "#f87171", fontSize: "0.75rem" }}>
                  {fieldErrors[key]}
                </p>
              )}
            </div>
          ))}
          <div>
            <label style={labelStyle}>Frequency</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              style={inputStyle}
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f} style={{ background: "#1a1a2e" }}>
                  {frequencyLabel(f)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              style={inputStyle}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code} style={{ background: "#1a1a2e" }}>
                  {currencySymbol(c.code)} {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && (
          <div style={{ ...errorBoxStyle, marginTop: "1.25rem", marginBottom: 0 }}>{error}</div>
        )}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontWeight: "800",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "1px solid #2d2d4e",
              borderRadius: "10px",
              color: "#6b7280",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

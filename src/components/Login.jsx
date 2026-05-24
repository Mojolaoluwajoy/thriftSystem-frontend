import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    firstName: "", lastName: "", email: "", phoneNumber: "", password: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) onLogin(data.data, data.data.token);
      else setError(data.message || "Login failed");
    } catch { setError("Connection error. Make sure the server is running."); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (data.success) onLogin(data.data, data.data.token);
      else setError(data.message || "Registration failed");
    } catch { setError("Connection error. Make sure the server is running."); }
    setLoading(false);
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    background: "#1a1a2e", border: "2px solid #2d2d4e",
    borderRadius: "12px", color: "#fff",
    fontSize: "0.95rem", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
    fontFamily: "inherit"
  };

  const labelStyle = {
    display: "block", color: "#a0a0c0",
    fontSize: "0.75rem", fontWeight: "700",
    letterSpacing: "1px", marginBottom: "6px",
    textTransform: "uppercase"
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a1a",
      display: "flex", alignItems: "center",
      justifyContent: "center", padding: "1rem",
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      position: "relative", overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* Bold geometric background */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "600px", height: "600px", borderRadius: "50%", background: "#7c3aed", opacity: 0.15 }} />
        <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "#06b6d4", opacity: 0.12 }} />
        <div style={{ position: "absolute", top: "40%", left: "30%", width: "300px", height: "300px", borderRadius: "50%", background: "#f59e0b", opacity: 0.08 }} />
        <div style={{ position: "absolute", top: "20px", left: "20px", width: "120px", height: "4px", background: "#7c3aed", borderRadius: "2px" }} />
        <div style={{ position: "absolute", top: "30px", left: "20px", width: "60px", height: "4px", background: "#06b6d4", borderRadius: "2px" }} />
        <div style={{ position: "absolute", bottom: "20px", right: "20px", width: "120px", height: "4px", background: "#f59e0b", borderRadius: "2px" }} />
      </div>

      <div style={{ width: "100%", maxWidth: "460px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: "72px", height: "72px", borderRadius: "20px",
            background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
            marginBottom: "1rem", fontSize: "2rem", fontWeight: "900",
            color: "#fff", border: "3px solid rgba(124,58,237,0.5)"
          }}>T</div>
          <h1 style={{
            margin: 0, fontSize: "2.5rem", fontWeight: "900",
            color: "#fff", letterSpacing: "-1px",
            background: "linear-gradient(135deg, #a78bfa, #22d3ee)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>ThriftSystem</h1>
          <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
            Cooperative savings, reimagined
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#12122a", border: "1px solid #2d2d4e",
          borderRadius: "24px", padding: "2rem",
          boxShadow: "0 0 60px rgba(124,58,237,0.15)"
        }}>

          {/* Toggle */}
          <div style={{
            display: "flex", background: "#0a0a1a",
            borderRadius: "14px", padding: "4px",
            marginBottom: "2rem", border: "1px solid #2d2d4e"
          }}>
            {["Login", "Register"].map(tab => (
              <button key={tab} onClick={() => { setIsRegister(tab === "Register"); setError(""); }}
                style={{
                  flex: 1, padding: "0.75rem",
                  borderRadius: "11px", border: "none",
                  cursor: "pointer", fontWeight: "700",
                  fontSize: "0.9rem", fontFamily: "inherit",
                  transition: "all 0.2s",
                  background: (tab === "Register") === isRegister
                    ? "linear-gradient(135deg, #7c3aed, #06b6d4)"
                    : "transparent",
                  color: (tab === "Register") === isRegister ? "#fff" : "#6b7280",
                }}>
                {tab}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "10px", padding: "0.75rem 1rem",
              color: "#f87171", fontSize: "0.85rem", marginBottom: "1.5rem"
            }}>{error}</div>
          )}

          {!isRegister ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={labelStyle}>Email</label>
                <input type="email" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.75rem" }}>
                <label style={labelStyle}>Password</label>
                <input type="password" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                  style={inputStyle} />
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "1rem",
                background: loading ? "#3d3d6b" : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                border: "none", borderRadius: "14px", color: "#fff",
                fontWeight: "800", fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: "0.5px", transition: "opacity 0.2s"
              }}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                {[["First Name", "firstName", "John"], ["Last Name", "lastName", "Doe"]].map(([label, key, ph]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input placeholder={ph} required value={regForm[key]}
                      onChange={e => setRegForm({ ...regForm, [key]: e.target.value })}
                      style={inputStyle} />
                  </div>
                ))}
              </div>
              {[
                ["Email", "email", "email", "you@example.com"],
                ["Phone Number", "phoneNumber", "tel", "08012345678"],
                ["Password", "password", "password", "Min 8 characters"]
              ].map(([label, key, type, ph]) => (
                <div key={key} style={{ marginBottom: "1.25rem" }}>
                  <label style={labelStyle}>{label}</label>
                  <input type={type} placeholder={ph} required value={regForm[key]}
                    onChange={e => setRegForm({ ...regForm, [key]: e.target.value })}
                    style={inputStyle} />
                </div>
              ))}
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "1rem",
                background: loading ? "#3d3d6b" : "linear-gradient(135deg, #7c3aed, #06b6d4)",
                border: "none", borderRadius: "14px", color: "#fff",
                fontWeight: "800", fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit", letterSpacing: "0.5px"
              }}>
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", color: "#4b5563", fontSize: "0.8rem", marginTop: "1.5rem" }}>
          Secure • Fast • Nigerian-built
        </p>
      </div>
    </div>
  );
}
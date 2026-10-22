import { useState, useEffect } from "react";
import { apiRequest } from "../api";
import { formatMoney, formatTotals } from "../format";

const COLORS = {
  purple: "#7c3aed",
  cyan: "#06b6d4",
  amber: "#f59e0b",
  green: "#10b981",
  pink: "#ec4899",
  red: "#ef4444",
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "groups", label: "My Groups", icon: "👥" },
  { id: "contributions", label: "Contributions", icon: "💳" },
  { id: "payouts", label: "Payouts", icon: "💸" },
  { id: "currencies", label: "Currencies", icon: "💱" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const statusColor = (s) =>
  ({
    ACTIVE: COLORS.green,
    COMPLETED: COLORS.cyan,
    PENDING: COLORS.amber,
    SUCCESSFUL: COLORS.green,
    FAILED: COLORS.red,
    PROCESSING: COLORS.purple,
    SUSPENDED: COLORS.red,
    INACTIVE: "#6b7280",
  })[s] || "#6b7280";

export default function Dashboard({ user, token, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [groups, setGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    contributionAmount: "",
    currency: "NGN",
    frequency: "MONTHLY",
    startDate: "",
    totalMembers: "",
  });

  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
    fetchAll();
  }, []);

  const fetchAll = () => {
    setLoadError("");
    fetchData("/groups/my-groups", setGroups, "groups");
    fetchData("/contributions/my-contributions", setContributions, "contributions");
    fetchData("/payouts/my-payouts", setPayouts, "payouts");
    fetchData("/currencies", setCurrencies, "currencies");
  };

  const fetchData = async (path, setter, label) => {
    try {
      setter((await apiRequest(path, { token })) || []);
    } catch (err) {
      if (err.status === 401) return onLogout();
      setLoadError(`Couldn't load ${label}: ${err.message}`);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCreateError("");
    try {
      await apiRequest("/groups", {
        method: "POST",
        token,
        body: {
          ...createForm,
          contributionAmount: parseFloat(createForm.contributionAmount),
          totalMembers: parseInt(createForm.totalMembers),
          startDate: new Date(createForm.startDate).toISOString(),
        },
      });
      setShowCreate(false);
      fetchData("/groups/my-groups", setGroups, "groups");
      setCreateForm({
        name: "",
        description: "",
        contributionAmount: "",
        currency: "NGN",
        frequency: "MONTHLY",
        startDate: "",
        totalMembers: "",
      });
    } catch (err) {
      if (err.status === 401) return onLogout();
      setCreateError(err.message || "Couldn't create group.");
    } finally {
      setLoading(false);
    }
  };

  const errorBoxStyle = {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "#f87171",
    fontSize: "0.85rem",
    marginBottom: "1.5rem",
  };

  const totalContributed = formatTotals(contributions.filter((c) => c.status === "SUCCESSFUL"));
  const totalPayouts = formatTotals(payouts.filter((p) => p.status === "SUCCESSFUL"));
  const createSymbol =
    currencies.find((c) => c.code === createForm.currency)?.symbol || createForm.currency;

  const cardColors = [COLORS.purple, COLORS.cyan, COLORS.amber, COLORS.green, COLORS.pink];

  const sidebarStyle = {
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
  };

  const inputStyle = {
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a1a",
        display: "flex",
        fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <div style={sidebarStyle}>
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
            style={{
              fontWeight: "900",
              color: "#fff",
              fontSize: "1.1rem",
              letterSpacing: "-0.5px",
            }}
          >
            ThriftSystem
          </span>
        </div>

        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.8rem 1rem",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                background: active === item.id ? "rgba(124,58,237,0.2)" : "transparent",
                color: active === item.id ? "#a78bfa" : "#6b7280",
                fontWeight: active === item.id ? "700" : "400",
                fontSize: "0.9rem",
                textAlign: "left",
                transition: "all 0.15s",
                marginBottom: "4px",
                borderLeft: active === item.id ? "3px solid #7c3aed" : "3px solid transparent",
                fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
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
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "800",
                color: "#fff",
                fontSize: "0.9rem",
              }}
            >
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.firstName} {user.lastName}
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
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

      {/* Main */}
      <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {loadError && (
          <div
            style={{
              ...errorBoxStyle,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span>{loadError}</span>
            <button
              onClick={fetchAll}
              style={{
                padding: "0.4rem 0.9rem",
                background: "transparent",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: "8px",
                color: "#f87171",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: "600",
              }}
            >
              Retry
            </button>
          </div>
        )}
        {/* Dashboard */}
        {active === "dashboard" && (
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
                {greeting},{" "}
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
              <p style={{ margin: "0.5rem 0 0", color: "#6b7280" }}>
                Here's your financial overview
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {[
                {
                  label: "Active Groups",
                  value: groups.filter((g) => g.status === "ACTIVE").length,
                  color: COLORS.purple,
                  icon: "👥",
                },
                {
                  label: "Total Contributed",
                  value: totalContributed,
                  color: COLORS.cyan,
                  icon: "💳",
                },
                {
                  label: "Total Payouts",
                  value: totalPayouts,
                  color: COLORS.amber,
                  icon: "💸",
                },
                {
                  label: "Pending",
                  value: contributions.filter((c) => c.status === "PENDING").length,
                  color: COLORS.pink,
                  icon: "⏳",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "#12122a",
                    border: `1px solid ${stat.color}40`,
                    borderRadius: "16px",
                    padding: "1.25rem",
                    borderTop: `3px solid ${stat.color}`,
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
                      background: stat.color,
                      opacity: 0.1,
                    }}
                  />
                  <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      margin: "0.25rem 0 0",
                      fontWeight: "900",
                      fontSize: "1.6rem",
                      color: "#fff",
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1rem",
              }}
            >
              {[
                {
                  title: "Recent Groups",
                  items: groups.slice(0, 3),
                  getTitle: (g) => g.name,
                  getSub: (g) =>
                    `${formatMoney(g.contributionAmount, g.currency)} · ${g.frequency}`,
                  getStatus: (g) => g.status,
                  icon: "👥",
                },
                {
                  title: "Recent Contributions",
                  items: contributions.slice(0, 3),
                  getTitle: (c) => formatMoney(c.amount, c.currency),
                  getSub: (c) => `Cycle ${c.cycleNumber} · ${c.currency}`,
                  getStatus: (c) => c.status,
                  icon: "💳",
                },
              ].map((section) => (
                <div
                  key={section.title}
                  style={{
                    background: "#12122a",
                    border: "1px solid #1e1e3a",
                    borderRadius: "16px",
                    padding: "1.25rem",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 1rem",
                      color: "#fff",
                      fontWeight: "800",
                      fontSize: "1rem",
                    }}
                  >
                    {section.title}
                  </h3>
                  {section.items.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0.75rem 0",
                        borderBottom: "1px solid #1e1e3a",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: 0,
                            color: "#fff",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                          }}
                        >
                          {section.getTitle(item)}
                        </p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem" }}>
                          {section.getSub(item)}
                        </p>
                      </div>
                      <span
                        style={{
                          padding: "0.2rem 0.7rem",
                          borderRadius: "20px",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          background: `${statusColor(section.getStatus(item))}20`,
                          color: statusColor(section.getStatus(item)),
                        }}
                      >
                        {section.getStatus(item)}
                      </span>
                    </div>
                  ))}
                  {section.items.length === 0 && (
                    <p
                      style={{
                        color: "#4b5563",
                        fontSize: "0.85rem",
                        textAlign: "center",
                        padding: "1rem 0",
                      }}
                    >
                      {section.icon} No data yet
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups */}
        {active === "groups" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2 style={{ margin: 0, fontWeight: "900", color: "#fff", fontSize: "1.8rem" }}>
                My Groups
              </h2>
              <button
                onClick={() => setShowCreate(!showCreate)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#fff",
                  fontWeight: "800",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Create Group
              </button>
            </div>

            {showCreate && (
              <div
                style={{
                  background: "#12122a",
                  border: "1px solid #2d2d4e",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ margin: "0 0 1rem", color: "#fff", fontWeight: "800" }}>
                  Create New Group
                </h3>
                <form onSubmit={handleCreate}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    {[
                      ["Group Name", "name", "text", "e.g. Office Thrift 2026"],
                      ["Description", "description", "text", "Optional"],
                      [`Amount (${createSymbol})`, "contributionAmount", "number", "e.g. 10000"],
                      ["Total Members", "totalMembers", "number", "e.g. 10"],
                      ["Start Date", "startDate", "date", ""],
                    ].map(([label, key, type, ph]) => (
                      <div key={key}>
                        <label
                          style={{
                            display: "block",
                            color: "#a0a0c0",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            letterSpacing: "1px",
                            marginBottom: "6px",
                            textTransform: "uppercase",
                          }}
                        >
                          {label}
                        </label>
                        <input
                          type={type}
                          placeholder={ph}
                          required={key !== "description"}
                          value={createForm[key]}
                          onChange={(e) => setCreateForm({ ...createForm, [key]: e.target.value })}
                          style={inputStyle}
                        />
                      </div>
                    ))}
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#a0a0c0",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        Frequency
                      </label>
                      <select
                        value={createForm.frequency}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, frequency: e.target.value })
                        }
                        style={inputStyle}
                      >
                        {["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "BIMONTHLY"].map((f) => (
                          <option key={f} value={f} style={{ background: "#1a1a2e" }}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "#a0a0c0",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          letterSpacing: "1px",
                          marginBottom: "6px",
                          textTransform: "uppercase",
                        }}
                      >
                        Currency
                      </label>
                      <select
                        value={createForm.currency}
                        onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
                        style={inputStyle}
                      >
                        {currencies.map((c) => (
                          <option key={c.code} value={c.code} style={{ background: "#1a1a2e" }}>
                            {c.symbol} {c.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {createError && (
                    <div style={{ ...errorBoxStyle, marginTop: "1.25rem", marginBottom: 0 }}>
                      {createError}
                    </div>
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
                      onClick={() => setShowCreate(false)}
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
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1rem",
              }}
            >
              {groups.map((g, i) => (
                <div
                  key={g.id}
                  style={{
                    background: "#12122a",
                    border: "1px solid #1e1e3a",
                    borderRadius: "16px",
                    padding: "1.25rem",
                    borderTop: `3px solid ${cardColors[i % cardColors.length]}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <h3 style={{ margin: 0, color: "#fff", fontWeight: "800", fontSize: "1rem" }}>
                      {g.name}
                    </h3>
                    <span
                      style={{
                        padding: "0.2rem 0.6rem",
                        borderRadius: "20px",
                        fontSize: "0.7rem",
                        fontWeight: "700",
                        background: `${statusColor(g.status)}20`,
                        color: statusColor(g.status),
                      }}
                    >
                      {g.status}
                    </span>
                  </div>
                  {g.description && (
                    <p style={{ margin: "0 0 0.75rem", color: "#6b7280", fontSize: "0.85rem" }}>
                      {g.description}
                    </p>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    {[
                      ["Amount", formatMoney(g.contributionAmount, g.currency)],
                      ["Members", `${g.memberIds?.length || 0}/${g.totalMembers}`],
                      ["Cycle", `${g.currentCycle}/${g.totalCycles}`],
                      ["Frequency", g.frequency],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        style={{
                          background: "#0a0a1a",
                          borderRadius: "8px",
                          padding: "0.5rem 0.75rem",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            color: "#6b7280",
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {label}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            color: "#fff",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                          }}
                        >
                          {val}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {groups.length === 0 && (
                <div
                  style={{
                    gridColumn: "1/-1",
                    textAlign: "center",
                    padding: "3rem",
                    color: "#4b5563",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👥</div>
                  <p>No groups yet. Create your first thrift group!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contributions */}
        {active === "contributions" && (
          <div>
            <h2
              style={{ margin: "0 0 1.5rem", fontWeight: "900", color: "#fff", fontSize: "1.8rem" }}
            >
              My Contributions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {contributions.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "#12122a",
                    border: "1px solid #1e1e3a",
                    borderRadius: "14px",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: `3px solid ${statusColor(c.status)}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: `${statusColor(c.status)}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      💳
                    </div>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontWeight: "700" }}>
                        {formatMoney(c.amount, c.currency)}
                      </p>
                      <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem" }}>
                        Cycle {c.cycleNumber} · {c.currency}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: `${statusColor(c.status)}20`,
                        color: statusColor(c.status),
                      }}
                    >
                      {c.status}
                    </span>
                    {c.dueDate && (
                      <p style={{ margin: "0.25rem 0 0", color: "#4b5563", fontSize: "0.75rem" }}>
                        Due: {new Date(c.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {contributions.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#4b5563" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💳</div>
                  <p>No contributions yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payouts */}
        {active === "payouts" && (
          <div>
            <h2
              style={{ margin: "0 0 1.5rem", fontWeight: "900", color: "#fff", fontSize: "1.8rem" }}
            >
              My Payouts
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {payouts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    background: "#12122a",
                    border: "1px solid #1e1e3a",
                    borderRadius: "14px",
                    padding: "1rem 1.25rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: `3px solid ${statusColor(p.status)}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(16,185,129,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      💸
                    </div>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontWeight: "700" }}>
                        {formatMoney(p.amount, p.currency)}
                      </p>
                      <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem" }}>
                        Cycle {p.cycleNumber} · {p.currency}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        background: `${statusColor(p.status)}20`,
                        color: statusColor(p.status),
                      }}
                    >
                      {p.status}
                    </span>
                    {p.scheduledDate && (
                      <p style={{ margin: "0.25rem 0 0", color: "#4b5563", fontSize: "0.75rem" }}>
                        Scheduled: {new Date(p.scheduledDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {payouts.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "#4b5563" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💸</div>
                  <p>No payouts yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Currencies */}
        {active === "currencies" && (
          <div>
            <h2
              style={{ margin: "0 0 1.5rem", fontWeight: "900", color: "#fff", fontSize: "1.8rem" }}
            >
              Currencies
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {currencies.map((c, i) => (
                <div
                  key={c.code}
                  style={{
                    background: "#12122a",
                    border: "1px solid #1e1e3a",
                    borderRadius: "14px",
                    padding: "1.25rem",
                    borderTop: `3px solid ${cardColors[i % cardColors.length]}`,
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 0.25rem",
                      fontWeight: "900",
                      fontSize: "1.8rem",
                      color: cardColors[i % cardColors.length],
                    }}
                  >
                    {c.symbol}
                  </p>
                  <p style={{ margin: 0, color: "#fff", fontWeight: "800" }}>{c.code}</p>
                  <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.8rem" }}>
                    {c.name}
                  </p>
                  <p
                    style={{
                      margin: "0.75rem 0 0",
                      color: COLORS.green,
                      fontSize: "0.9rem",
                      fontWeight: "700",
                    }}
                  >
                    {formatMoney(c.exchangeRate, "NGN", { maximumFractionDigits: 4 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile */}
        {active === "profile" && (
          <div>
            <h2
              style={{ margin: "0 0 1.5rem", fontWeight: "900", color: "#fff", fontSize: "1.8rem" }}
            >
              My Profile
            </h2>
            <div
              style={{
                background: "#12122a",
                border: "1px solid #1e1e3a",
                borderRadius: "20px",
                padding: "2rem",
                maxWidth: "500px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "900",
                    color: "#fff",
                    fontSize: "1.5rem",
                  }}
                >
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: "#fff", fontWeight: "900" }}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p style={{ margin: "0.25rem 0 0", color: "#6b7280" }}>{user.email}</p>
                </div>
              </div>

              {[
                { label: "Email", value: user.email, icon: "📧" },
                { label: "User ID", value: user.id, icon: "🔑" },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.75rem 0",
                    borderBottom: "1px solid #1e1e3a",
                  }}
                >
                  <span style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                    {icon} {label}
                  </span>
                  <span style={{ color: "#fff", fontSize: "0.85rem" }}>{value}</span>
                </div>
              ))}

              <a
                href="https://wa.me/2348000000000?text=Hello%2C%20I%20need%20support%20with%20the%20Thrift%20System%20app"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.9rem",
                  background: "rgba(37,211,102,0.1)",
                  border: "1px solid rgba(37,211,102,0.3)",
                  borderRadius: "12px",
                  color: "#25d366",
                  textDecoration: "none",
                  fontWeight: "700",
                  marginTop: "1.5rem",
                  fontSize: "0.9rem",
                }}
              >
                💬 Contact Support on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

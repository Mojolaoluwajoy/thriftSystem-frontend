import Avatar from "./Avatar";
import { pageTitleStyle } from "./theme";

const SUPPORT_URL =
  "https://wa.me/2348000000000?text=Hello%2C%20I%20need%20support%20with%20the%20Thrift%20System%20app";

export default function ProfileTab({ user }) {
  const details = [
    { label: "Email", value: user.email, icon: "📧" },
    { label: "User ID", value: user.id, icon: "🔑" },
  ];

  return (
    <div>
      <h2 style={pageTitleStyle}>My Profile</h2>
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
          style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "2rem" }}
        >
          <Avatar user={user} size="72px" fontSize="1.5rem" fontWeight="900" />
          <div>
            <h3 style={{ margin: 0, color: "#fff", fontWeight: "900" }}>
              {user.firstName} {user.lastName}
            </h3>
            <p style={{ margin: "0.25rem 0 0", color: "#6b7280" }}>{user.email}</p>
          </div>
        </div>

        {details.map(({ label, value, icon }) => (
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
          href={SUPPORT_URL}
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
  );
}

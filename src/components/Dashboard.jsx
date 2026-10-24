import { useState } from "react";
import ContributionsTab from "./dashboard/ContributionsTab";
import CurrenciesTab from "./dashboard/CurrenciesTab";
import GroupsTab from "./dashboard/GroupsTab";
import OverviewTab from "./dashboard/OverviewTab";
import PayoutsTab from "./dashboard/PayoutsTab";
import ProfileTab from "./dashboard/ProfileTab";
import Sidebar from "./dashboard/Sidebar";
import { errorBoxStyle } from "./dashboard/theme";
import useDashboardData from "./dashboard/useDashboardData";

export default function Dashboard({ user, token, onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [showCreate, setShowCreate] = useState(false);
  const { groups, contributions, payouts, currencies, status, loadError, reload, retry } =
    useDashboardData(token, onLogout);

  const handleGroupCreated = () => {
    setShowCreate(false);
    reload();
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

      <Sidebar active={active} onSelect={setActive} user={user} onLogout={onLogout} />

      <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {loadError && <LoadErrorBanner message={loadError} onRetry={retry} />}

        {active === "dashboard" && (
          <OverviewTab
            user={user}
            groups={groups}
            contributions={contributions}
            payouts={payouts}
            status={status}
          />
        )}
        {active === "groups" && (
          <GroupsTab
            token={token}
            groups={groups}
            status={status.groups}
            currencies={currencies}
            showCreate={showCreate}
            onToggleCreate={setShowCreate}
            onCreated={handleGroupCreated}
            onLogout={onLogout}
          />
        )}
        {active === "contributions" && (
          <ContributionsTab contributions={contributions} status={status.contributions} />
        )}
        {active === "payouts" && <PayoutsTab payouts={payouts} status={status.payouts} />}
        {active === "currencies" && (
          <CurrenciesTab currencies={currencies} status={status.currencies} />
        )}
        {active === "profile" && <ProfileTab user={user} />}
      </div>
    </div>
  );
}

function LoadErrorBanner({ message, onRetry }) {
  return (
    <div
      style={{
        ...errorBoxStyle,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <span>{message}</span>
      <button
        onClick={onRetry}
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
  );
}

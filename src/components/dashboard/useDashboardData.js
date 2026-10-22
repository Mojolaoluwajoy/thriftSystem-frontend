import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api";

// Loads the lists shown across the dashboard tabs and reports the latest load failure.
export default function useDashboardData(token, onLogout) {
  const [groups, setGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loadError, setLoadError] = useState("");

  // State is only set inside .then/.catch callbacks so the initial load from useEffect
  // never triggers a synchronous re-render (react-hooks/set-state-in-effect).
  const reload = useCallback(() => {
    const load = (path, setter, label) =>
      apiRequest(path, { token }).then(
        (list) => setter(list || []),
        (err) => {
          if (err.status === 401) onLogout();
          else setLoadError(`Couldn't load ${label}: ${err.message}`);
        },
      );
    load("/group/my-groups", setGroups, "groups");
    load("/contributions/my-contributions", setContributions, "contributions");
    load("/payouts/my-payouts", setPayouts, "payouts");
    load("/currencies", setCurrencies, "currencies");
  }, [token, onLogout]);

  useEffect(() => {
    reload();
  }, [reload]);

  const retry = () => {
    setLoadError("");
    reload();
  };

  return { groups, contributions, payouts, currencies, loadError, reload, retry };
}

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api";

const LISTS = ["groups", "contributions", "payouts", "currencies"];
const allLists = (value) => Object.fromEntries(LISTS.map((name) => [name, value]));

// Loads the lists shown across the dashboard tabs and reports the latest load failure.
// `status[list]` is "loading" until that list's first response, then "ready" or "error",
// so tabs can tell "still loading" and "failed" apart from "genuinely empty".
export default function useDashboardData(token, onLogout) {
  const [groups, setGroups] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [status, setStatus] = useState(() => allLists("loading"));
  const [loadError, setLoadError] = useState("");

  // State is only set inside .then/.catch callbacks so the initial load from useEffect
  // never triggers a synchronous re-render (react-hooks/set-state-in-effect).
  const reload = useCallback(() => {
    const markStatus = (name, value) => setStatus((prev) => ({ ...prev, [name]: value }));
    const load = (path, setter, name) =>
      apiRequest(path, { token }).then(
        (list) => {
          setter(list || []);
          markStatus(name, "ready");
        },
        (err) => {
          if (err.status === 401) return onLogout();
          markStatus(name, "error");
          setLoadError(`Couldn't load ${name}: ${err.message}`);
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
    // Only lists that failed go back to "loading"; loaded ones keep showing their data.
    setStatus((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([name, s]) => [name, s === "error" ? "loading" : s]),
      ),
    );
    reload();
  };

  return { groups, contributions, payouts, currencies, status, loadError, reload, retry };
}

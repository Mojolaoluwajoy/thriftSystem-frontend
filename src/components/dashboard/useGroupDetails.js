import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../../api";
import { normalizePayouts } from "./payouts";

// Loads one group with its contributions, payouts and member names.
export default function useGroupDetails(groupId, token, onLogout) {
  const [data, setData] = useState({ group: null, contributions: [], payouts: [] });
  // The group only lists member IDs, so names are looked up one by one.
  const [names, setNames] = useState({});
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  // State is only set inside .then callbacks (react-hooks/set-state-in-effect).
  const reload = useCallback(() => {
    Promise.all([
      apiRequest(`/group/${groupId}`, { token }),
      apiRequest(`/contributions/group/${groupId}`, { token }),
      apiRequest(`/payouts/group/${groupId}`, { token }),
    ]).then(
      ([group, contributions, payouts]) => {
        setData({ group, contributions: contributions || [], payouts: normalizePayouts(payouts) });
        setError("");
        setStatus("ready");
        for (const id of group.memberIds || []) {
          apiRequest(`/user/${id}`, { token }).then(
            (u) => setNames((prev) => ({ ...prev, [id]: `${u.firstName} ${u.lastName}` })),
            () => {
              // Unknown user: the table falls back to showing the ID.
            },
          );
        }
      },
      (err) => {
        if (err.status === 401) return onLogout();
        setError(err.message);
        setStatus("error");
      },
    );
  }, [groupId, token, onLogout]);

  useEffect(() => {
    reload();
  }, [reload]);

  const retry = () => {
    setStatus("loading");
    reload();
  };

  return { ...data, names, status, error, reload, retry };
}

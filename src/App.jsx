import { useCallback, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const SESSION_KEY = "thrift.session";

// Returns true if the token is a JWT whose `exp` claim is in the past.
// Non-JWT tokens are treated as valid; the server will reject them with a 401.
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};

const loadSession = () => {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session?.user && session?.token && !isTokenExpired(session.token)) return session;
  } catch {
    // Corrupt or unreadable session data: fall through and start logged out.
  }
  clearSession();
  return null;
};

const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable (e.g. private mode): the session just won't survive a reload.
  }
};

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
};

export default function App() {
  const [session, setSession] = useState(loadSession);

  const handleLogin = (userData, authToken) => {
    const next = { user: userData, token: authToken };
    saveSession(next);
    setSession(next);
  };

  // Stable identity so Dashboard's data-loading effect doesn't re-run on every render.
  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  return (
    <div>
      {!session ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={session.user} token={session.token} onLogout={handleLogout} />
      )}
    </div>
  );
}

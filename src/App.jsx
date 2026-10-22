import { useState } from "react";
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
  } catch {}
  clearSession();
  return null;
};

const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
};

const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
};

export default function App() {
  const [session, setSession] = useState(loadSession);

  const handleLogin = (userData, authToken) => {
    const next = { user: userData, token: authToken };
    saveSession(next);
    setSession(next);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

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

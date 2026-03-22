import { useEffect, useMemo, useState } from "react";
import { fetchCurrentUser, loginUser } from "./api/authApi";
import AccessDeniedPage from "./pages/AccessDeniedPage";
import AdminPage from "./pages/AdminPage";
import DoctorPage from "./pages/DoctorPage";
import LoginPage from "./pages/LoginPage";
import StaffPage from "./pages/StaffPage";
import "./App.css";

const TOKEN_KEY = "hms_access_token";

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setUser(null);
        setIsBootstrapping(false);
        return;
      }

      try {
        const profile = await fetchCurrentUser(token);
        setUser(profile);
      } catch {
        clearSession();
      } finally {
        setIsBootstrapping(false);
      }
    };

    bootstrap();
  }, [token]);

  const handleLogin = async (credentials) => {
    setIsLoggingIn(true);
    setAuthError("");
    try {
      const loginResponse = await loginUser(credentials);
      localStorage.setItem(TOKEN_KEY, loginResponse.access_token);
      setToken(loginResponse.access_token);
      const profile = await fetchCurrentUser(loginResponse.access_token);
      setUser(profile);
    } catch (err) {
      setAuthError(err.message || "Login failed");
      clearSession();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const role = useMemo(() => normalizeRole(user?.role), [user?.role]);

  if (isBootstrapping) {
    return <main className="status-screen">Loading session...</main>;
  }

  if (!token || !user) {
    return <LoginPage onLogin={handleLogin} isLoading={isLoggingIn} error={authError} />;
  }

  if (role === "admin") {
    return <AdminPage user={user} token={token} onLogout={clearSession} />;
  }

  if (role === "staff") {
    return <StaffPage user={user} token={token} onLogout={clearSession} />;
  }

  if (role === "doctor") {
    return <DoctorPage user={user} token={token} onLogout={clearSession} />;
  }

  return <AccessDeniedPage role={user.role} onLogout={clearSession} />;
}

export default App;

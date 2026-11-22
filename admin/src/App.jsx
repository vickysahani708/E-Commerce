import { useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin";
import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("admin-token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.token) throw new Error(result.message || "Login failed");
      const check = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/analytics`, { headers: { "auth-token": result.token } });
      if (check.status === 403) throw new Error("This account is not on the admin allowlist.");
      if (!check.ok) throw new Error("Could not verify admin access. Check backend configuration.");
      localStorage.setItem("admin-token", result.token);
      setToken(result.token);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const logout = () => { localStorage.removeItem("admin-token"); setToken(""); };

  if (!token) return <main className="login-page"><form className="login-card" onSubmit={login}>
    <p className="login-kicker">STORE MANAGEMENT</p><h1>Admin sign in</h1><p>Use an account authorized by the server administrator.</p>
    <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
    <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
    {error && <div className="login-error">{error}</div>}
    <button disabled={busy}>{busy ? "Checking access…" : "Sign in securely"}</button>
  </form></main>;

  return <><Navbar onLogout={logout} /><Admin token={token} onUnauthorized={logout} /></>;
}
export default App;

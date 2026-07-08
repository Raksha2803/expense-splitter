import { useState } from "react";
import { login } from "./api";

function LoginPage({ onLoginSuccess, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await login(email, password);
      localStorage.setItem("access_token", data.access_token);
      onLoginSuccess();
    } catch (err) {
      setError("Login failed. Check your email and password.");
    }
  }

  return (
    <div className="page-narrow">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="primary">Log in</button>
      </form>
      <p className="footer-note">
        Don't have an account?{" "}
        <button type="button" className="text-link" onClick={onSwitchToSignup}>
          Sign up
        </button>
      </p>
    </div>
  );
}

export default LoginPage;
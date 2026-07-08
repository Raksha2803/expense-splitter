import { useState } from "react";
import { signup } from "./api";

function SignupPage({ onSignupSuccess, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await signup(name, email, password);
      onSignupSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || "Could not create account.");
    }
  }

  return (
    <div className="page-narrow">
      <h2>Sign up</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="primary">Sign up</button>
      </form>
      <p className="footer-note">
        Already have an account?{" "}
        <button type="button" className="text-link" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </div>
  );
}

export default SignupPage;
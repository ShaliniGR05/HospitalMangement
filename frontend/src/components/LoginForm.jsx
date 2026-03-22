import { useState } from "react";
import "./LoginForm.css";

function LoginForm({ onLogin, isLoading, error }) {
  const [form, setForm] = useState({ user_name: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onLogin(form);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label className="field-label" htmlFor="user_name">
          Username
        </label>
        <input
          id="user_name"
          name="user_name"
          type="text"
          value={form.user_name}
          onChange={handleChange}
          required
          autoComplete="username"
        />
      </div>

      <div className="input-group">
        <label className="field-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;

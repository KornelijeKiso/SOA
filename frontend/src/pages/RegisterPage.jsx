import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

import { apiError } from "../api/responseUtils";

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "TOURIST",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(apiError(err, "Registration failed."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card form">
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="TOURIST">Tourist</option>
            <option value="GUIDE">Guide</option>
          </select>
        </div>

        <button type="submit" disabled={busy}>Register</button>

        {error && <p className="error">{error}</p>}
      </form>

      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default RegisterPage;
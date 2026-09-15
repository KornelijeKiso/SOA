import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, getMyProfile } from "../api/authApi";
import { saveToken, saveProfile } from "../auth/authStorage";

function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const loginResponse = await loginUser(form);
      const token = loginResponse.data.token;

      saveToken(token);

      const profileResponse = await getMyProfile();
      saveProfile(profileResponse.data);

      navigate("/profile");
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your email and password.");
    }
  }

  return (
    <div className="card form">
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>

        {error && <p className="error">{error}</p>}
      </form>

      <p>
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, setToken } from "../services/auth";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const data = await loginUser(form);
    setToken(data.token);
    alert("Login successful");
    navigate("/");
  } catch (error) {
    alert(error.message);
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <br /><br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <br /><br />

        <button type="submit">Login</button>
      </form>

      <p style={{ marginTop: "12px" }}>
        New user? <Link to="/signup">Create account</Link>
      </p>
    </div>
  );
};

export default Login;
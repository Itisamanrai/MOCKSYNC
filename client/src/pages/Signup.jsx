import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/auth";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
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
      await signupUser(form);
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div style={{ padding: "20px" }}>
      <h1>Signup</h1>

      <form onSubmit={handleSubmit} style={{ marginTop: "16px" }}>
        <input
          name="name"
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />
        <br />
        <br />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <br />
        <br />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        <br />
        <br />

        <button type="submit">Create Account</button>
      </form>

      <p style={{ marginTop: "12px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Signup;

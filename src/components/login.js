import React, { useState } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";

function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Fetch the user by email
      const { data } = await axios.get(
        `http://localhost:5000/users?email=${form.email}`
      );

      if (data.length === 0) {
        setError("User not found.");
        return;
      }

      const user = data[0];

      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(form.password, user.password);

      if (!isMatch) {
        setError("Invalid credentials.");
        return;
      }

      // Login successful
      console.log("User logged in:", user); // Debugging: log the user data
      setSuccess("Login successful");
      setError(null);
      localStorage.setItem("user", JSON.stringify(user));
      setForm({
        email: "",
        password: "",
      });

      // Redirect to the dashboard or home page
      window.location.href = "/dashboard"; // Adjust the path as needed
    } catch (err) {
      setError("Failed to login.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-container">
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;

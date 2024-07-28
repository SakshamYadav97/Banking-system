import React, { useState } from "react";
import axios from "axios";
import bcrypt from "bcryptjs";

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
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
      // Check if the email already exists
      const { data } = await axios.get(
        `http://localhost:5000/users?email=${form.email}`
      );

      if (data.length > 0) {
        setError("Email already exists.");
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(form.password, 10);

      // Register the new user with hashed password
      await axios.post("http://localhost:5000/users", {
        ...form,
        password: hashedPassword,
        isAdmin: false,
      });

      setSuccess("User registered successfully");
      setError(null);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setError("Failed to register user.");
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="login-container">
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Register</h2>
        <input
          name="firstName"
          placeholder="First Name"
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          placeholder="Last Name"
          value={form.lastName}
          onChange={handleChange}
          required
        />
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;

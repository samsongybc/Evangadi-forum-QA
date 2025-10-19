import axiosInstance from "../../axiosconfig";
import "./Register.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  // state for inputs
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // state for UI feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // // ✅ Local validation before sending to backend
    // if (!email.toLowerCase().endsWith(".com")) {
    //   setError("Please enter a valid email address ending with .com");
    //   return;
    // }

    // Password validation to match backend
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, include one uppercase letter, one number, and one special character"
      );
      return;
    }

    try {
      // send to backend
      const res = await axiosInstance.post("/user/register", {
        username,
        firstname: firstName,
        lastname: lastName,
        email,
        user_password: password,
      });

      // show backend message
      setSuccess(res.data.message || "Registered successfully! Redirecting...");
      setError("");

      // redirect to login
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess("");
    }
  };

  return (
    <div className="signup-container">
      <h2>Join the network</h2>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <form className="signup-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div className="name-fields">
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ cursor: "pointer" }}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <p className="policy-text">
          I agree to the <a href="/privacy">privacy policy</a> and{" "}
          <a href="/terms">terms of service</a>.
        </p>

        <button type="submit" className="signup-btn">
          Agree and Join
        </button>
      </form>

      <p className="signin-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
};

export default Register;

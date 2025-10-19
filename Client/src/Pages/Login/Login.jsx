import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosconfig";
import "./Login.css";
import { Appstate } from "../Appstate";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(Appstate);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false); //  NEW!
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/user/login", {
        email,
        user_password: password,
        rememberMe: rememberMe, //  Send to backend!
      });

      const { token, message, username, userid } = response.data;

      setSuccess(message || "Login successful!");

      // Save token
      localStorage.setItem("token", token);
      // console.log("Saved token:", token);

      // Save user in context
      setUser({ username, userid });

      // Save username and userid in localStorage
      localStorage.setItem("username", JSON.stringify(username));
      localStorage.setItem("userid", userid);

      // Redirect to home
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to your account</h2>
      <p>
        Don't have an account?{" "}
        <Link to="/register" className="link-highlight">
          Create a new account
        </Link>
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        {/*  NEW: Remember Me Checkbox! */}
        <div className="remember-forgot">
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember me for 30 days</label>
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;

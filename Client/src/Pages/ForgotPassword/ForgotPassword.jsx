import React, { useState } from "react";
import axiosInstance from "../../axiosconfig";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axiosInstance.post("/user/forgot-password", {
        email,
      });

      //  If OTP sent successfully
      setMessage(response.data.message);

      //  Redirect user to Reset Password page, pass email
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong. Try again."
      );
    }
  };

  return (
    <div className="forgot-container">
      <h2>Forgot Password</h2>
      <p>Enter your email and we'll send you an OTP.</p>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Send OTP</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
};

export default ForgotPassword;

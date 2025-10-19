import React, { useState, useContext, useEffect } from "react";
import axiosInstance from "../../axiosconfig";
import "./QuestionPage.css";
import { Appstate } from "../Appstate";
import { useNavigate } from "react-router-dom";

const QuestionPage = () => {
const navigate = useNavigate();
const { user, setUser } = useContext(Appstate);

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUsername = localStorage.getItem("username");
        const savedUserid = localStorage.getItem("userid");

        // no username or token? redirect
        if (!token || !savedUsername) {
          navigate("/login");
          return;
        }
        // set user in context if missing
        if (!user?.username) {
          setUser({ username: savedUsername, userid: savedUserid });
        }
        await axiosInstance.get("/user/checkUser", {
          headers: { Authorization: "Bearer " + token },
        });
      } catch (err) {
        console.error("Token check failed:", err.response?.data || err.message);
        navigate("/login");
      }
    };
    verifyUser();
  }, [user, setUser, navigate]);

  //  Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title || !description || !tag) {
      setMessage("All fields are required!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axiosInstance.post(
        "/question",
        { title, tag, description },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      setMessage(
        data.message ||
          "Question posted successfully! Redirecting to Home page..."
      );
      setTitle("");
      setTag("");
      setDescription("");

      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to post question");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="question-page">
      <div className="steps-section">
        <h2>Steps To Write A Good Question</h2>
        <ul>
          <li>🟣 Summarize your problem in a one-line title.</li>
          <li>🟣 Describe your problem in detail.</li>
          <li>🟣 Explain what you tried and what you expected to happen.</li>
          <li>🟣 Review your question before posting it.</li>
        </ul>
      </div>

      <div className="form-section">
        <h2>Post Your Question</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Question title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tag (e.g. javascript, react, sql)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <textarea
            placeholder="Question detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button type="submit">Post Question</button>
        </form>
        {message && <p className="q_msg">{message}</p>}
      </div>
    </div>
  );
};

export default QuestionPage;

import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosconfig";
import { Appstate } from "../Appstate";
import { FaUserCircle } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import "./AnswerPage.css";

const AnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(Appstate);

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Helper: safely format relative time
  const getTimeAgo = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) return "";
    const distance = formatDistanceToNow(parsedDate, { addSuffix: true });
    return distance === "less than a minute ago" ? "now" : distance;
  };

  // Verify user
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const res = await axiosInstance.get("/user/checkUser", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({ username: res.data.username, userid: res.data.userid });
      } catch {
        navigate("/login");
      }
    };
    verifyUser();
  }, [navigate, setUser]);

  // Fetch question + answers
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const qRes = await axiosInstance.get(`/question/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuestion(qRes.data.data);

        const aRes = await axiosInstance.get(`/answer/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnswers(Array.isArray(aRes.data.data) ? aRes.data.data : []);
      } catch {
        setError("Failed to load question or answers.");
      }
    };
    fetchData();
  }, [id]);

  // Post a new answer
  const handlePostAnswer = async () => {
    if (!newAnswer.trim()) {
      setError("Please enter an answer before posting.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in to post an answer.");
      return navigate("/login");
    }

    try {
      const res = await axiosInstance.post(
        `/answer/${id}`,
        { answer: newAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newAns = {
        ...res.data.data,
        username: user.username,
        created_at: res.data.data.created_at || new Date().toISOString(),
      };

      setAnswers([newAns, ...answers]);
      setNewAnswer("");
      setMessage("Answer posted successfully!");
      setError("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error posting answer:", err);
      setError(err.response?.data?.message || "Server error");
    }
  };

  // Delete answer
  const deleteAnswer = async (answerid) => {
    if (!window.confirm("Are you sure you want to delete this answer?")) return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/answer/${answerid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnswers((prev) => prev.filter((a) => a.answerid !== answerid));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error deleting answer");
    }
  };

  return (
    <div className="answer-container">
      {question && (
        <div className="question-box">
          <h3>QUESTION</h3>
          <h4>{question.title}</h4>
          <p>{question.description}</p>
        </div>
      )}

      <h3>Answers ({answers.length})</h3>
      <div className="answers-list">
        {answers.length > 0 ? (
          answers.map((ans) => {
            const isOwner = Number(ans.userid) === Number(user.userid);
            return (
              <div key={ans.answerid} className="answer-card">
                <FaUserCircle className="user-icon" />
                <div className="answer-content">
                  <strong>{ans.username}</strong> •{" "}
                  <span className="answer-time">
                    {getTimeAgo(ans.created_at)}
                  </span>
                  <p>{ans.answer}</p>
                  {/* Edit/Delete buttons for owner */}
                  {isOwner && (
                    <div className="answer-actions">
                      <button
                        className="edit-btn"
                        onClick={() =>
                          navigate(`/answer/${id}/edit/${ans.answerid}`)
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteAnswer(ans.answerid)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p>No answers yet. Be the first!</p>
        )}
      </div>

      <div className="answer-form">
        <textarea
          placeholder="Your answer ..."
          value={newAnswer}
          onChange={(e) => {
            setNewAnswer(e.target.value);
            setError("");
          }}
        />
        <button onClick={handlePostAnswer}>Post Answer</button>
        {message && <p className="msg success">{message}</p>}
        {error && <p className="msg error">{error}</p>}
      </div>
    </div>
  );
};

export default AnswerPage;

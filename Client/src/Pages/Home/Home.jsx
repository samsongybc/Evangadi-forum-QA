import React, { useContext, useState, useEffect } from "react";
import { Appstate } from "../Appstate";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axiosconfig";

const Home = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(Appstate);

  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUsername = localStorage.getItem("username");
        const savedUserid = localStorage.getItem("userid");

        if (!token || !savedUsername) {
          navigate("/login");
          return;
        }

        if (!user?.username) {
          setUser({ username: savedUsername, userid: Number(savedUserid) });
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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/question", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setQuestions(res.data.data.reverse());
      } catch (err) {
        console.error(
          "Error fetching questions:",
          err.response?.data || err.message
        );
      }
    };
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  const visibleQuestions = filteredQuestions.slice(0, visibleCount);

  const deleteQuestion = async (e, questionid) => {
    e.stopPropagation(); // prevent navigation to answer page
    if (!window.confirm("Are you sure you want to delete this question?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.delete(`/question/${questionid}`, {
        headers: { Authorization: "Bearer " + token },
      });
      setQuestions((prev) => prev.filter((q) => q.questionid !== questionid));
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error deleting question");
    }
  };

  return (
    <div className="home-container">
      <h2 className="wellcom_msg">
        Welcome: <span className="username">{user?.username}</span>
      </h2>

      <div className="ask-section">
        <button className="ask-btn" onClick={() => navigate("/QuestionPage")}>
          Ask Question
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search question"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="questions-list">
        {visibleQuestions.map((q) => (
          <div
            key={q.questionid}
            className="question-item"
            onClick={() => navigate(`/answer/${q.questionid}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="question-left">
              <div className="avatar">👤</div>
              <div>
                <div className="question-text">{q.title}</div>
                <div className="author">
                  {q.username} &nbsp;•&nbsp;{" "}
                  <span className="date">
                    {new Date(q.created_at).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit/Delete buttons for question owner */}
            {Number(q.userid) === Number(user?.userid) && (
              <div className="question-actions">
                <button
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/QuestionPage/${q.questionid}/edit`);
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => deleteQuestion(e, q.questionid)}
                >
                  Delete
                </button>
              </div>
            )}

            <div className="arrow">➡</div>
          </div>
        ))}
      </div>

      {visibleCount < filteredQuestions.length && (
        <div className="see-more-container">
          <button
            className="see-more-btn"
            onClick={() => setVisibleCount((prev) => prev + 5)}
          >
            See More
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../axiosconfig";
import styles from "./EditAnswerPage.module.css";

const EditAnswerPage = () => {
  const { id: questionid, answerid } = useParams();
  const navigate = useNavigate();

  const [answerText, setAnswerText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!answerid) {
      setError("No Answer ID provided in URL");
      setLoading(false);
      return;
    }

    const fetchAnswer = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/answer/${answerid}`, {
          headers: { Authorization: "Bearer " + token },
        });

        setAnswerText(res.data.data.answerText || "");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch answer");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswer();
  }, [answerid]);

  const handleUpdate = async () => {
    if (!answerText.trim()) {
      setError("Answer cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/answer/${answerid}`,
        { answerText },
        { headers: { Authorization: "Bearer " + token } }
      );
      navigate(`/answer/${questionid}`);
    } catch (err) {
      console.error(err);
      setError("Failed to update answer");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.editAnswerContainer}>
      <h2>Edit Answer</h2>
      {error && <p className={styles.error}>{error}</p>}{" "}
      {/* show error above */}
      <textarea
        className={styles.textarea}
        value={answerText}
        onChange={(e) => {
          setAnswerText(e.target.value);
          if (error) setError(""); // clear error on typing
        }}
        rows={5}
        placeholder="Update your answer..."
      />
      <button className={styles.updateBtn} onClick={handleUpdate}>
        Update Answer
      </button>
    </div>
  );
};

export default EditAnswerPage;

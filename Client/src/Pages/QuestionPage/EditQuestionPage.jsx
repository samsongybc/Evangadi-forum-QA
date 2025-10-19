// import { useParams, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import axiosInstance from "../../axiosconfig";
// import styles from "./EditQuestionPage.module.css"; // ✅ CSS module import

// const EditQuestionPage = () => {
//   const { questionid } = useParams();
//   const navigate = useNavigate();

//   const [title, setTitle] = useState("");
//   const [tag, setTag] = useState("");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!questionid) {
//       setError("No Question ID provided in URL");
//       setLoading(false);
//       return;
//     }

//     async function fetchQuestion() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axiosInstance.get(`/question/${questionid}`, {
//           headers: { Authorization: "Bearer " + token },
//         });

//         const q = res.data.data;
//         setTitle(q.title);
//         setTag(q.tag);
//         setDescription(q.description);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch question");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchQuestion();
//   }, [questionid]);

//   const handleUpdate = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       await axiosInstance.put(
//         `/question/${questionid}`,
//         { title, tag, description },
//         { headers: { Authorization: "Bearer " + token } }
//       );
//       navigate("/home");
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update question");
//     }
//   };

//   if (loading) return <p className={styles.loading}>Loading...</p>;
//   if (error) return <p className={styles.error}>{error}</p>;

//   return (
//     <div className={styles.container}>
//       <h2 className={styles.title}>Edit Question</h2>
//       <input
//         className={styles.input}
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         placeholder="Question title"
//       />
//       <input
//         className={styles.input}
//         value={tag}
//         onChange={(e) => setTag(e.target.value)}
//         placeholder="Tag (e.g. javascript)"
//       />
//       <textarea
//         className={styles.textarea}
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         rows={5}
//         placeholder="Question description"
//       />
//       <button className={styles.updateBtn} onClick={handleUpdate}>
//         Update Question
//       </button>
//     </div>
//   );
// };

// export default EditQuestionPage;

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../axiosconfig";
import styles from "./EditQuestionPage.module.css";

const EditQuestionPage = () => {
  const { questionid } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Store original values for change detection
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalTag, setOriginalTag] = useState("");
  const [originalDescription, setOriginalDescription] = useState("");

  useEffect(() => {
    if (!questionid) {
      setMessage({ type: "error", text: "No Question ID provided in URL" });
      setLoading(false);
      return;
    }

    const fetchQuestion = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get(`/question/${questionid}`, {
          headers: { Authorization: "Bearer " + token },
        });

        const q = res.data.data;
        setTitle(q.title);
        setTag(q.tag);
        setDescription(q.description);

        // Save original values
        setOriginalTitle(q.title);
        setOriginalTag(q.tag);
        setOriginalDescription(q.description);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Failed to fetch question" });
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionid]);

  const handleUpdate = async () => {
    if (!title.trim() || !tag.trim() || !description.trim()) {
      setMessage({ type: "error", text: "All fields are required" });
      return;
    }

    // Detect no changes
    if (
      title.trim() === originalTitle.trim() &&
      tag.trim() === originalTag.trim() &&
      description.trim() === originalDescription.trim()
    ) {
      setMessage({ type: "error", text: "No changes made to the question" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axiosInstance.put(
        `/question/${questionid}`,
        { title, tag, description },
        { headers: { Authorization: "Bearer " + token } }
      );

      setMessage({ type: "success", text: "Question updated successfully!" });
      setTimeout(() => navigate("/home"), 2000);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update question" });
    }
  };

  if (loading) return <p className={styles.message}>Loading...</p>;

  return (
    <div className={styles.container}>
      {message.text && (
        <p className={message.type === "error" ? styles.error : styles.success}>
          {message.text}
        </p>
      )}

      <h2 className={styles.title}>Edit Question</h2>
      <input
        className={styles.input}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Question title"
      />
      <input
        className={styles.input}
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Tag (e.g. javascript)"
      />
      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        placeholder="Question description"
      />
      <button className={styles.updateBtn} onClick={handleUpdate}>
        Update Question
      </button>
    </div>
  );
};

export default EditQuestionPage;

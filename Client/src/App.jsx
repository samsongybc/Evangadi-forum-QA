import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import Footer from "./Components/Footer/Footer.jsx";
import Header from "./Components/Header/Header.jsx";
import Register from "./Pages/Register/Register.jsx";
import Login from "./Pages/Login/Login.jsx";
import Home from "./Pages/Home/Home.jsx";
import About from "./Pages/About/About.jsx";
import { useEffect,useState, } from "react";
import axiosInstance from "./axiosconfig.js";
import { Appstate } from "./Pages/Appstate.js";
import QuestionPage from "./Pages/QuestionPage/QuestionPage.jsx";
import AnswerPage from "./Pages/AnswerPage/AnswerPage.jsx";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "./Pages/ResetPassword/ResetPassword.jsx";
import EditQuestionPage from "./Pages/QuestionPage/EditQuestionPage.jsx";
import EditAnswerPage from "./Pages/AnswerPage/EditAnswerPage.jsx";


function App() {
  const [user, setUser] = useState(null); 
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  async function checkUser() {
    try {
      const { data } = await axiosInstance.get("/user/checkUser", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      setUser(data); 
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
      navigate("/login");
    }
  }

  useEffect(() => {
    if (token) {
      checkUser();
    } else {
      setUser(null);
    }
  }, [token]); // re-run when token changes

  const path = location.pathname.toLowerCase();
  const showAbout =
    path === "/" || path.startsWith("/register") || path.startsWith("/login");

  return (
    <Appstate.Provider value={{ user, setUser }}>
      <Header />
      <div className="app-container" style={{ display: "flex", gap: "20px" }}>
        <div className="form-container" style={{ flex: 2 }}>
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/QuestionPage" element={<QuestionPage />} />
            <Route path="/answer/:id" element={<AnswerPage />} />
            <Route path="/forgot-Password" element={<ForgotPassword />} />
            <Route path="/reset-Password" element={<ResetPassword />} />
            <Route path="/QuestionPage/:questionid/edit"
              element={<EditQuestionPage />}
              caseSensitive={false}
            />
            <Route
              path="/answer/:id/edit/:answerid"
              element={<EditAnswerPage />}
            />
          </Routes>
        </div>
        {showAbout && (
          <div className="about-container" style={{ flex: 1 }}>
            <About />
          </div>
        )}
      </div>
      <Footer />
    </Appstate.Provider>
  );
}


export default App;

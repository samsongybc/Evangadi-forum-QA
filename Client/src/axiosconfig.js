import axios from "axios";

// Use environment variable for base URL, fallback to localhost for development
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: baseURL,
});

export default axiosInstance;

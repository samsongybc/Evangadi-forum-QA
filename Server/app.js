const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

// Add CLIENT_URL from .env if it exists
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// Debug log to verify CORS configuration
console.log("🔒 CORS Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// database connection
const dbconnection = require("./Database/databaseconfig");

// user routes middleware file
const userRoutes = require("./routes/userroutes");

// user routes middleware
app.use("/api/user", userRoutes);

// Question routes middleware file
const questionRoutes = require("./routes/questionRoute");

// Question routes middleware
app.use("/api/question", questionRoutes);

// answer routes middleware file
const answerRoutes = require("./routes/answerRoute");

// answer routes middleware
app.use("/api/answer", answerRoutes);

async function start() {
  try {
    // Test database connection
    await dbconnection.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL database (Supabase)!");

    const server = app.listen(PORT);
    console.log(`🚀 Server is running on port ${PORT}`);

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`\n💡 Solutions:`);
        console.error(`   1. Kill the process using the port:`);
        console.error(`      Windows: netstat -ano | findstr :${PORT}`);
        console.error(`               taskkill /PID <PID> /F`);
        console.error(`   2. Or use a different port in your .env file:`);
        console.error(`      PORT=5001\n`);
        process.exit(1);
      } else {
        console.error("Server error:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ DB connection failed:", error.message);
    process.exit(1);
  }
}
start();

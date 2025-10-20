const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const dbconnection = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

// Test connection
dbconnection.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database!");
});

dbconnection.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

module.exports = dbconnection;

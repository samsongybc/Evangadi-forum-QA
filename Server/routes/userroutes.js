const express = require("express");
const router = express.Router();


// auth middleware
const authmiddleware = require("../middleware/authmiddleware");

// user controller
const {
  register,
  login,
  checkuser,
  resetPassword,
  forgotPassword,
} = require("../controllers/usercontrollers");

// Register route
router.post("/register", register);

//  login route
router.post("/login", login);

// user checking route
router.get("/checkUser", authmiddleware, checkuser);

// Forgot Password
router.post("/forgot-Password", forgotPassword);

// Reset Password
router.post("/reset-Password", resetPassword);
module.exports = router;

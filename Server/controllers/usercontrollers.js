// // database connection
// const dbconnection = require("../Database/databaseconfig");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const sendEmail =require("../utils/emailSender")
// async function register(req, res) {
//   const { username, firstname, lastname, email, user_password } = req.body;
//   if (!username) {
//     return res.status(400).json({ message: "Please Enter Your User Name" });
//   }
//   if (!firstname) {
//     return res.status(400).json({ message: "Please Enter Your firstname" });
//   }
//   if (!lastname) {
//     return res.status(400).json({ message: "Please Enter Your lastname" });
//   }
//   if (!email) {
//     return res.status(400).json({ message: "Please Enter Your email" });
//   }
//   if (!user_password) {
//     return res.status(400).json({ message: "Please Enter Your password" });
//   }

//   try {
//     const [usernameValidation] = await dbconnection.query(
//       "SELECT * FROM users WHERE username= ?",
//       [username]
//     );

//     const [emailValidation] = await dbconnection.query(
//       "SELECT * FROM users WHERE email=?",
//       [email]
//     );

//     if (usernameValidation.length > 0) {
//       return res
//         .status(400)
//         .json({ status: "Failed ", message: "Username Already Exists" });
//     }

//     if (emailValidation.length > 0) {
//       return res
//         .status(400)
//         .json({ status: "Failed ", message: "Email Already in Use" });
//     }

//     if (user_password.length <= 8) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 8 characters" });
//     }
//     // Hash the password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(user_password, saltRounds);

//     await dbconnection.query(
//       "INSERT INTO users (username, firstname, lastname, email, user_password) VALUES (?, ?, ?, ?, ?)",
//       [username, firstname, lastname, email, hashedPassword]
//     );
//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// async function login(req, res) {
//   const { email, user_password, rememberMe } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: "Email is empty" });
//   }
//   if (!user_password) {
//     return res.status(400).json({ message: "password is empty" });
//   }

//   try {
//     const [rows] = await dbconnection.query(
//       "SELECT username,userid,user_password FROM users WHERE email = ?",
//       [email]
//     );

//     if (rows.length === 0) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }
//     const user = rows[0];
//     const passwordMatch = await bcrypt.compare(
//       user_password,
//       user.user_password
//     );

//     if (!passwordMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const username = rows[0].username;
//     const userid = rows[0].userid;

//     const expiresIn = rememberMe ? "30d" : "1d";

//     const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
//       expiresIn: expiresIn,
//     });

//     return res.status(200).json({
//       msg: "user login successful",
//       token,
//       username,
//       userid,
//     });
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }
// async function checkuser(req, res) {
//   const username = req.user.username;
//   const userid = req.user.userid;
//   res.json({ message: "user is logged in", username, userid });
// }

// // ------------------- Forgot Password -------------------
// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     // Check if user exists
//     const [rows] = await dbconnection.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     if (rows.length === 0)
//       return res.status(404).json({ message: "Email not found" });

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000);

//     // Save OTP + expiration (5 mins)
//     await dbconnection.query(
//       "UPDATE users SET reset_otp = ?, otp_expiration = DATE_ADD(NOW(), INTERVAL 5 MINUTE) WHERE email = ?",
//       [otp, email]
//     );

//     // Send OTP email
//     try {
//       await sendEmail(
//         email,
//         "Your OTP Code",
//         `<p>Your OTP is: <b>${otp}</b></p>`
//       );
//     } catch (emailErr) {
//       console.error("Email sending failed:", emailErr);
//       return res.status(500).json({ message: "Failed to send OTP email" });
//     }
//     res.json({ message: "OTP sent to your email ." });
//   } catch (err) {
//     console.error("Forgot password error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ------------------- Reset Password -------------------
//  const resetPassword = async (req, res) => {
//   const { email, otp, newPassword } = req.body;
//   if (!email || !otp || !newPassword) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   try {
//     // Verify OTP
//     const [user] = await dbconnection.query(
//       "SELECT * FROM users WHERE email = ? AND reset_otp = ?",
//       [email, otp]
//     );

//     if (user.length === 0) return res.status(400).json({ message: "Invalid OTP" });

//     // Check if OTP expired
//     const otpExpiration = new Date(user[0].otp_expiration);
//     if (otpExpiration < new Date()) return res.status(400).json({ message: "OTP has expired" });

//     // Hash new password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

//     // Update password and clear OTP
//     await dbconnection.query(
//       "UPDATE users SET user_password = ?, reset_otp = NULL, otp_expiration = NULL WHERE email = ?",
//       [hashedPassword, email]
//     );

//     res.json({ message: "Password reset successful! You can now login." });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// module.exports = {
//   register,
//   login,
//   checkuser,
//   resetPassword,
//   forgotPassword
// };

// database connection
const dbconnection = require("../Database/databaseconfig");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailSender");
async function register(req, res) {
  let { username, firstname, lastname, email, user_password } = req.body;

  //  Combined empty field checks
  const errors = [];
  if (!username) errors.push("Username is required");
  if (!firstname) errors.push("Firstname is required");
  if (!lastname) errors.push("Lastname is required");
  if (!email) errors.push("Email is required");
  if (!user_password) errors.push("Password is required");

  if (errors.length) {
    return res.status(400).json({ message: "Validation error", errors });
  }

  //  Stronger password validation
  if (user_password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

  if (!/[A-Z]/.test(user_password)) {
    return res.status(400).json({
      message: "Password must include at least one uppercase letter",
    });
  }

  if (!/\d/.test(user_password)) {
    return res.status(400).json({
      message: "Password must include at least one number",
    });
  }

  if (!/[@$!%?&]/.test(user_password)) {
    return res.status(400).json({
      message: "Password must include at least one special character (@$!%?&)",
    });
  }

  try {
    // Check username uniqueness
    const usernameValidation = await dbconnection.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    // Check email uniqueness
    const emailValidation = await dbconnection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (usernameValidation.rows.length > 0) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Username Already Exists" });
    }

    if (emailValidation.rows.length > 0) {
      return res
        .status(400)
        .json({ status: "Failed", message: "Email Already in Use" });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user_password, saltRounds);

    // Insert new user into database
    await dbconnection.query(
      "INSERT INTO users (username, firstname, lastname, email, user_password) VALUES ($1, $2, $3, $4, $5)",
      [username, firstname, lastname, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function login(req, res) {
  const { email, user_password, rememberMe } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is empty" });
  }
  if (!user_password) {
    return res.status(400).json({ message: "password is empty" });
  }

  try {
    const result = await dbconnection.query(
      "SELECT username, userid, user_password FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(
      user_password,
      user.user_password
    );

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const username = result.rows[0].username;
    const userid = result.rows[0].userid;

    const expiresIn = rememberMe ? "30d" : "1d";

    const token = jwt.sign({ username, userid }, process.env.JWT_SECRET, {
      expiresIn: expiresIn,
    });

    return res.status(200).json({
      msg: "user login successful",
      token,
      username,
      userid,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
async function checkuser(req, res) {
  const username = req.user.username;
  const userid = req.user.userid;
  res.json({ message: "user is logged in", username, userid });
}

// ------------------- Forgot Password -------------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    // Check if user exists
    const result = await dbconnection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Email not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP + expiration (5 mins)
    await dbconnection.query(
      "UPDATE users SET reset_otp = $1, otp_expiration = NOW() + INTERVAL '5 minutes' WHERE email = $2",
      [otp, email]
    );

    // Send OTP email
    try {
      await sendEmail(
        email,
        "Your OTP Code - Do not share",
        `
        <p>Hello,</p>
        <p>Your OTP code for password reset is:</p>
        <h2 style="color:blue;">${otp}</h2>
        <p><b>This OTP will expire in 5 minutes.</b></p>
        <p style="color:red;">⚠ Do not share this code with anyone for security reasons.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>Support Team</p>
        `
      );
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      return res
        .status(200)
        .json({ message: "If email exists, an OTP has been sent to inbox" });
    }

    res.json({ message: "OTP sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- Reset Password -------------------
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  // Password validation
  if (newPassword.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters long",
    });
  }

  if (!/[A-Z]/.test(newPassword)) {
    return res.status(400).json({
      message: "Password must include at least one uppercase letter",
    });
  }

  if (!/\d/.test(newPassword)) {
    return res.status(400).json({
      message: "Password must include at least one number",
    });
  }

  if (!/[@$!%?&]/.test(newPassword)) {
    return res.status(400).json({
      message: "Password must include at least one special character (@$!%?&)",
    });
  }
  try {
    // Verify OTP
    const result = await dbconnection.query(
      "SELECT * FROM users WHERE email = $1 AND reset_otp = $2",
      [email, otp]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ message: "Invalid OTP" });

    // Check if OTP expired
    const otpExpiration = new Date(result.rows[0].otp_expiration);
    if (otpExpiration < new Date())
      return res.status(400).json({ message: "OTP has expired" });

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear OTP
    await dbconnection.query(
      "UPDATE users SET user_password = $1, reset_otp = NULL, otp_expiration = NULL WHERE email = $2",
      [hashedPassword, email]
    );

    res.json({ message: "Password reset successful! You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  register,
  login,
  checkuser,
  resetPassword,
  forgotPassword,
};

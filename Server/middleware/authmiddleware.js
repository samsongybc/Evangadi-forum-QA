const jwt = require("jsonwebtoken");
async function authmiddleware(req, res, next) {
  const authheader = req.headers.authorization;
  if (!authheader || !authheader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const token = authheader.split(" ")[1];
    const { username, userid } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {username, userid}
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
module.exports = authmiddleware;

// database connection
const dbconnection = require("../Database/databaseconfig");

// GET answers
async function get_answers(req, res) {
  const { questionid } = req.params;

  if (!questionid) {
    return res.status(400).json({
      status: "error",
      message: "Invalid or missing questionid.",
    });
  }

  try {
    // Fetch answers with ISO 8601 timestamps
    const [rows] = await dbconnection.query(
      `SELECT 
         answers.answerid, 
         answers.userid, 
         answers.answer, 
         DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS created_at,
         users.username
       FROM answers
       INNER JOIN users ON answers.userid = users.userid
       WHERE answers.questionid = ? AND is_deleted = 0
       ORDER BY answers.created_at DESC`,
      [questionid]
    );

    res.status(200).json({
      status: "success",
      questionid,
      total_answers: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching answers",
      error: error.message,
    });
  }
}

// POST answer
async function post_answers(req, res) {
  try {
    const { answer } = req.body;
    const { questionid } = req.params;
    const userid = req.user.userid; // from authmiddleware

    if (!userid || !questionid || !answer) {
      return res.status(400).json({
        status: "error",
        message: "userid, questionid, and answer are required",
      });
    }

    // Check if the question exists
    const [questionRows] = await dbconnection.query(
      "SELECT * FROM questions WHERE questionid = ?",
      [questionid]
    );

    if (questionRows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Cannot post answer: question does not exist",
      });
    }

    // Insert the answer (created_at defaults to CURRENT_TIMESTAMP)
    const [result] = await dbconnection.query(
      `INSERT INTO answers (userid, questionid, answer) VALUES (?, ?, ?)`,
      [userid, questionid, answer]
    );

    // Fetch inserted answer with ISO timestamp
    const [newAnswerRows] = await dbconnection.query(
      `SELECT 
         answerid, 
         userid, 
         questionid, 
         answer, 
         DATE_FORMAT(created_at, '%Y-%m-%dT%H:%i:%s') AS created_at
       FROM answers
       WHERE answerid = ?`,
      [result.insertId]
    );

    res.status(201).json({
      status: "success",
      message: "Answer posted successfully",
      data: newAnswerRows[0], // includes created_at
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server error while creating answer",
      error: error.message,
    });
  }
}
// Update an answer
async function update_answer(req, res) {
  const { answerid } = req.params;
  const { answer } = req.body;
  const userid = req.user.userid;

  try {
    const [rows] = await dbconnection.query(
      "SELECT * FROM answers WHERE answerid = ? AND is_deleted = 0",
      [answerid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "fail", message: "Answer not found or already deleted" });
    }

    if (rows[0].userid !== userid) {
      return res.status(403).json({ status: "fail", message: "You are not allowed to update this answer" });
    }

    await dbconnection.query(
      "UPDATE answers SET answer = ? WHERE answerid = ?",
      [answer || rows[0].answer, answerid]
    );

    return res.json({ status: "success", message: "Answer updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "fail", message: "Server error" });
  }
}

// Soft Delete an answer
async function delete_answer(req, res) {
  const { answerid } = req.params;
  const userid = req.user.userid;

  try {
    const [rows] = await dbconnection.query(
      "SELECT * FROM answers WHERE answerid = ? AND is_deleted = 0",
      [answerid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "fail", message: "Answer not found or already deleted" });
    }

    if (rows[0].userid !== userid) {
      return res.status(403).json({ status: "fail", message: "You are not allowed to delete this answer" });
    }

    await dbconnection.query(
      "UPDATE answers SET is_deleted = 1 WHERE answerid = ?",
      [answerid]
    );

    return res.json({ status: "success", message: "Answer deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: "fail", message: "Server error" });
  }
}


module.exports = {
  get_answers,
  post_answers,
  update_answer,
  delete_answer,
};

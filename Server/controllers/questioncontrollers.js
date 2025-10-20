// database connection
const dbconnection = require("../Database/databaseconfig");

// GET all questions
async function get_all_questions(req, res) {
  try {
    const result = await dbconnection.query(
      `SELECT 
         questions.questionid, 
         questions.userid, 
         questions.title, 
         questions.tag,
         questions.description, 
         TO_CHAR(questions.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
         users.username,
         COUNT(answers.answerid) AS answer_count
       FROM questions
       INNER JOIN users ON questions.userid = users.userid
       LEFT JOIN answers ON questions.questionid = answers.questionid AND answers.is_deleted = 0
       WHERE questions.is_deleted = 0
       GROUP BY questions.questionid, questions.userid, questions.title, questions.tag, questions.description, questions.created_at, users.username
       ORDER BY questions.created_at DESC`
    );

    res.status(200).json({
      status: "success",
      total_questions: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching questions",
      error: error.message,
    });
  }
}

// GET single question by ID
async function get_single_question(req, res) {
  const { questionid } = req.params;

  if (!questionid) {
    return res.status(400).json({
      status: "error",
      message: "Invalid or missing questionid.",
    });
  }

  try {
    const result = await dbconnection.query(
      `SELECT 
         questions.questionid, 
         questions.userid, 
         questions.title, 
         questions.tag,
         questions.description, 
         TO_CHAR(questions.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
         users.username
       FROM questions
       INNER JOIN users ON questions.userid = users.userid
       WHERE questions.questionid = $1 AND questions.is_deleted = 0`,
      [questionid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Question not found or has been deleted",
      });
    }

    res.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching question",
      error: error.message,
    });
  }
}

// POST a new question
async function post_question(req, res) {
  try {
    const { title, tag, description } = req.body;
    const userid = req.user.userid; // from authmiddleware

    if (!userid || !title || !description) {
      return res.status(400).json({
        status: "error",
        message: "userid, title, and description are required",
      });
    }

    if (!tag) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a tag for your question",
      });
    }

    // Generate UUID for questionid
    const crypto = require("crypto");
    const questionid = crypto.randomUUID();

    // Insert the question with UUID questionid
    await dbconnection.query(
      `INSERT INTO questions (questionid, userid, title, tag, description, is_deleted) VALUES ($1, $2, $3, $4, $5, $6)`,
      [questionid, userid, title, tag, description, 0]
    );

    // Fetch the newly inserted question with ISO timestamp
    const newQuestion = await dbconnection.query(
      `SELECT 
         questions.questionid, 
         questions.userid, 
         questions.title, 
         questions.tag,
         questions.description, 
         TO_CHAR(questions.created_at, 'YYYY-MM-DD"T"HH24:MI:SS') AS created_at,
         users.username
       FROM questions
       INNER JOIN users ON questions.userid = users.userid
       WHERE questions.questionid = $1`,
      [questionid]
    );

    res.status(201).json({
      status: "success",
      message: "Question posted successfully",
      data: newQuestion.rows[0],
    });
  } catch (error) {
    console.error("Error in post_question:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
    });
    res.status(500).json({
      status: "error",
      message: "Server error while creating question",
      error: error.message,
    });
  }
}

async function update_question(req, res) {
  const { questionid } = req.params;
  const { title, description, tag } = req.body;
  const userid = req.user.userid;

  try {
    //  Check if question exists
    const result = await dbconnection.query(
      "SELECT * FROM questions WHERE questionid = $1 AND is_deleted = 0",
      [questionid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found or already deleted",
      });
    }

    //  Check if user owns this question
    if (result.rows[0].userid !== userid) {
      return res.status(403).json({
        status: "fail",
        message: "You are not allowed to update this question",
      });
    }

    //  Trim inputs to prevent false "no changes"
    const newTitle = title?.trim() ?? result.rows[0].title;
    const newDescription = description?.trim() ?? result.rows[0].description;
    const newTag = tag?.trim() ?? result.rows[0].tag;

    //  Check if nothing changed
    if (
      newTitle === result.rows[0].title &&
      newDescription === result.rows[0].description &&
      newTag === result.rows[0].tag
    ) {
      return res.json({
        status: "no_change",
        message: "No changes made to the question",
      });
    }

    //  Update only if something changed
    await dbconnection.query(
      "UPDATE questions SET title = $1, description = $2, tag = $3 WHERE questionid = $4",
      [newTitle, newDescription, newTag, questionid]
    );

    return res.json({
      status: "success",
      message: "Question updated successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "Server error",
    });
  }
}

// DELETE a question (soft delete)
async function delete_question(req, res) {
  const { questionid } = req.params;
  const userid = req.user.userid;

  try {
    const result = await dbconnection.query(
      "SELECT * FROM questions WHERE questionid = $1 AND is_deleted = 0",
      [questionid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found or already deleted",
      });
    }

    if (result.rows[0].userid !== userid) {
      return res.status(403).json({
        status: "fail",
        message: "You are not allowed to delete this question",
      });
    }

    await dbconnection.query(
      "UPDATE questions SET is_deleted = 1 WHERE questionid = $1",
      [questionid]
    );

    return res.json({
      status: "success",
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "fail",
      message: "Server error",
    });
  }
}

module.exports = {
  get_all_questions,
  get_single_question,
  post_question,
  update_question,
  delete_question,
};

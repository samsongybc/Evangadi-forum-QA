// database connection
const dbconnection = require("../Database/databaseconfig");

// GET all questions
async function get_all_questions(req, res) {
  try {
    const [rows] = await dbconnection.query(
      `SELECT 
         questions.questionid, 
         questions.userid, 
         questions.title, 
         questions.tag,
         questions.description, 
         DATE_FORMAT(questions.created_at, '%Y-%m-%dT%H:%i:%s') AS created_at,
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
      total_questions: rows.length,
      data: rows,
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
    const [rows] = await dbconnection.query(
      `SELECT 
         questions.questionid, 
         questions.userid, 
         questions.title, 
         questions.tag,
         questions.description, 
         DATE_FORMAT(questions.created_at, '%Y-%m-%dT%H:%i:%s') AS created_at,
         users.username
       FROM questions
       INNER JOIN users ON questions.userid = users.userid
       WHERE questions.questionid = ? AND questions.is_deleted = 0`,
      [questionid]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Question not found or has been deleted",
      });
    }

    res.status(200).json({
      status: "success",
      data: rows[0],
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

    // Insert the question (created_at defaults to CURRENT_TIMESTAMP)
    const [result] = await dbconnection.query(
      `INSERT INTO questions (userid, title, tag, description) VALUES (?, ?, ?, ?)`,
      [userid, title, tag, description]
    );

    // result = {
    //   fieldCount: 0,
    //   affectedRows: 1,        // How many rows were inserted
    //   insertId: 123,          // ⭐ The auto-generated ID!
    //   info: '',
    //   serverStatus: 2,
    //   warningStatus: 0,
    //   changedRows: 0
    // }

    // Fetch the newly inserted question with ISO timestamp
    const [newQuestionRows] = await dbconnection.query(
      `SELECT 
         questions.questionid, 
         questions.userid, 
         questions.title, 
         questions.tag,
         questions.description, 
         DATE_FORMAT(questions.created_at, '%Y-%m-%dT%H:%i:%s') AS created_at,
         users.username
       FROM questions
       INNER JOIN users ON questions.userid = users.userid
       WHERE questions.questionid = ?`,
      [result.insertId]
    );

    // STEP 2: Result object
    // result = {
    //   affectedRows: 1,
    //   insertId: 123, // ⭐ MySQL tells us the new ID!
    //   // ... other properties
    // };

    res.status(201).json({
      status: "success",
      message: "Question posted successfully",
      data: newQuestionRows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Server error while creating question",
      error: error.message,
    });
  }
}

// UPDATE a question
// async function update_question(req, res) {
//   const { questionid } = req.params;
//   const { title, tag, description } = req.body;
//   const userid = req.user.userid;

//   try {
//     const [rows] = await dbconnection.query(
//       "SELECT * FROM questions WHERE questionid = ? AND is_deleted = 0",
//       [questionid]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         status: "fail",
//         message: "Question not found or already deleted",
//       });
//     }

//     if (rows[0].userid !== userid) {
//       return res.status(403).json({
//         status: "fail",
//         message: "You are not allowed to update this question",
//       });
//     }

//     await dbconnection.query(
//       "UPDATE questions SET title = ?, tag = ?, description = ? WHERE questionid = ?",
//       [
//         title || rows[0].title,
//         tag || rows[0].tag,
//         description || rows[0].description,
//         questionid,
//       ]
//     );

//     return res.json({
//       status: "success",
//       message: "Question updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       status: "fail",
//       message: "Server error",
//     });
//   }
// }

async function update_question(req, res) {
  const { questionid } = req.params;
  const { title, description, tag } = req.body;
  const userid = req.user.userid;

  try {
    //  Check if question exists
    const [rows] = await dbconnection.query(
      "SELECT * FROM questions WHERE questionid = ? AND is_deleted = 0",
      [questionid]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found or already deleted",
      });
    }

    //  Check if user owns this question
    if (rows[0].userid !== userid) {
      return res.status(403).json({
        status: "fail",
        message: "You are not allowed to update this question",
      });
    }

    //  Trim inputs to prevent false "no changes"
    //  ?? rows[0].title - Nullish Coalescing
    //  The ?? operator is called "nullish coalescing"
    // If the left side is null or undefined → use the right side
    // Otherwise → use the left side

    const newTitle = title?.trim() ?? rows[0].title;
    const newDescription = description?.trim() ?? rows[0].description;
    const newTag = tag?.trim() ?? rows[0].tag;

    //  Check if nothing changed
    if (
      newTitle === rows[0].title &&
      newDescription === rows[0].description &&
      newTag === rows[0].tag
    ) {
      return res.json({
        status: "no_change",
        message: "No changes made to the question",
      });
    }

    //  Update only if something changed
    await dbconnection.query(
      "UPDATE questions SET title = ?, description = ?, tag = ? WHERE questionid = ?",
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
    const [rows] = await dbconnection.query(
      "SELECT * FROM questions WHERE questionid = ? AND is_deleted = 0",
      [questionid]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Question not found or already deleted",
      });
    }

    if (rows[0].userid !== userid) {
      return res.status(403).json({
        status: "fail",
        message: "You are not allowed to delete this question",
      });
    }

    await dbconnection.query(
      "UPDATE questions SET is_deleted = 1 WHERE questionid = ?",
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

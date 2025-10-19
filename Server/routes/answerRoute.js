const express = require("express");
const router = express.Router();
const authmiddleware = require("../middleware/authmiddleware");

// answers controller
const {
  get_answers,
  post_answers,
  update_answer,
  delete_answer,
} = require("../controllers/answercontrollers");

// get answers from  a question
router.get("/:questionid", authmiddleware, get_answers);

// post an answers from a question
// router.post("/", authmiddleware, post_answers);
// Post an answer for a question
router.post("/:questionid", authmiddleware, post_answers);

// update an answer
router.put("/:answerid", authmiddleware, update_answer);

// delete an answer
router.delete("/:answerid", authmiddleware, delete_answer);

module.exports = router;

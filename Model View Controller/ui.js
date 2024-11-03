// ui.js
const express = require("express");
const router = express.Router();
const { quizQuestions } = require("./database");

// GET route for the main page
router.get("/", async (req, res) => {
  try {
    const allQuestions = await quizQuestions.find();
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, 3);

    res.render("index", {
      questions: selectedQuestions,
      score: null,
      feedback: null,
      turnedIn: false,
    });
  } catch (error) {
    console.log("Error fetching questions:", error);
    res.status(500).send("Error fetching questions.");
  }
});

// POST route for quiz submission
router.post("/", async (req, res) => {
  const userAnswers = req.body;
  const questionsData = JSON.parse(req.body.questionsData);

  const feedback = questionsData.map((question) => {
    const correctAnswer = question.QuestionAnswers.find((answer) => answer.Correct);
    const userAnswerId = userAnswers[question._id];
    const isCorrect = correctAnswer && correctAnswer._id.toString() === userAnswerId;

    return {
      question: question.Question,
      userAnswerId,
      correctAnswer: correctAnswer ? correctAnswer.Answer : null,
      userAnswer: question.QuestionAnswers.find((answer) => answer._id.toString() === userAnswerId)?.Answer || "Not Answered",
      isCorrect,
      answers: question.QuestionAnswers,
    };
  });

  const score = feedback.filter((fb) => fb.isCorrect).length;

  res.render("index", {
    questions: questionsData,
    score: score,
    feedback: feedback,
    turnedIn: true,
  });
});

// GET route for adding a new question
router.get("/addQuestion", (req, res) => {
  res.render("addQuestion");
});

// POST route for adding a new question
router.post("/addQuestion", async (req, res) => {
  try {
    const { question, answer1, answer2, answer3, answer4, correctAnswer } = req.body;

    const answers = [
      { Answer: answer1, Correct: correctAnswer === "0" },
      { Answer: answer2, Correct: correctAnswer === "1" },
      { Answer: answer3, Correct: correctAnswer === "2" },
      { Answer: answer4, Correct: correctAnswer === "3" },
    ];

    const newQuestion = new quizQuestions({
      Question: question,
      QuestionAnswers: answers,
    });

    await newQuestion.save();
    res.redirect("/");
  } catch (error) {
    console.log("Error adding question:", error);
    res.status(500).send("Error adding question.");
  }
});

module.exports = router;

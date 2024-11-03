const express = require("express");
const bodyParser = require("body-parser");
const { eventBus, quizQuestions } = require("./database");
const { quizSubmittedHandler, addQuestionHandler } = require("./quizHandlers");

// App setup
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Default page route
app.get("/", async (req, res) => {
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

// Quiz submission route
app.post("/", (req, res) => {
  const userAnswers = req.body;
  const questionsData = JSON.parse(req.body.questionsData);

  // Event to handle quiz submission
  eventBus.emit("quizSubmitted", { userAnswers, questionsData, res });
});

// Add question page route
app.get("/addQuestion", (req, res) => {
  res.render("addQuestion");
});

// Add question route
app.post("/addQuestion", (req, res) => {
  const { question, answer1, answer2, answer3, answer4, correctAnswer } = req.body;
  const newQuestion = {
    Question: question,
    QuestionAnswers: [
      { Answer: answer1, Correct: correctAnswer === "0" },
      { Answer: answer2, Correct: correctAnswer === "1" },
      { Answer: answer3, Correct: correctAnswer === "2" },
      { Answer: answer4, Correct: correctAnswer === "3" },
    ],
  };

  // Event to handle adding a new question
  eventBus.emit("addQuestion", newQuestion);
  res.redirect("/");
});

// Register the event handlers
eventBus.on("quizSubmitted", quizSubmittedHandler);
eventBus.on("addQuestion", addQuestionHandler);

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

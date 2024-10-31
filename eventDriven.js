const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const events = require("events");

// Event Bus Setup
const eventBus = new events.EventEmitter();

// App setup
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Database connection
mongoose
  .connect("mongodb://127.0.0.1:27017/db")
  .then(() => {
    console.log("Database connected.");
    eventBus.emit("databaseConnected");
  })
  .catch((err) => console.log(err));

// Define schemas
const quizAnswersSchema = new mongoose.Schema({
  Answer: String,
  Correct: Boolean,
});

const quizQuestionsSchema = new mongoose.Schema({
  Question: String,
  QuestionAnswers: [quizAnswersSchema],
});

const quizQuestions = mongoose.model("quizQuestions", quizQuestionsSchema);

// Fill Database with data
const sampleData = [
  {
    Question: "What is the capital of France?",
    QuestionAnswers: [
      { Answer: "Paris", Correct: true },
      { Answer: "London", Correct: false },
      { Answer: "Rome", Correct: false },
      { Answer: "Berlin", Correct: false },
    ],
  },
  {
    Question: "What is the largest planet in the solar system?",
    QuestionAnswers: [
      { Answer: "Earth", Correct: false },
      { Answer: "Jupiter", Correct: true },
      { Answer: "Mars", Correct: false },
      { Answer: "Venus", Correct: false }
    ]
  },
  {
    Question: "What is the chemical symbol for water?",
    QuestionAnswers: [
      { Answer: "H2O", Correct: true },
      { Answer: "O2", Correct: false },
      { Answer: "CO2", Correct: false },
      { Answer: "HO2", Correct: false }
    ]
  },
  {
    Question: "Who wrote 'To Kill a Mockingbird'?",
    QuestionAnswers: [
      { Answer: "Harper Lee", Correct: true },
      { Answer: "Mark Twain", Correct: false },
      { Answer: "J.K. Rowling", Correct: false },
      { Answer: "George Orwell", Correct: false }
    ]
  },
  {
    Question: "What is the powerhouse of the cell?",
    QuestionAnswers: [
      { Answer: "Mitochondria", Correct: true },
      { Answer: "Nucleus", Correct: false },
      { Answer: "Ribosome", Correct: false },
      { Answer: "Endoplasmic Reticulum", Correct: false }
    ]
  },
  {
    Question: "Which planet is known as the Red Planet?",
    QuestionAnswers: [
      { Answer: "Mars", Correct: true },
      { Answer: "Venus", Correct: false },
      { Answer: "Saturn", Correct: false },
      { Answer: "Mercury", Correct: false }
    ]
  },
  {
    Question: "Who is the author of '1984'?",
    QuestionAnswers: [
      { Answer: "George Orwell", Correct: true },
      { Answer: "Aldous Huxley", Correct: false },
      { Answer: "Ray Bradbury", Correct: false },
      { Answer: "F. Scott Fitzgerald", Correct: false }
    ]
  },
  {
    Question: "What is the hardest natural substance on Earth?",
    QuestionAnswers: [
      { Answer: "Diamond", Correct: true },
      { Answer: "Gold", Correct: false },
      { Answer: "Iron", Correct: false },
      { Answer: "Steel", Correct: false }
    ]
  },
  {
    Question: "How many continents are there on Earth?",
    QuestionAnswers: [
      { Answer: "7", Correct: true },
      { Answer: "6", Correct: false },
      { Answer: "5", Correct: false },
      { Answer: "8", Correct: false }
    ]
  },
  {
    Question: "What is the boiling point of water at sea level?",
    QuestionAnswers: [
      { Answer: "100°C", Correct: true },
      { Answer: "50°C", Correct: false },
      { Answer: "150°C", Correct: false },
      { Answer: "0°C", Correct: false }
    ]
  }
];

eventBus.on("databaseConnected", async () => {
  try {
    const count = await quizQuestions.countDocuments();
    if (count === 0) {
      await quizQuestions.insertMany(sampleData);
      console.log("Sample data inserted into the database.");
    } else {
      console.log("Database already contains data.");
    }
  } catch (error) {
    console.log("Error inserting data:", error);
  }
});

// Default page
app.get("/", async function (req, res) {
  const allQuestions = await quizQuestions.find();
  const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffledQuestions.slice(0, 3);

  res.render("index", {
    questions: selectedQuestions,
    score: null,
    feedback: null,
    turnedIn: false,
  });
});

// Quiz submission route
app.post("/", function (req, res) {
  const userAnswers = req.body;
  const questionsData = JSON.parse(req.body.questionsData);

  // Event to handle quiz submission
  eventBus.emit("quizSubmitted", { userAnswers, questionsData, res });
});

// Add question page
app.get("/addQuestion", function (req, res) {
  res.render("addQuestion", {});
});

// Add question route
app.post("/addQuestion", function (req, res) {
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

  // Event to add question
  eventBus.emit("addQuestion", newQuestion);
  res.redirect("/");
});

// Add Question Event Handler
eventBus.on("addQuestion", async (newQuestion) => {
  try {
    const question = new quizQuestions(newQuestion);
    await question.save();
    console.log("New question added successfully.");
  } catch (error) {
    console.log("Error saving question:", error);
  }
});

// Quiz Submission Event Handler
eventBus.on("quizSubmitted", ({ userAnswers, questionsData, res }) => {
  try {
    const feedback = questionsData.map((question) => {
      const correctAnswer = question.QuestionAnswers.find((answer) => answer.Correct);
      const userAnswerId = userAnswers[question._id];
      const isCorrect = correctAnswer && correctAnswer._id.toString() === userAnswerId;

      return {
        question: question.Question,
        userAnswerId,
        correctAnswer: correctAnswer ? correctAnswer.Answer : null,
        userAnswer:
          question.QuestionAnswers.find((answer) => answer._id.toString() === userAnswerId)?.Answer || "Not Answered",
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
  } catch (error) {
    console.log("Error processing quiz submission:", error);
    res.status(500).send("Error processing quiz submission.");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});


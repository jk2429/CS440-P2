const mongoose = require("mongoose");
const events = require("events");

// Event Bus Setup
const eventBus = new events.EventEmitter();

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

// Sample data for seeding the database
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
  // Add more questions here...
];

// Database connected event handler
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

module.exports = { eventBus, quizQuestions };

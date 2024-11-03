// database.js
const mongoose = require("mongoose");

// Connect to the database
const connectDB = () => {
  mongoose.connect("mongodb://127.0.0.1:27017/QuizDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => {
    console.log("Connected to MongoDB");
    fillDatabase(); // Fill the database with sample data if empty
  }).catch((err) => console.log("Database connection error:", err));
};

// Schemas and models
const quizAnswersSchema = new mongoose.Schema({
  Answer: String,
  Correct: Boolean,
});

const quizQuestionsSchema = new mongoose.Schema({
  Question: String,
  QuestionAnswers: [quizAnswersSchema],
});

const quizQuestions = mongoose.model("quizQuestions", quizQuestionsSchema);

// Function to fill in the database with sample data if it's empty
const fillDatabase = async () => {
  const count = await quizQuestions.countDocuments();
  if (count === 0) {
    const sampleData = [
      // (Insert sample questions here)
    ];

    await quizQuestions.insertMany(sampleData);
    console.log("Sample data inserted into the database.");
  } else {
    console.log("Database already contains data.");
  }
};

module.exports = {
  connectDB,
  quizQuestions,
};

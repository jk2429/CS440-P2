const mongoose = require('mongoose');

const quizAnswerSchema = new mongoose.Schema({
  Answer: String,
  Correct: Boolean,
});

const quizQuestionSchema = new mongoose.Schema({
  Question: String,
  QuestionAnswers: [quizAnswerSchema],
});

module.exports = mongoose.model('Quiz', quizQuestionSchema);

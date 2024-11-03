// quizHandlers.js
const { quizQuestions } = require("./database");

// Handler for quiz submission
const quizSubmittedHandler = ({ userAnswers, questionsData, res }) => {
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
};

// Handler for adding new quiz questions
const addQuestionHandler = async (newQuestion) => {
  try {
    const question = new quizQuestions(newQuestion);
    await question.save();
    console.log("New question added successfully.");
  } catch (error) {
    console.log("Error saving question:", error);
  }
};

// Export the handlers
module.exports = {
  quizSubmittedHandler,
  addQuestionHandler,
};

const mongoose = require("mongoose");

// Connect to the database
mongoose.connect("mongodb://127.0.0.1:27017/QuizDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const quizAnswersSchema = new mongoose.Schema({
    Answer: String,
    Correct: Boolean
});

const quizQuestionsSchema = new mongoose.Schema({
    Question: String,
    QuestionAnswers: [quizAnswersSchema]
});

// Define models
const quizAnswers = mongoose.model("quizAnswers", quizAnswersSchema);
const quizQuestions = mongoose.model("quizQuestions", quizQuestionsSchema);

// Fill database with sample data if empty
const fillDatabase = async () => {
    const count = await quizQuestions.countDocuments();
    if (count === 0) {
        const sampleData = [
            {
                Question: "What is the capital of France?",
                QuestionAnswers: [
                    { Answer: "Paris", Correct: true },
                    { Answer: "London", Correct: false },
                    { Answer: "Rome", Correct: false },
                    { Answer: "Berlin", Correct: false }
                ]
            },
            // Additional sample questions...
        ];
        await quizQuestions.insertMany(sampleData);
        console.log("Sample data inserted into the database.");
    } else {
        console.log("Database already contains data.");
    }
};

// Call the function to ensure sample data is added
fillDatabase().catch(err => console.error(err));

// Export functions to interact with the database
module.exports = {
    getAllQuestions: async function() {
        return await quizQuestions.find();
    },
    addQuestion: async function(question, answers) {
        const newQuestion = new quizQuestions({ Question: question, QuestionAnswers: answers });
        return await newQuestion.save();
    }
};

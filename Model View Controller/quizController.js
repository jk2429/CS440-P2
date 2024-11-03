const quizDatabase = require("./database");

// Function to display the quiz page with questions
exports.displayQuizPage = async function(req, res) {
    try {
        const allQuestions = await quizDatabase.getAllQuestions();
        const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledQuestions.slice(0, 3);

        res.render("index", { questions: selectedQuestions, score: null, feedback: null, turnedIn: false });
    } catch (error) {
        console.error("Error displaying quiz page:", error);
        res.status(500).send("Error loading quiz page.");
    }
};

// Function to handle quiz submissions
exports.handleQuizSubmission = async function(req, res) {
    try {
        const userAnswers = req.body;
        const questionsData = JSON.parse(req.body.questionsData);

        const feedback = questionsData.map(question => {
            const correctAnswer = question.QuestionAnswers.find(answer => answer.Correct);
            const userAnswerId = userAnswers[question._id];
            const isCorrect = correctAnswer && correctAnswer._id.toString() === userAnswerId;

            return {
                question: question.Question,
                userAnswerId,
                correctAnswer: correctAnswer ? correctAnswer.Answer : null,
                userAnswer: question.QuestionAnswers.find(answer => answer._id.toString() === userAnswerId)?.Answer || "Not Answered",
                isCorrect,
                answers: question.QuestionAnswers
            };
        });

        const score = feedback.filter(fb => fb.isCorrect).length;
        res.render("index", { questions: questionsData, score: score, feedback: feedback, turnedIn: true });
    } catch (error) {
        console.error("Error handling quiz submission:", error);
        res.status(500).send("Error processing quiz submission.");
    }
};

// Function to display the "Add Question" page
exports.displayAddQuestionPage = function(req, res) {
    res.render("addQuestion", {});
};

// Function to add a new question
exports.addNewQuestion = async function(req, res) {
    try {
        const { question, answer1, answer2, answer3, answer4, correctAnswer } = req.body;
        const answers = [
            { Answer: answer1, Correct: correctAnswer === "0" },
            { Answer: answer2, Correct: correctAnswer === "1" },
            { Answer: answer3, Correct: correctAnswer === "2" },
            { Answer: answer4, Correct: correctAnswer === "3" }
        ];

        await quizDatabase.addQuestion(question, answers);
        res.redirect("/");
    } catch (error) {
        console.error("Error adding question:", error);
        res.status(500).send("Error adding question.");
    }
};

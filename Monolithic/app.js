//Import libraries
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//App setup
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Connect to database
mongoose.connect("mongodb://127.0.0.1:27017/QuizDB");

//Schema for questions/answers
const quizAnswersSchema = new mongoose.Schema({
	Answer: String,
	Correct: Boolean
});

const quizAnswers = mongoose.model("quizAnswers", quizAnswersSchema);

const quizQuestionsSchema = new mongoose.Schema({
	Question: String,
	QuestionAnswers: [quizAnswersSchema]
});

const quizQuestions = mongoose.model("quizQuestions", quizQuestionsSchema);

// Function to fill in the database with sample data if it's empty
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

    // Insert sample data into the database
    await quizQuestions.insertMany(sampleData);
    console.log("Sample data inserted into the database.");
  } else {
    console.log("Database already contains data.");
  }
};

// Call the function to fill the database
fillDatabase().catch(err => console.log(err));

//Default page
app.get("/", async function(req, res) {
	const allQuestions = await quizQuestions.find();
	const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
	const selectedQuestions = shuffledQuestions.slice(0,3);
	
	res.render("index", {questions: selectedQuestions, Score: null, feedBack: null, turnedIn: false});
});

app.post("/", async function(req, res) {
	const userAnswers = req.body;
	const questionsData = JSON.parse(req.body.questionsData); // Retrieve the same questions seen by the user

	// Prepare feedback based on the user's answers
	const feedback = questionsData.map(question => {
		const correctAnswer = question.QuestionAnswers.find(answer => answer.Correct);
		const userAnswerId = userAnswers[question._id];
		const isCorrect = correctAnswer && correctAnswer._id.toString() === userAnswerId;

		// Create feedback for each question
		return {
			question: question.Question,
			userAnswerId,
			correctAnswer: correctAnswer ? correctAnswer.Answer : null,
			userAnswer: question.QuestionAnswers.find(answer => answer._id.toString() === userAnswerId)?.Answer || "Not Answered",
			isCorrect,
			answers: question.QuestionAnswers // Store the list of answers for this question
		};
	});

	const score = feedback.filter(fb => fb.isCorrect).length;

	// Render the same questions back to the user along with their feedback
	res.render("index", { questions: questionsData, score: score, feedback: feedback, turnedIn: true });
});

app.get("/addQuestion", async function(req, res) {
	res.render("addQuestion", {});
});

app.post("/addQuestion", async function(req,res) {
	try {
		// Collect the form data
		const { question, answer1, answer2, answer3, answer4, correctAnswer } = req.body;

		// Create an array of answers with the correct answer marked
		const answers = [
			{ Answer: answer1, Correct: correctAnswer === "0" },
			{ Answer: answer2, Correct: correctAnswer === "1" },
			{ Answer: answer3, Correct: correctAnswer === "2" },
			{ Answer: answer4, Correct: correctAnswer === "3" }
		];

		// Create a new quiz question
		const newQuestion = new quizQuestions({
			Question: question,
			QuestionAnswers: answers
		});

		// Save the new question to the database
		await newQuestion.save();

		// Redirect back to the home page or to a success page
		res.redirect("/");
	} catch (error) {
		console.log("Error adding question:", error);
		res.status(500).send("Error adding question.");
	}
});

app.listen(3000, function() {
	console.log("Server Started on port 3000");
});


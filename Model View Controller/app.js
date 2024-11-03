// Import libraries and controller
const express = require("express");
const bodyParser = require("body-parser");
const quizController = require("./quizController");

// App setup
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.get("/", quizController.displayQuizPage);
app.post("/", quizController.handleQuizSubmission);
app.get("/addQuestion", quizController.displayAddQuestionPage);
app.post("/addQuestion", quizController.addNewQuestion);

// Start the server
app.listen(3000, function() {
    console.log("Server Started on port 3000");
});

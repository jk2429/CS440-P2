// app.js
const express = require("express");
const bodyParser = require("body-parser");
const uiRoutes = require("./ui");
const { connectDB } = require("./database");

const app = express();

// App setup
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Connect to the database
connectDB();

// Use the routes module for handling all routes
app.use("/", uiRoutes);

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

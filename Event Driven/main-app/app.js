const express = require('express');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

let channel;

async function connectQueue() {
  const connection = await amqp.connect('amqp://localhost');
  channel = await connection.createChannel();
  console.log('Connected to RabbitMQ');
}

connectQueue().catch(console.error);

// Route for quiz submission
app.post('/submit-quiz', (req, res) => {
  const userAnswers = req.body;
  channel.sendToQueue('submissionQueue', Buffer.from(JSON.stringify(userAnswers)));
  res.status(202).send('Quiz submission received.');
});

app.listen(3000, () => {
  console.log('Main app running on port 3000');
});

const amqp = require('amqplib');
const mongoose = require('mongoose');
const Quiz = require('./models/quizModel');

mongoose.connect('mongodb://127.0.0.1:27017/QuizDB')
  .then(() => console.log('Quiz Service connected to DB'))
  .catch(console.error);

async function startQuizService() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue('quizRequestQueue');

  channel.consume('quizRequestQueue', async (msg) => {
    const data = JSON.parse(msg.content.toString());
    const quizData = await Quiz.find().limit(3);
    channel.sendToQueue('quizResponseQueue', Buffer.from(JSON.stringify(quizData)));
    channel.ack(msg);
  });
}

startQuizService().catch(console.error);

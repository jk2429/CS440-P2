const amqp = require('amqplib');

async function startFeedbackService() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue('feedbackQueue');

  channel.consume('feedbackQueue', (msg) => {
    const feedbackData = JSON.parse(msg.content.toString());
    console.log('Feedback processed:', feedbackData);
    channel.ack(msg);
  });
}

startFeedbackService().catch(console.error);

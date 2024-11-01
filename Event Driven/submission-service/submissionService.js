const amqp = require('amqplib');

async function startSubmissionService() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  await channel.assertQueue('submissionQueue');

  channel.consume('submissionQueue', (msg) => {
    const submissionData = JSON.parse(msg.content.toString());
    console.log('Processing submission:', submissionData);
    // Process submission and create feedback
    const feedback = { score: Math.random() * 10 }; // Placeholder logic
    channel.sendToQueue('feedbackQueue', Buffer.from(JSON.stringify(feedback)));
    channel.ack(msg);
  });
}

startSubmissionService().catch(console.error);

const amqplib = require("amqplib");
const fs = require("fs");


function brokerDependency() {
  this.host = process.env.BROKER_HOST ?? 'localhost'
  this.username = process.env.BROKER_USER ?? 'rabbitmq'
  this.password = process.env.BROKER_PASSWORD ?? 'rabbitmq'
};


async function get_messages(broker) {
  this.brokerHost = broker.host;
  this.brokerUsername = broker.username;
  this.brokerPassword = broker.password;
  const queueHost = `amqp://${this.brokerUsername}:${this.brokerPassword}@${this.brokerHost}:5672`;
  console.log("queue host", queueHost);

  const queue = 'messages';

  const conn = await amqplib.connect(queueHost);

  const message_ch = await conn.createChannel();
  await message_ch.assertQueue(queue, {durable: false});

  await message_ch.consume(queue, (msg) => {
    if (msg !== null) {
      const message = msg.content.toString();
      console.log('Consumed message', message);
      fs.appendFile("rabbit_logs.txt", message, (err) => {
        if (err) throw err;
      });
      message_ch.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  });
}

get_messages(new brokerDependency()).catch((err) => {
  console.error(err)
})

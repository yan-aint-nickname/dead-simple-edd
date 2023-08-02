import { connect } from "amqplib";
import { WriteStream, createWriteStream } from "fs"


const writeStream = createWriteStream("rabbit_logs.txt", {'flags': 'a+'})

type Settings = {
  brokerHost: string,
}

const settings: Settings = {
  brokerHost: process.env.BROKER_HOST ?? 'amqp://localhost',
}

async function get_messages(writeStream: WriteStream, settings: Settings) {
  const queue = 'messages';
  const conn = await connect(settings.brokerHost);

  const message_ch = await conn.createChannel();
  await message_ch.assertQueue(queue, {durable: false});

  await message_ch.consume(queue, (msg) => {
    if (msg !== null) {
      writeStream.write(msg.content.toString());
    } else {
      console.log('Consumer cancelled by server');
    }
  }, {noAck: true});
}

get_messages(writeStream, settings).catch((err) => {
  console.error(err)
})
writeStream.end()


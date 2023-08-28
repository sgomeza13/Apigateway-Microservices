import amqp from "amqplib/callback_api.js";
const AMQP_CONNECT = process.env.AMQP_CONNECT;
const queue = "hello2";
let channel, connection

connect()

async function connect() {
  try {
    const amqpServer = 'amqp://simon:password@18.214.11.58:5672'
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()

    // consume all the orders that are not acknowledged
    await channel.consume('order', (data) => {
      console.log(`Received ${Buffer.from(data.content)}`)
      channel.ack(data);
    })
  } catch (error) {
    console.log(error)
  }
}


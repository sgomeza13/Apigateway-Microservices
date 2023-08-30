import amqp from "amqplib";
import fs from 'fs';
import dotenv from 'dotenv';
import { globSync } from 'glob'

dotenv.config();


const conn_uri = process.env.AMQP_CONNECT;
const file_path = process.env.file_path || 'testfiles';
const queue = process.env.queue;


let channel, connection

connect()

async function connect() {
  try {
    const amqpServer = conn_uri;
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()

    // Consume todas las request que no han recibido ack
    await channel.consume(queue, (data) => {
      console.log(`Received ${Buffer.from(data.content)}`)
      const request = JSON.parse(`${Buffer.from(data.content)}`);
      if(request.request_service == 1){             //listfiles
       const response = fs.readdirSync(file_path);
       console.log(response);
       channel.sendToQueue(
        'cola_request_perdidos',
          Buffer.from(
            JSON.stringify(response),
          ),
        )
      }
      else{                                         //searchFiles
        const file_name = request.search_file;
        const found =  globSync(`${file_path}/${file_name}`)
        console.log(found);

      }
      channel.ack(data);
    })
  } catch (error) {
    console.log(error)
  }
}





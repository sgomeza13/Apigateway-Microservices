import amqp from "amqplib";
import fs from 'fs';
import dotenv from 'dotenv';
import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'

dotenv.config();


const conn_uri = process.env.AMQP_CONNECT;
const file_path = process.env.file_path || 'testfiles';


let channel, connection

connect()

async function connect() {
  try {
    const amqpServer = conn_uri;
    connection = await amqp.connect(amqpServer)
    channel = await connection.createChannel()

    // consume all the orders that are not acknowledged
    await channel.consume('order', (data) => {
      console.log(`Received ${Buffer.from(data.content)}`)
      const request = JSON.parse(`${Buffer.from(data.content)}`);
      //console.log(request.request_service);
      if(request.request_service == 1){
       const response = fs.readdirSync(file_path);
       console.log(response);
      }
      else{
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


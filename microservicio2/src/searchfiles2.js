import amqp from 'amqplib'
import amqp from "amqplib/callback_api";
import dotenv from 'dotenv';
import fs from 'fs';
import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'


dotenv.config();

const AMQP_CONNECT = process.env.AMQP_CONNECT;
const queue = process.env.QUEUE;



amqp.connect(AMQP_CONNECT, function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    //var queue = 'rpc_queue';

    channel.assertQueue(queue, {
      durable: false
    });
    channel.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    channel.consume(queue, function reply(msg) {
      //var n = parseInt(msg.content.toString());

      console.log(" recieved ",msg);

      var r = listFiles();

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(r.toString()), {
          correlationId: msg.properties.correlationId
        });

      channel.ack(msg);
    });
  });
});


function listFiles() {
     const response = fs.readdirSync("testfiles");
     return response;

}
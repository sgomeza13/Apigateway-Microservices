import amqp from "amqplib/callback_api.js";
import dotenv from 'dotenv';
import fs from 'fs';
import { glob, globSync, globStream, globStreamSync, Glob } from 'glob'


dotenv.config();

const AMQP_CONNECT = process.env.AMQP_CONNECT;
const queue = "hello";



function intensiveOperation() {
    let i = 1e3
    while (i--) {}
}

async function subscriber() {
    const connection = await amqp.connect('amqp://simon:password@18.214.11.58:5672')
    const channel = await connection.createChannel()

    await channel.assertQueue(queue)

    channel.consume(queue, (message) => {
        const content = JSON.parse(message.content.toString())

        intensiveOperation()

        console.log(`Received message from "${queue}" queue`)
        console.log(content)

        channel.ack(message)
    })
}

subscriber().catch((error) => {
    console.error(error)
    process.exit(1)
})
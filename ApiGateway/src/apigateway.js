import express from 'express';
import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import amqp from 'amqplib'
import asyncHandler from 'express-async-handler';

dotenv.config();
const queue = "hello2";
//Definicionn de constantes para gRPC
const app = express();
const port = process.env.PORT;
const PROTO_PATH = process.env.PROTO_PATH;
const REMOTE_HOST = process.env.REMOTE_HOST;
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });


app.use(express.json());
app.use(express.urlencoded());

const SearchRequest = grpc.loadPackageDefinition(packageDefinition).SearchRequest;
let request_service;
let file_search;


//Defininos y conectamos a rabbitmq
let channel, connection
connect()


app.get('/listfiles',( req, res)=> {
    
    try {
        const client = new SearchRequest(REMOTE_HOST, grpc.credentials.createInsecure());
        console.info("Consumer service is started...");
        request_service = 1;
        client.SearchR({request_service:request_service},(err,data) => {
           // console.log(err);   
           const data = {
            request_service:1,
            search_file:""
        }            
                res.send(data)
            
        });
    } catch (error) {
        console.log(error)

        channel.sendToQueue(
            'order',
            Buffer.from(
              JSON.stringify({
                ...data
              }),
            ),
          )
        res.send("sent to MoM")
    }
    


    
})

app.post('/searchfile',(req, res)=>{
    console.info("Consumer service is started...");
    request_service = 2;
    file_search = req.body.file;
    client.SearchR({request_service:request_service, file_search:file_search},(err,data) => {
        if(err){

            res.send(err)
        }
        else{
            res.send(data)
        }
    });

    
})



// connect to rabbitmq
async function connect() {
    try {
        // rabbitmq default port is 5672
      const amqpServer = 'amqp://simon:password@18.214.11.58:5672'
      connection = await amqp.connect(amqpServer)
      channel = await connection.createChannel()
  
      // make sure that the order channel is created, if not this statement will create it
      await channel.assertQueue('order')
    } catch (error) {
      console.log(error)
    }
  }



async function sender(){
    console.log("enter the function");
    const connection = await amqp.connect("amqp://simon:password@18.214.11.58:5672")
    const channel = await connection.createChannel()

    await channel.assertQueue(queue)

    sleepLoop(messagesAmount, async () => {
        const message = {
            id: Math.random().toString(32).slice(2, 6),
            text: 'Hello world!'
        }

        const sent = await channel.sendToQueue(
            queue,
            Buffer.from(JSON.stringify(message)),
            {
                // persistent: true
            }
        )

        sent
            ? console.log(`Sent message to "${queue}" queue`, message)
            : console.log(`Fails sending message to "${queue}" queue`, message)
    })

}

app.get('/rabbit', (req,res)=>{

      res.send('Order submitted')
});

function generateUuid() {
    return Math.random().toString() +
            Math.random().toString() +
           Math.random().toString();
  }


  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
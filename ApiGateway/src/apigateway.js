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
const keepaliveOptions = {
    keepaliveTimeMs: 10000, // Interval to send keepalive ping (milliseconds)
    keepaliveTimeoutMs: 27200000, // Timeout for keepalive response (milliseconds)
    keepalivePermitWithoutCalls: true, // Allow keepalive pings even if no active calls
};

app.use(express.json());
app.use(express.urlencoded());

const SearchRequest = grpc.loadPackageDefinition(packageDefinition).SearchRequest;

let request_service;
let file_search;


//Defininos y conectamos a rabbitmq
let channel, connection
connect()


app.get('/listfiles',( req, res)=> {
        var client = new SearchRequest(REMOTE_HOST, grpc.credentials.createInsecure());
        console.info("Consumer service is started...");
        request_service = 1;
        
        client.SearchR({request_service:request_service},(err,data) => {

           if(err){
            const data = {
                request_service:1,
                search_file:""
            }
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
           else{
            
                res.send(data)
           }
        });
    

})

app.post('/searchfile',(req, res)=>{
    console.info("Consumer service is started...");
    request_service = 2;
    file_search = req.body.file;
    client.SearchR({request_service:request_service, file_search:file_search},(err,data) => {
        if(err){
            const data = {
                request_service:2,
                search_file:file_search
            }
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




app.get('/rabbit', (req,res)=>{

      res.send('Order submitted')
});


  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
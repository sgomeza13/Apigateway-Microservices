import express from 'express';
import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import amqp from 'amqplib'
import asyncHandler from 'express-async-handler';

dotenv.config();
const queue = "hello";
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
const SearchRequest = grpc.loadPackageDefinition(packageDefinition).SearchRequest;

app.use(express.json());
app.use(express.urlencoded());

const client = new SearchRequest(REMOTE_HOST, grpc.credentials.createInsecure());
let request_service;
let file_search;


//Defininos y conectamos a rabbitmq




app.get('/listfiles',( req, res)=> {
    console.info("Consumer service is started...");
    request_service = 1;
    client.SearchR({request_service:request_service},(err,data) => {
        if(err){
            res.send(err)
            
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
            res.send(err)
        }
        else{
            res.send(data)
        }
    });

    
})






async function somename(){
    console.log("enter the function");
        amqp.connect("amqp://simon:password@18.214.11.58:5672", function(error0, connection) {
            console.log("connected");
          if (error0) {
            throw error0;
          }
          connection.createChannel(function(error1, channel) {
            if (error1) {
              throw error1;
            }
            channel.assertQueue('', {
              exclusive: true
            }, function(error2, q) {
              if (error2) {
                throw error2;
              }
              var correlationId = generateUuid();
              var num = 9;
        
              console.log(' [x] Requesting listfiles');
        
              channel.consume(q.queue, function(msg) {
                if (msg.properties.correlationId == correlationId) {
                  console.log(' [.] Found %s', msg.content.toString());
                  setTimeout(function() {
                    connection.close();
                    process.exit(0)
                  }, 500);
                }
              }, {
                noAck: true
              });
        
              channel.sendToQueue(queue,
                Buffer.from(num.toString()),{
                  correlationId: correlationId,
                  replyTo: q.queue });
            });
          });
        });
        return "hola"
}

app.get('/rabbit', asyncHandler(async(req,res)=>{
   const msg = await somename();             
    res.send(msg);
}));

function generateUuid() {
    return Math.random().toString() +
            Math.random().toString() +
           Math.random().toString();
  }


  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
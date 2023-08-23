import express from 'express';
import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

dotenv.config();
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

app.get('/listfiles',(req, res)=>{
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

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
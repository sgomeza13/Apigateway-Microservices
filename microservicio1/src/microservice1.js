import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import fs from 'fs';
import {globSync} from 'glob'

dotenv.config();
const server = new grpc.Server();

const PROTO_PATH = process.env.PROTO_PATH;
const REMOTE_HOST = process.env.REMOTE_HOST;
const file_path = process.env.file_path;

const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
const SearchRequest = grpc.loadPackageDefinition(packageDefinition).SearchRequest;


const searchR = (call, callback) => {
    const request_service = call.request;
    console.log(request_service);
    let response = {}
    if(request_service.request_service == 1){
         response = {
            response: fs.readdirSync(file_path)
        };
    }
    else{
        const file_name = request_service.file_search;
        const found =  globSync(`${file_path}/${file_name}`)
        if(found != ''){
        response = {
            response: found
        };
    }
    else{
        response = {
            response: "file(s) not found"
        };
    }
    }


    callback(null,response);
};

server.addService(SearchRequest.service, { SearchR: searchR });
server.bindAsync(REMOTE_HOST, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error('Error binding:', err);
    } else {
      console.log(`gRPC server listening on port ${port}`);
      server.start();
    }
  });
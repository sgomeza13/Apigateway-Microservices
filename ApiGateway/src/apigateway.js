import express, { request } from 'express';
import dotenv from 'dotenv';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import amqp from 'amqplib'

dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded());

//Definicionn de constantes para gRPC
const port = process.env.PORT;
const PROTO_PATH = process.env.PROTO_PATH;
const REMOTE_HOST = process.env.REMOTE_HOST;
const queue = process.env.queue;
const conn_uri = process.env.AMQP_CONNECT;


const packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });




const SearchRequest = grpc.loadPackageDefinition(packageDefinition).SearchRequest; //Carga definicion del proto

let request_service;
let file_search;



let channel, connection
connect()

//Define la ruta listfiles, tiene como respuesta la lista de todos los archivos de la carpeta predeterminada (testfiles)
app.get('/listfiles',( req, res)=> {
        let client = new SearchRequest(REMOTE_HOST, grpc.credentials.createInsecure());
        console.info("apigateway/listfiles service is started...");
        request_service = 1;
        
        client.SearchR({request_service:request_service},(err,data) => {

           if(err){                   //Si no se puede conectar por grpc, manda la request a la cola de rabbitmq
            const data = {
                request_service:1,
                search_file:""
            }
            channel.sendToQueue(
              queue,
                Buffer.from(
                  JSON.stringify({
                    ...data
                  }),
                ),
              )
            res.send("grpc caido, enviado a la cola")
    

           }
           else{
            
                res.send(data)  
           }
        });
    

})
//Define la ruta de buscar archivos, debe tener en e parametro un JSON con "file":"nombre_del_archivo.example"
app.post('/searchfile',(req, res)=>{
    let client = new SearchRequest(REMOTE_HOST, grpc.credentials.createInsecure());
    console.info("apigateway/searchfile service is started...");
    request_service = 2;
    file_search = req.body.file;
    client.SearchR({request_service:request_service, file_search:file_search},(err,data) => {
        if(err){
            const data = {
                request_service:2,
                search_file:file_search
            }
            channel.sendToQueue(
              queue,
                Buffer.from(
                  JSON.stringify({
                    ...data
                  }),
                ),
              )
            res.send("grpc caido, enviado a la cola")
    

           }
           else{
            
                res.send(data)
           }
    });

    
})

app.get('/lostrequests', (req,res)=>{
  let lostrequests;
  try{
  //await channel.assertQueue('cola_request_perdidos');
    channel.consume('cola_request_perdidos', (data) => {
    console.log(`Received ${Buffer.from(data.content)}`)
    const request = JSON.parse(`${Buffer.from(data.content)}`);
    console.log(request);
    channel.ack(data);
    //lostrequests += request;
    //console.log("lost requests: ",lostrequests)
    lostrequests = request
  })
  res.send(lostrequests)
}

catch(error){
  res.send(error)
}
  
})



// funcion para establecer conexion rabbitmq
async function connect() {
    try {
      const amqpServer = conn_uri
      connection = await amqp.connect(amqpServer)
      channel = await connection.createChannel()
  
      // Se asegura de que la cola existe, sino, la crea
      await channel.assertQueue(queue)
    } catch (error) {
      console.log(error)
    }
  }


  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
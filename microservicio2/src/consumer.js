import amqp from "amqplib/callback_api.js";
const AMQP_CONNECT = process.env.AMQP_CONNECT;
const queue = "hello";

//var args = process.argv.slice(2);


function somename(){
amqp.connect("amqp://simon:password@18.214.11.58:5672", function(error0, connection) {
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
}

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}

somename();
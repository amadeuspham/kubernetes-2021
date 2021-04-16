const { connect, JSONCodec } = require("nats");

module.exports.sendMessage = async function(message) {
  // to create a connection to a nats-server:
  const nc = await connect({ servers: process.env.NATS_URL });
  process.once('SIGINT', async function() { 
    await nc.drain(); 
    console.log("connection ended in backend app"); 
  });
  // create a codec
  const sc = JSONCodec();
  nc.publish("messages", sc.encode(message));
}


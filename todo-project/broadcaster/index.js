const { connect, JSONCodec } = require("nats");
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.API_TOKEN, {polling: true});
const channelID = -1001469370777;

(async () => {
  // create a connection to a nats-server
  const nc = await connect({ servers: process.env.NATS_URL });
 
  // create a codec to encode/decode payloads
  const sc = JSONCodec();
 
  // create a simple subscriber and iterate over messages
  // matching the subscription
  const sub = nc.subscribe("messages");
  (async () => {
    for await (const m of sub) {
      console.log(sub.getProcessed())
      const messageObj = sc.decode(m.data)
      const messageText = JSON.stringify(messageObj.todo)
      if (messageObj.new) {
        console.log("New todo added")
        bot.sendMessage(channelID, ` \
          A new todo is added \
          ${messageText} \
        `);
      } else {
        console.log("New todo added")
        bot.sendMessage(channelID, ` \
          A new todo is added \
          ${messageText} \
        `);
      }
      console.log(messageObj.todo)
    }
  })().then(() => {
    console.log("subscription closed");
  });
 
  process.once('SIGINT', async function() { 
    await nc.drain(); 
    console.log("connection ended in broadcaster");
  });
})();
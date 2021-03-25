const { v4: uuidv4 } = require('uuid')
const redis = require("redis");
const process = require('process')
const express = require('express')

const client = redis.createClient({
  port: 6379, 
  host: "redis-svc",
  password: process.env.REDIS_PASSWORD
});
client.on("error", (err) => {
  console.log(err);
});

var app = express()
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

const port = 3001;

var todos = [
  {id: 1, content: 'First thing'},
  {id: 2, content: 'Second thing'}
]
client.get('todos', (err, reply) => {
  if (err) throw err;
  console.log(reply);
  if (reply) {
    todos = JSON.parse(reply)
  } else {
    client.set('todos', JSON.stringify(todos))
  }
});

app.get('/todos', (req, res) => {
  client.get('todos', (err, reply) => {
    if (err) throw err;
    console.log(reply);

    if (reply) {
      res.json(JSON.parse(reply))
    } else {
      client.set('todos', JSON.stringify(todos))
      res.json(newTodo)
    }
  });
})

app.post('/todos', (req, res) => {
  const content = req.body.todo
  console.log(content)
  if (!content) {
    return res.status(400).json({ 
      error: 'content missing' 
    })
  }

  const newTodo = {id: uuidv4(), content: content}
  todos = todos.concat(newTodo)
  
  client.set('todos', JSON.stringify(todos), (err, reply) => {
    if (err) throw err
    console.log(reply)
  })
  res.status(201).redirect(301, '/')
})

app.listen(port, () => {
  console.log(`Todo backend started in port ${port}`)
})
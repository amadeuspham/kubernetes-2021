// const { v4: uuidv4 } = require('uuid')
// const redis = require("redis");
const db = require('./queries')
const process = require('process')
const express = require('express')

// const client = redis.createClient({
//   port: 6379, 
//   host: "redis-svc",
//   password: process.env.REDIS_PASSWORD
// });
// client.on("error", (err) => {
//   console.log(err);
// });

var app = express()
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

const port = 3001;

// var todos = [
//   {id: 1, content: 'First thing'},
//   {id: 2, content: 'Second thing'}
// ]

// client.get('todos', (err, reply) => {
//   if (err) throw err;
//   console.log(reply);
//   if (reply) {
//     todos = JSON.parse(reply)
//   } else {
//     client.set('todos', JSON.stringify(todos))
//   }
// });

app.get('/todos', async (req, res) => {
  // client.get('todos', (err, reply) => {
  //   if (err) throw err;
  //   console.log(reply);

  //   if (reply) {
  //     res.json(JSON.parse(reply))
  //   } else {
  //     client.set('todos', JSON.stringify(todos))
  //     res.json(newTodo)
  //   }
  // });
  const rows = await db.fetchTodos()
  if (rows) {
    const todos = rows.map(row => row.todo)
    console.log("Sending back todos")
    res.json(todos)
  } else {
    console.error("Fetching todos from db failed")
  }
})

app.post('/todos', (req, res) => {
  const content = req.body.todo
  
  if (!content) {
    console.log('content missing')
    return res.status(400).json({ 
      error: 'content missing' 
    })
  } else if (content.length > 140) {
    console.log('todo cannot be longer than 140 characters')
    return res.status(413).json({ 
      error: 'todo cannot be longer than 140 characters' 
    })
  }

  // console.log(content)
  // const newTodo = {id: uuidv4(), content: content}
  // todos = todos.concat(newTodo)
  
  // client.set('todos', JSON.stringify(todos), (err, reply) => {
  //   if (err) throw err
  //   console.log(reply)
  // })
  console.log("inserting todo")
  db.insertTodo(content)
  res.status(201).redirect(301, '/')
})

app.listen(port, () => {
  console.log(`Todo backend started in port ${port}`)
})
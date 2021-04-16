const { v4: uuidv4 } = require('uuid')
const redis = require("redis");
// const db = require('./queries')
const process = require('process')
const express = require('express')
var methodOverride = require('method-override')
const { sendMessage } = require("./nats.js");

const client = redis.createClient({
  port: 6379, 
  host: "redis-svc",
  password: process.env.REDIS_PASSWORD
});
client.on("error", (err) => {
  console.log(err);
});

var app = express()
app.use(methodOverride('_method'))
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}))

const port = 3001;

var todos = []

// const processTodos = (oldTodos) => {
//   return oldTodos.map(todoObj => {
//     console.log("START")
//     if (!todoObj.hasOwnProperty('done')) {
//       console.log('none')
//       todoObj.done = false
//     }
//     console.log(todoObj)
//     return todoObj
//   });
// }

// client.get('todos', (err, reply) => {
//   if (err) throw err;
//   if (reply) {
//     data = JSON.parse(reply)
//     console.log(data)
//     todos = processTodos(data)
//     console.log('----------------------')
//     console.log(todos)
//   } else {
//     client.set('todos', JSON.stringify(todos))
//   }
// });

app.get('/', (req, res) => {
  res.sendStatus(200)
})

app.get('/healthz', function(req, res) {
  client.get('todos', (err, reply) => {
    if (err) res.sendStatus(500)
    res.sendStatus(200)
  });
})

app.get('/todos', async (req, res) => {
  client.get('todos', (err, reply) => {
    if (err) throw err;

    if (reply) {
      // data = JSON.parse(reply)
      // console.log('**************************')
      // const returnTodos = processTodos(data)
      // client.set('todos', JSON.stringify(returnTodos))
      // console.log(returnTodos)
      // res.json(data)
      todos = JSON.parse(reply)
      res.json(todos)
    } else {
      client.set('todos', JSON.stringify(todos))
      res.json(todos)
    }
  });

  // const rows = await db.fetchTodos()
  // if (rows) {
  //   const todos = rows.map(row => row.todo)
  //   console.log("Sending back todos")
  //   res.json(todos)
  // } else {
  //   console.error("Fetching todos from db failed")
  // }
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

  console.log(content)
  const newTodo = {id: uuidv4(), content: content, done: false}
  todos = todos.concat(newTodo)
  
  client.set('todos', JSON.stringify(todos), (err, reply) => {
    if (err) throw err
  })

  sendMessage({todo: newTodo, new: true})
  // console.log("inserting todo")
  // db.insertTodo(content)
  res.status(201).redirect(301, '/')
})

app.put('/todos/:id', (req, res) => {
  const id = req.params.id
  if (req.body._method) {
    console.log(req.body._method)
  }
  let idExist = false
  console.log("PUTTING")
  let updateTodo = {}
  for (todo of todos) {
    if (todo.id === id) {
      todo.done = !todo.done
      idExist = true
      updateTodo = todo
      break
    }
  }
  if (!idExist) {
    res.sendStatus(404)
  }

  client.set('todos', JSON.stringify(todos), (err, reply) => {
    console.log("TOGGLED")
    if (err) throw err
  })
  sendMessage({todo: updateTodo, new: false})
  
  res.status(200).redirect(301, '/')
})

app.listen(port, () => {
  console.log(`Todo backend started in port ${port}`)
})
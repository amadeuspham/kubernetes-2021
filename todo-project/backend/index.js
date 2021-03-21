const { v4: uuidv4 } = require('uuid')
const express = require('express')
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

app.get('/todos', (req, res) => {
  res.json(todos)
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
  res.json(newTodo)
})

app.listen(port, () => {
  console.log(`Todo backend started in port ${port}`)
})
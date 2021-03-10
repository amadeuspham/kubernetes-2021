var express = require('express')
var app = express()

const hostname = '127.0.0.1';
const port = 3000;

app.get('/',  function (req, res) {
  res.send('This is your frinedly neighborhood Todo app')
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
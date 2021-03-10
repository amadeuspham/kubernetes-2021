var express = require('express')
var app = express()

const port = 7000;

var counter = 0

app.get('/',  function (req, res) {
  res.send("pong " + counter.toString())
  counter += 1
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
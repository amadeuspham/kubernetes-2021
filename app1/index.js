var express = require('express')
var app = express()

const port = 5000;

const randomHash = Math.random().toString(36).substr(2, 6)

const printHash = () => {
  var d = new Date();
  var n = d.toString();
  console.log(n + ": ", randomHash)

  setTimeout(printHash, 5000)
}

printHash()

app.get('/',  function (req, res) {
  var d = new Date();
  var n = d.toString();
  res.send(n + ": " + randomHash)
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
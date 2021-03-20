var fs = require('fs')
var path = require('path')
var express = require('express')
var app = express()

const port = 7000;

var counter = 0

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'pingpongcount.txt')

app.get('/',  function (req, res) {
  res.send("pong " + counter.toString())
  counter += 1
  const countStr = counter.toString()
  fs.writeFile(filePath, countStr, function (err) {
    if (err) return console.log(err);
  })
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
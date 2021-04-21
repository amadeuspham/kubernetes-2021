var fs = require('fs')
var path = require('path')
var express = require('express')
const db = require('./queries')
var app = express()

const port = 7000;
const knativePort = 8080;

var counter = 0

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'pingpongcount.txt')

app.get('/healthz', function(req, res) {
  try {
    db.pingDB("pingpong", counter)
  } catch (error) {
    res.sendStatus(500)
  }
  res.sendStatus(200)
})

app.get('/',  function (req, res) {
  counter += 1

  // POSTGRES
  db.pingDB("pingpong", counter)
  res.send(counter.toString())

  // API
  // res.send(counter.toString())

  // VOLUME
  // const countStr = counter.toString()
  // fs.writeFile(filePath, countStr, function (err) {
  //   if (err) return console.log(err);
  // })
  // res.send("Pinged " + counter.toString())
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
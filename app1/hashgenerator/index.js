var express = require('express')
var fs = require('fs')
const path = require('path')
const axios = require('axios')
// const db = require('./queries')
const process = require('process');

var app = express()

const port = 5000;
const directory = path.join('/', 'usr', 'src', 'app', 'files')
const imagePath = path.join(directory, 'timestamp.txt')
const pingpongPath = path.join(directory, 'pingpongcount.txt')

const randomHash = Math.random().toString(36).substr(2, 6)

const printHash = () => {
  fs.readFile(imagePath, function(err, data) {
    if (err) {
      console.log("Hash (timestamp not yet ready): ", randomHash)
    }
    console.log(data + ": ", randomHash)
  });
  setTimeout(printHash, 5000)
}

printHash()

app.get('/',  async function (req, res) {
  const d = new Date();
  const n = d.toString();

  // POSTGRES
  // const rows = await db.pongDB()
  // const pingpongRow = rows[0]
  // const count = pingpongRow ? pingpongRow.value : 0

  // VOLUME
  // var count = fs.readFileSync(pingpongPath)

  // API
  const response = await axios.get('http://pingpong-svc:4567')
  const count = response.data

  res.write(process.env.MESSAGE + "\n")
  res.write(n + ": " + randomHash + "\n")
  res.write("Ping / Pongs: " + count)
  res.end()
})

app.get('/healthz', function(req, res) {
  axios.get('http://pingpong-svc:4567')
  .then(function (response) {
    res.sendStatus(200)
  })
  .catch(function (error) {
    res.sendStatus(500)
  })
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
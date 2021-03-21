var express = require('express')
var fs = require('fs')
const path = require('path')
const axios = require('axios')
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

  // var count = fs.readFileSync(pingpongPath)
  const response = await axios.get('http://pingpong-svc:4567')
  const count = response.data

  res.write(n + ": " + randomHash + "\n")
  res.write("Ping / Pongs: " + count)
  res.end()
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
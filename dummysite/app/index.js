const fetch = require('node-fetch');
const express = require('express')
var app = express()
const url = process.env.WEBSITE_URL

const port = 3000;

console.log("This resource will get HTML data from " + url)

app.get('/', function(req, res) {
  fetch(url)
    .then(res => res.text())
    .then(body => res.send(body));
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
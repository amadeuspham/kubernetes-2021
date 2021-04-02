const express = require('express')
const path = require('path')
const axios = require('axios')
const fs = require('fs')
var app = express()

const port = 3000;

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'image.jpg')
const datePath = path.join(directory, 'date.txt')

app.use(express.static(directory));

const fileAlreadyExists = async () => new Promise(res => {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats) return res(false)
    return res(true)
  })
})

const findAFile = async () => {
  if (await fileAlreadyExists()) return

  await new Promise(res => fs.mkdir(directory, (err) => res()))
  const response = await axios.get('https://picsum.photos/1200', { responseType: 'stream' })
  response.data.pipe(fs.createWriteStream(filePath))
}

const removeFile = async () => new Promise(res => fs.unlink(filePath, (err) => res()))

const checkDate = async () => {
  var dateObj = new Date();
  var today = dateObj.getFullYear()+'-'+(dateObj.getMonth()+1)+'-'+dateObj.getDate();
  fs.readFile(datePath, async (err, date) => {
    if (err || date != today) {
      fs.writeFile(datePath, today, function (err) {
        if (err) return console.log(err);
      })
      await removeFile()
      findAFile()
    }
  })
}

app.get('/',  async (req, res) => {
  await checkDate()
  var htmlStr = ''
  htmlStr += `
    <html>
      <body>
        <img src="image.jpg" />
        <br>
  `
  htmlStr += `
    <form method="POST" action="http://todo-backend-svc:3457/todos">
      <input type="text" id="todo" name="todo">
      <input type="submit" value="Submit">
    </form> 
    <ul>
  `
  const response = await axios.get('http://todo-backend-svc:3457/todos')
  const todos = response.data
  console.log(todos)
  todos.forEach(todo => {
    htmlStr += '<li>' + todo + '</li>'
  })

  htmlStr += `
        </ul>
      </body>
    </html>
  `
  res.send(htmlStr)
})

app.listen(port, () => {
  console.log(`Server started in port ${port}`)
})
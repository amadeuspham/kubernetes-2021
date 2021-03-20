var fs = require('fs')
const path = require('path')

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'timestamp.txt')

const saveTime = () => {
  var d = new Date();
  var n = d.toString();
  fs.writeFile(filePath, n, function (err) {
    if (err) return console.log(err);
  })

  setTimeout(saveTime, 5000)
}

saveTime()
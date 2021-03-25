const process = require('process')
const axios = require('axios')

axios.get(process.env.URL).then(res => {
  const articleURL = "https://en.wikipedia.org" + res.request.path
  axios.post("http://todo-backend-svc:3457/todos", 
    {todo: "Read " + articleURL}
  )
});



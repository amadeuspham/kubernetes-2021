const Pool = require('pg').Pool
const process = require('process')

const pool = new Pool({
  user: process.env.DB_USER,
  host: '35.228.174.194',
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
})

const insertTodo = (todo) => {
  pool.query(`
    INSERT INTO entries (todo)
    VALUES($1) 
  `, [todo], (error, result) => {
    if (error) {
      throw error
    }
    console.log("Added new todo: " + todo)
    console.log(result)
  })
}

const fetchTodos = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM entries`)
    console.log(rows)
    return rows
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  insertTodo,
  fetchTodos
}
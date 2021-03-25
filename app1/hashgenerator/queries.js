const Pool = require('pg').Pool
const process = require('process')

const pool = new Pool({
  user: 'postgres',
  host: 'postgres-svc',
  database: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
})

const pongDB = async () => {
  try {
    const { rows } = await pool.query(`SELECT * FROM pingpongs WHERE resourcekey = $1`, ['pingpong'])
    console.log(rows)
    return rows
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  pongDB
}
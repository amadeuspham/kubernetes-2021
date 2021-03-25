const Pool = require('pg').Pool
const process = require('process')

const pool = new Pool({
  user: 'postgres',
  host: 'postgres-svc',
  database: 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
})

const pingDB = (resourceKey, value) => {
  pool.query(`
    INSERT INTO pingpongs (resourceKey, value)
    VALUES($1, $2) 
    ON CONFLICT (resourceKey) 
    DO 
      UPDATE SET value = $2;
  `, [resourceKey, value], (error, result) => {
    if (error) {
      throw error
    }
    console.log("Added")
    console.log(result)
  })
}

module.exports = {
  pingDB
}
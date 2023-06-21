const mysql = require('mysql')

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_surmeng',
})

module.exports = db

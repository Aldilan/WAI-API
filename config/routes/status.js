const express = require('express')
const db = require('../connection')

const router = express.Router()

router.use(express.json())

router.get('/status', function (req, res) {
  const { id } = req.query

  let sql = 'SELECT * FROM tb_status'
  let values = []

  if (id) {
    sql += ' WHERE id = ?'
    values.push(id)
  }

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error('Error executing query:', error)
      res.status(500).send('Error executing query')
    } else {
      res.send(result)
    }
  })
})

router.post('/status', function (req, res) {
  const { user_id, title, content } = req.body

  const sql = 'INSERT INTO tb_status (user_id, title, content) VALUES (?,?,?)'
  const values = [user_id, title, content]

  db.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error inserting data:', error)
      res.status(500).send('Error inserting data')
    } else {
      const insertedId = results.insertId
      console.log('Data inserted successfully')
      res.send({ id: insertedId })
    }
  })
})

module.exports = router

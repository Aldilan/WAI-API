const express = require('express')
const db = require('../connection')
const router = express.Router()
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')
const bcrypt = require('bcrypt')
const app = express()

// Set up multer storage and file filtering
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const randomName = crypto.randomBytes(16).toString('hex') // Generate a random name for the file
    const extension = path.extname(file.originalname)
    cb(null, randomName + extension) // Use the random name with the original file extension
  },
})

const fileFilter = (req, file, cb) => {
  // Only allow certain file types (e.g., JPEG, PNG)
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter })

router.use(express.json())

router
  .route('/users')
  .get(function (req, res) {
    const { id } = req.query // Get the 'id' value from the query parameters

    let sql = 'SELECT * FROM tb_users'
    let values = []

    // Check if 'id' is provided and construct the query accordingly
    if (id) {
      sql += ' WHERE id = ?'
      values.push(id)
    }

    db.query(sql, values, (error, result) => {
      if (error) {
        console.error('Error executing query:', error)
        res.status(500).send('Error executing query')
      } else {
        res.send(result) // Send the result of the query as the response
      }
    })
  })
  .post(upload.single('image'), function (req, res) {
    const { name, username, password, birth, gender, address } = req.body
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error('Error generating salt:', err)
      } else {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            console.error('Error hashing passowrd:', err)
          } else {
            const image = req.file.path // Get the file path of the uploaded image

            const sql =
              'INSERT INTO tb_users (name, username, password, birth, gender, address, image) VALUES (?,?,?,?,?,?,?)'
            const values = [name, username, hash, birth, gender, address, image]

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
          }
        })
      }
    })
  })

router.put('/users/:id', upload.single('image'), function (req, res) {
  const userId = req.params.id // Get the user ID from the URL parameter
  const { name, username, password, birth, gender, address } = req.body

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error('Error generating salt:', err)
      res.status(500).send('Error generating salt')
    } else {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err)
          res.status(500).send('Error hashing password')
        } else {
          let updateFields = ''
          let values = []

          // Build the update fields based on the provided data
          if (name) {
            updateFields += 'name = ?, '
            values.push(name)
          }
          if (username) {
            updateFields += 'username = ?, '
            values.push(username)
          }
          if (password) {
            updateFields += 'password = ?, '
            values.push(hash)
          }
          if (birth) {
            updateFields += 'birth = ?, '
            values.push(birth)
          }
          if (gender) {
            updateFields += 'gender = ?, '
            values.push(gender)
          }
          if (address) {
            updateFields += 'address = ?, '
            values.push(address)
          }
          if (req.file) {
            updateFields += 'image = ?, '
            values.push(req.file.path)
          }

          updateFields = updateFields.slice(0, -2) // Remove the trailing comma and space

          const sql = `UPDATE tb_users SET ${updateFields} WHERE id = ?`
          values.push(userId)

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
        }
      })
    }
  })
})

router.post('/users/login', function (req, res) {
  const { username, password } = req.body

  const sql = 'SELECT * FROM tb_users WHERE username = ?'
  const values = [username]

  db.query(sql, values, (error, result) => {
    if (error) {
      console.error('Error executing query:', error)
      res.status(500).send('Error executing query')
    } else {
      if (result.length > 0) {
        const user = result[0]
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
          if (err) {
            console.error('Error comparing passwords:', err)
            res.status(500).send('Error comparing passwords')
          } else if (passwordMatch) {
            res.send(user) // Send the user object as the response
          } else {
            res.status(401).send('Invalid password')
          }
        })
      } else {
        res.status(404).send('User not found')
      }
    }
  })
})

module.exports = router

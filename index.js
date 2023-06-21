const express = require('express')
const app = express()
const port = 2000
const useUsers = require('./config/routes/users')
const useStatus = require('./config/routes/status')
const useValidations = require('./config/routes/validation')

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.use('/api', useUsers)
app.use('/api', useStatus)
app.use('/api', useValidations)
app.use('/uploads', express.static('uploads'))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

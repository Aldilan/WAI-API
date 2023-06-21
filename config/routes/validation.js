const express = require('express')
const db = require('../connection')
const router = express.Router()
const multer = require('multer')
const crypto = require('crypto')
const path = require('path')
const bcrypt = require('bcrypt')
const app = express()

router.use(express.json())

router.post('/users/validation/location', function (req, res) {
  const { latitude, longitude } = req.body
  res.send(latitude + ' ' + longitude)
})

module.exports = router

const express = require('express')
const AccessController  = require('../controller/AccessController')

const router = express.Router()

router.post('/register', AccessController.Register)

router.post('/login', AccessController.Login)

module.exports = router
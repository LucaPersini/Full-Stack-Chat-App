const express = require('express')
const ChatController = require('../controller/ChatController')

const router = express.Router()

router.get('/messages', ChatController.ReadMessages)

router.post('/send-message', ChatController.CreateMessage)

router.delete('/delete-message/:id', ChatController.DeleteMessage)

router.delete('/delete-account/:username', ChatController.DeleteAccount)

module.exports = router
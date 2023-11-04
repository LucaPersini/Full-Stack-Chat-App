require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const AccessRouter = require('./routes/AccessRouter')
const ChatRouter = require('./routes/ChatRouter')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_DOMAIN,
    methods: ['GET', 'POST', 'DELETE']
  }
})
app.use(express.json())
app.use(cors())

const port = process.env.PORT || 3000

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(port)
    console.log(`Database connected at port ${port}`)
  })
  .catch(error => {
    console.log(error)
  })

io.on('connection', socket => {
  socket.on('chat-message', message => {
    io.emit('chat-message', message)
  })

  socket.on('delete-message', id => {
    io.emit('delete-message', id)
  })

  socket.on('delete-messages', messagesToDelete => {
    io.emit('delete-messages', messagesToDelete)
  })
})

app.use('/api', AccessRouter)

app.use('/api', ChatRouter)
require('dotenv')
const jwt  = require('jsonwebtoken')
const Message = require('../models/Message')
const User = require('../models/User')

const VerifyUser = async function(token) {
  let result = {}
  if(!token || !typeof(String)) {
    return result = {status: 'error', error: 'Invalid token'}
  }

  const user  = jwt.verify(token, process.env.JWT_SECRET)
  
  if(!user) {
    return result = {status: 'error', error: 'You must be logged in to access this page.'}
  }

  return result = {status: 'ok', message: 'Verification succeeded.', user}
}

const ReadMessages = async function(req, res) {
  const token = req.headers.authorization
  let user = {}
  try {
    const result = await VerifyUser(token)
    if(result.status == 'error') {
      return res.json({status: 'error', error: result.data.error})
    }
    user = result
  }
  catch (error) {
    return res.json({status: 'error', error: 'Access denied.'})
  }

  try{
    const messages = await Message.find()
    return res.json({status: 'ok', messages, user})
  }
  catch (error) {
    return res.json({status: 'error', error: 'Something went wrong!'})
  }
}

const CreateMessage = async function(req, res) {
  const token = req.headers.authorization
  const {username, text, date} = req.body

  try {
    const result = await VerifyUser(token)
    if(result.status == 'error') {
      return res.json({status: 'error', error: result.data.error})
    }
  }
  catch (error) {
    console.log(error.message)
    return res.json({status: 'error', error: 'Access denied.'})
  }

  if(!username || !typeof(username) == String) {
    return res.json({status: 'error', error: 'Invalid data.'})
  }

  if(!text || !typeof(text) == String || text == '') {
    return res.json({status: 'error', error: 'Invalid data.'})
  }

  if(!date || !typeof(date) == String) {
    return res.json({status: 'error', error: 'Invalid data.'})
  }

  const message = {
    username,
    text,
    date
  }

  try{
    const newMessage = await Message.create(message)
    return res.json({status: 'ok', message: 'Your message has been sent successfully.', newMessage})
  }
  catch (error) {
    console.log(error.message)
    return res.json({status: 'error', error: 'Message has not been sent', msg: error.message})
  }
}

const DeleteMessage = async function(req, res) {
  const messageId = req.params.id
  const token  = req.headers.authorization
  try {
    const result = await VerifyUser(token)
    if(result.status == 'error') {
      return res.json({status: 'error', error: result.error})
    }
  }
  catch (error) {
    return res.json({status: 'error', error: 'Access denied.'})
  }

  try {
    const deletedMessage = await Message.findByIdAndDelete(messageId)
  }
  catch (error) {
    return res.json({status: 'error', error: 'Message has not been delete.'})
  }

  return res.json({status: 'ok', message: 'Your message has been delete successfully.'})
}

const DeleteAccount = async function(req, res) {
  const username = req.params.username
  const token  = req.headers.authorization
  try {
    const result = await VerifyUser(token)
    if(result.status == 'error') {
      return res.json({status: 'error', error: result.error})
    }
  }
  catch (error) {
    return res.json({status: 'error', error: 'Access denied.'})
  }

  if(!username || !typeof(username) == String) {
    return res.json({status: 'error', error:'Invalid data'})
  }

  try {
    const result = await User.deleteOne({username})
  }
  catch (error) {
    return res.json({status:'error', error:'The account has not been deleted.'})
  }

  try{
    await Message.deleteMany({username})
  }
  catch(error) {

  }
  return res.json({status: 'ok', message: 'The account has been deleted', username})
}

module.exports = {
  VerifyUser,
  ReadMessages,
  CreateMessage,
  DeleteMessage,
  DeleteAccount
}
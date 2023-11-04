const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const CheckUserInput = function(username, password) {
  if(!username || !typeof(username) =='string') {
    return false
  }

  if(!password || !typeof(password) == 'string') {
    return false
  }

  return true
}

const Register = async function(req, res) {
  const {username, password} = req.body

  if(CheckUserInput(username, password) == false) {
    return res.json({status:'error', error: 'Invalid username or password.'})
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = {
    username: username,
    password: hashedPassword
  }

  try{
    const result = await User.create(user)
    if(result) {
      return res.json({status:'ok', message: 'Registration was successful.'})  
    } else {
      return res.json({status:'error', error:'Username already in use.'})
    }
         
  }
  catch (error) {
    if(error.code == 11000) {
      return res.json({status:'error', error:'Username already in use.'})
    }
    return res.json({status:'error', error:'Something went wrong!'})
  }
}

const Login = async function(req, res) {
  const {username, password} = req.body

  if(CheckUserInput(username, password) == false) {
    return res.json({status:'error', error: 'Invalid username or password.'})
  }

  const user = await User.findOne({username: username})

  if(!user || !(await bcrypt.compare(password, user.password))) {
    return res.json({status:'error', error: 'Invalid username or password.'})
  }

  const token = jwt.sign({username: user.username}, process.env.JWT_SECRET)
  res.json({status:'ok', token})
}

module.exports = {
  Register,
  Login
}
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')


loginRouter.post('/', async (req, res, next) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);
  
    if (!passwordCorrect || !user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
  
    const userForToken = {
      id: user._id,
      username: user.username,
    };
    const token = jwt.sign(userForToken, process.env.SECRET);
  
    res.status(200).json({ token, username: user.username, name: user.name });
  });

  module.exports = loginRouter
  
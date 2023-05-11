const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')


usersRouter.post('/', async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'username and password must be given' });
    }

    if (username.length < 3 || password.length < 3) {
      return res.status(400).json({ error: 'username and password must be at least 3 characters long' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'username must be unique' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();

    res.json(savedUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
});
usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
  response.json(users.map(user => user.toJSON()))
})

module.exports = usersRouter
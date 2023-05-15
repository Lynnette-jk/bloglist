const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password must be given" });
    }

    if (username.length < 3 || password.length < 3) {
      return res
        .status(400)
        .json({
          error: "username and password must be at least 3 characters long",
        });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "username must be unique" });
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
// associate blogs with user
usersRouter.post("/:username/blogs", async (req, res, next) => {
  try {
    const { username } = req.params;
    const { title, author, url, likes } = req.body;
    

    // Find the user by username
    const user = await User.findOne({ username });

    // If the user doesn't exist, return a 404 error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Associate each blog with the user
    for (const blogData of blogs) {
      const blog = new Blog(blogData);
      blog.author = username;
      await blog.save();
      user.blogs.push(blog._id);
    }

    // Save the user
    await user.save();

    // Return the updated user
    const updatedUser = await User.findOne({ username }).populate("blogs", {
      title: 1,
      author: 1,
      url: 1,
      likes: 1,
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = usersRouter;

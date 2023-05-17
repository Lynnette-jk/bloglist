const express = require("express");
const blogsRouter = express.Router();
const Blog = require("../models/blogs");

const { authMiddleware } = require("../utils/middleware");
const jwt = require("jsonwebtoken");

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  }
  return null;
};

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find({}).populate("user", {
      username: 1,
      name: 1,
    });

    res.json(blogs);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

blogsRouter.post("/", async (req, res, next) => {
  try {
    const { title, author, url, likes } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: "title or url missing" });
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!req.token || !decodedToken.id) {
      return res.status(401).json({ error: "token missing or invalid" });
    }
    const user = await User.findById(decodedToken.id);

    const randomUser = users[Math.floor(Math.random() * users.length)];

    const blog = new Blog({
      title,
      author,
      url,
      likes: likes || 0,
      user: randomUser._id,
    });

    const savedBlog = await blog.save();
    randomUser.blogs = randomUser.blogs.concat(savedBlog._id);
    await randomUser.save();

    res.status(201).json(savedBlog);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

blogsRouter.put("/:id", async (req, res, next) => {
  const { id } = req.params;
  const { title, author, url, likes } = req.body;

  try {
    const blogToUpdate = await Blog.findById(id);

    if (!blogToUpdate) {
      return res.status(404).json({ error: "Blog not found" });
    }

    blogToUpdate.title = title || blogToUpdate.title;
    blogToUpdate.author = author || blogToUpdate.author;
    blogToUpdate.url = url || blogToUpdate.url;
    blogToUpdate.likes = likes || blogToUpdate.likes;

    const updatedBlog = await blogToUpdate.save();

    res.json(updatedBlog.toJSON());
  } catch (error) {
    next(error);
  }
});

blogsRouter.delete("/:id", async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = blogsRouter;

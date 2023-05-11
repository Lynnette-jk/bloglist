const express = require("express");
const blogsRouter = express.Router();
const Blog = require("../models/blogs");

blogsRouter.get("/", async (req, res, next) => {
  try {
    const blogs = await Blog.find({});
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
    const blog = new Blog({
      title,
      author,
      url,
      likes: likes || 0,
    });
    const savedBlog = await blog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

blogsRouter.put("/:id", async (req, res, next) => {
  try {
    const { title, author, url, likes } = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        url,
        likes,
      },
      { new: true }
    );
    res.json(updatedBlog);
  } catch (error) {
    console.error(error);
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

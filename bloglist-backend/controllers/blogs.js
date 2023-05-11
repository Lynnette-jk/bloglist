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

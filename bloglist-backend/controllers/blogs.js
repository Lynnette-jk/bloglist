const express = require("express");
const blogsRouter = express.Router();
const Blog = require("../models/blogs");
const User = require("../models/user");

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

blogsRouter.post("/", authMiddleware, async (req, res, next) => {
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

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const blog = new Blog({
      title,
      author,
      url,
      likes: likes || 0,
      user: user._id,
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

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

blogsRouter.delete("/:id", authMiddleware, async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id);

    if (!blog) {
      return response.status(404).json({ error: "Blog not found" });
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!req.token || !decodedToken.id) {
      return res.status(401).json({ error: "Token missing or invalid" });
    }

    const userId = decodedToken.id;

    // Check if the user ID of the blog's creator matches the current user's ID

    // Add the logic to check if the logged-in user is the creator of the blog
    if (blog.user.toString() !== request.user._id.toString()) {
      return response
        .status(401)
        .json({ error: "You are not authorized to delete this blog" });
    }

    await Blog.findByIdAndRemove(request.params.id);

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;

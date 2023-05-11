const mongoose = require("mongoose");
const supertest = require("supertest");
const request = require("supertest");
const app = require("../app");

const api = supertest(app);
const Blog = require("../models/blogs");

beforeEach(async () => {
  await Blog.deleteMany({});
  const blog1 = new Blog({
    title: "Blog 1",
    author: "Author 1",
    url: "http://example.com/blog1",
  });
  const blog2 = new Blog({
    title: "Blog 2",
    author: "Author 2",
    url: "http://example.com/blog2",
  });
  await blog1.save();
  await blog2.save();
}, 30000);

describe("GET /api/blogs", () => {
  test("returns the correct amount of blog posts", async () => {
    const response = await request(app).get("/api/blogs");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2); // Replace 2 with the expected number of blog posts
  });
});

describe("Blog post unique identifier", () => {
  test("blog post should have id property", async () => {
    const newBlog = {
      title: "Test blog post",
      author: "Test author",
      url: "https://www.example.com",
      likes: 0,
    };
    const savedBlog = await api.post("/api/blogs").send(newBlog);
    expect(savedBlog.body.id).toBeDefined();
  });
});

describe("creating a new blog post", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
  });

  test("succeeds with valid data", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "John Doe",
      url: "http://testblog.com",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const blogsAfter = await Blog.find({});
    expect(blogsAfter).toHaveLength(1);
    expect(blogsAfter[0].title).toEqual("Test Blog");
    expect(blogsAfter[0].author).toEqual("John Doe");
    expect(blogsAfter[0].url).toEqual("http://testblog.com");
    expect(blogsAfter[0].likes).toEqual(10);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

const mongoose = require("mongoose");
const supertest = require("supertest");
const request = require("supertest");
const app = require("../app");

const api = supertest(app);
const Blog = require("../models/blogs");
const helper = require("../utils/list_helper");

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

describe("POST requests to /api/blogs", () => {
  test("if likes property is missing, it defaults to 0", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "John Doe",
      url: "http://testblog.com",
    };

    const response = await api.post("/api/blogs").send(newBlog).expect(201);
    expect(response.body.likes).toBe(0);
  });

  // Other tests for POST requests to /api/blogs can go here
});

describe("when creating a new blog post", () => {
  test("if title property is missing, responds with status code 400", async () => {
    const newBlog = {
      author: "John Doe",
      url: "http://testblog.com",
      likes: 10,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("if url property is missing, responds with status code 400", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "John Doe",
      likes: 10,
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

describe("deleting a blog post", () => {
  test("deleting a blog post succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

    const titles = blogsAtEnd.map((blog) => blog.title);
    expect(titles).not.toContain(blogToDelete.title);
  });
});

describe("updating likes for a blog post", () => {
  test("updating likes for a blog post succeeds with status code 200", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1,
    };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlogInDb = blogsAtEnd.find(
      (blog) => blog.id === blogToUpdate.id
    );

    expect(updatedBlogInDb.likes).toBe(blogToUpdate.likes + 1);
  });
});

describe("Creating a user with invalid username and/or password", () => {
  test("creating a user with invalid username and/or password fails with status code 400", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser1 = {
      username: "ab",
      name: "Alice Bobson",
      password: "12345",
    };

    const newUser2 = {
      username: "charlie",
      name: "Charlie Davidson",
      password: "12",
    };

    const newUser3 = {
      username: "bob",
      name: "Bob Johnson",
    };

    const response1 = await api.post("/api/users").send(newUser1).expect(400);
    expect(response1.body.error).toContain(
      "username and password must be at least 3 characters long"
    );

    const response2 = await api.post("/api/users").send(newUser2).expect(400);
    expect(response2.body.error).toContain(
      "username and password must be at least 3 characters long"
    );

    const response3 = await api.post("/api/users").send(newUser3).expect(400);
    expect(response3.body.error).toContain(
      "username and password must be given"
    );

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

describe("Adding a new blog", () => {
  let token;

  beforeEach(async () => {
    // Log in a user and obtain the token
    const user = {
      username: "testuser",
      password: "testpassword",
    };

    const response = await api.post("/api/login").send(user);
    token = response.body.token;
  });

  test("should add a new blog with valid data", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "http://testblog.com",
      likes: 10,
    };

    await api
      .post("/api/blogs")
      .send(newBlog)
      .set("Authorization", `Bearer ${token}`)
      .expect(201)
      .expect("Content-Type", /application\/json/);
  });

  test("should return 401 Unauthorized when adding a blog without a token", async () => {
    const newBlog = {
      title: "Test Blog",
      author: "Test Author",
      url: "http://testblog.com",
      likes: 10,
    };

    await api.post("/api/blogs").send(newBlog).expect(401);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

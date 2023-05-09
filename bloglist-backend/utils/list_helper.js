const dummy = (blogs) => {
    return 1
  }
  const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0);
  };
  
  const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
      return null
    }
  
    let favorite = blogs[0]
  
    for (let i = 1; i < blogs.length; i++) {
      if (blogs[i].likes > favorite.likes) {
        favorite = blogs[i]
      }
    }
  
    return {
      title: favorite.title,
      author: favorite.author,
      likes: favorite.likes
    }
  }
  const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
      return null;
    }
  
    const blogCount = {};
    let topAuthor = '';
  
    // count the number of blogs for each author
    blogs.forEach(blog => {
      if (!blogCount[blog.author]) {
        blogCount[blog.author] = 1;
      } else {
        blogCount[blog.author]++;
      }
    });
  
    // find the author with the most blogs
    let maxBlogs = 0;
    for (let author in blogCount) {
      if (blogCount[author] > maxBlogs) {
        maxBlogs = blogCount[author];
        topAuthor = author;
      }
    }
  
    return {
      author: topAuthor,
      blogs: maxBlogs
    };
  };
  
  
  module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
  };
  



  

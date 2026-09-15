import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBlogs } from "../api/blogApi";

function BlogListPage() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    loadBlogs();
  }, []);

  async function loadBlogs() {
    try {
      const response = await getAllBlogs();
      setBlogs(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="card">
      <div className="page-header">
        <h1>Blogs</h1>
        <Link to="/blogs/create">
          <button>Create Blog</button>
        </Link>
      </div>

      {blogs.length === 0 && <p>No blogs yet.</p>}

      <div className="grid">
        {blogs.map((blog) => (
          <div className="item-card" key={blog.id || blog._id}>
            <h3>{blog.title}</h3>
            <p>{blog.description}</p>
            <p className="muted">Author: {blog.userId}</p>

            <Link to={`/blogs/${blog.id || blog._id}`}>
              <button>Open</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogListPage;
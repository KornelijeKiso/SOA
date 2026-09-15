import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllBlogs } from "../api/blogApi";
import { apiError, asList } from "../api/responseUtils";

export default function BlogListPage() {
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    getAllBlogs({ signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setBlogs(asList(data)); })
      .catch((err) => { if (!controller.signal.aborted) setError(apiError(err, "Could not load blogs.")); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <div className="card">
    <div className="page-header"><h1>Blogs</h1><Link to="/blogs/create">Create Blog</Link></div>
    {loading && <p>Loading blogs...</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {!loading && !error && blogs.length === 0 && <p>No blogs yet.</p>}
    <div className="grid">
      {blogs.map((blog) => <article className="item-card" key={blog.id || blog._id}>
        <h2>{blog.title}</h2><p>{blog.description}</p><p className="muted">Author: {blog.userId}</p>
        <Link to={"/blogs/" + encodeURIComponent(blog.id || blog._id)}>Open</Link>
      </article>)}
    </div>
  </div>;
}
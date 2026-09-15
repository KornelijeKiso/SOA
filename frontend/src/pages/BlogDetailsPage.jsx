import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { addBlogComment, getBlogById, getBlogComments } from "../api/blogApi";
import { getUserId } from "../auth/authStorage";

function BlogDetailsPage() {
  const { blogId } = useParams();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadBlog();
    loadComments();
  }, [blogId]);

  async function loadBlog() {
    try {
      const response = await getBlogById(blogId);
      setBlog(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadComments() {
    try {
      const response = await getBlogComments(blogId);
      setComments(response.data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleComment(e) {
    e.preventDefault();

    try {
      await addBlogComment(blogId, {
        authorId: getUserId(),
        text,
      });

      setText("");
      loadComments();
    } catch (err) {
      console.error(err);
    }
  }

  if (!blog) {
    return (
      <div className="card">
        <p>Loading blog...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h1>{blog.title}</h1>
      <p>{blog.description}</p>
      <p className="muted">Author: {blog.userId}</p>

      {(blog.images || []).length > 0 && (
        <div className="image-list">
          {blog.images.map((img, index) => (
            <img key={index} src={img} alt="Blog" />
          ))}
        </div>
      )}

      <hr />

      <h2>Comments</h2>

      <form onSubmit={handleComment}>
        <div className="input-group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment..."
            required
          />
        </div>

        <button>Add Comment</button>
      </form>

      <div className="comment-list">
        {(!comments || comments.length === 0) && <p>No comments yet.</p>}

        {(comments || []).map((comment) => (
          <div className="comment" key={comment.id || comment._id}>
            <p>{comment.text}</p>
            <p className="muted">By: {comment.authorId}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BlogDetailsPage;
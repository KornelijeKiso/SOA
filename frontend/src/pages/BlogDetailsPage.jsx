import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { addBlogComment, getBlogById, getBlogComments, getFollowing } from "../api/blogApi";
import { getUserId } from "../auth/authStorage";
import { apiError, asList } from "../api/responseUtils";

export default function BlogDetailsPage() {
  const { blogId } = useParams();
  const userId = getUserId();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [following, setFollowing] = useState([]);
  const [verified, setVerified] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const config = { signal: controller.signal };
    setLoading(true); setError(""); setMessage(""); setBlog(null); setVerified(false); setFollowing([]); setComments([]);
    Promise.allSettled([getBlogById(blogId, config), getBlogComments(blogId, config), getFollowing(userId, config)])
      .then(([blogResult, commentsResult, followingResult]) => {
        if (controller.signal.aborted) return;
        const errors = [];
        if (blogResult.status === "fulfilled" && blogResult.value.data) setBlog(blogResult.value.data);
        else errors.push(apiError(blogResult.reason, "Could not load the blog."));
        if (commentsResult.status === "fulfilled") setComments(asList(commentsResult.value.data));
        else errors.push(apiError(commentsResult.reason, "Could not load comments."));
        if (followingResult.status === "fulfilled") {
          setFollowing(asList(followingResult.value.data)); setVerified(true);
        } else errors.push(apiError(followingResult.reason, "Could not verify whether you follow this author."));
        setError(errors.join(" "));
        setLoading(false);
      });
    return () => controller.abort();
  }, [blogId, userId]);

  const ownBlog = blog?.userId === userId;
  const canComment = verified && !ownBlog && following.some((relation) => relation.followingId === blog?.userId);
  async function comment(event) {
    event.preventDefault();
    if (!canComment || busy) return;
    if (!text.trim()) { setError("Enter a comment."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await addBlogComment(blogId, { authorId: userId, text: text.trim() });
      setText(""); setMessage("Comment added.");
      const { data } = await getBlogComments(blogId);
      setComments(asList(data));
    } catch (err) {
      setError(apiError(err, "Could not submit or reload comments."));
      if (err.response?.status === 403) setVerified(false);
    } finally { setBusy(false); }
  }
  return <div className="card">
    {loading && <p>Loading blog...</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    {blog && <>
      <h1>{blog.title}</h1><p>{blog.description}</p><p className="muted">Author: {blog.userId}</p>
      <div className="image-list">{asList(blog.images).map((image, index) => <img src={image} key={index} alt="Blog" />)}</div>
      <hr /><h2>Comments</h2>
      {canComment ? <form onSubmit={comment}>
        <div className="input-group"><label htmlFor="comment">Your comment</label>
          <textarea id="comment" value={text} onChange={(event) => setText(event.target.value)} required disabled={busy} /></div>
        <button disabled={busy}>Add Comment</button>
      </form> : <p>{ownBlog ? "You cannot comment on your own blog." :
        !verified ? "Following status could not be verified. Reload this page to try again." :
        "Follow the author first to comment on this blog."} {!ownBlog && <Link to="/follow">Follow Users</Link>}</p>}
      <div className="comment-list">
        {comments.length === 0 && <p>No comments yet.</p>}
        {comments.map((item) => <div className="comment" key={item.id || item._id}>
          <p>{item.text}</p><p className="muted">By: {item.authorId}</p>
        </div>)}
      </div>
    </>}
  </div>;
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createBlog } from "../api/blogApi";
import { getUserId } from "../auth/authStorage";

import { apiError, commaList } from "../api/responseUtils";

function CreateBlogPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    images: "",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");

    try {
      await createBlog({
        userId: getUserId(),
        title: form.title,
        description: form.description,
        images: commaList(form.images),
      });

      navigate("/blogs");
    } catch (err) {
      setError(apiError(err, "Failed to create blog."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card form">
      <h1>Create Blog</h1>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Images</label>
          <input
            name="images"
            value={form.images}
            onChange={handleChange}
            placeholder="image1.jpg, image2.jpg"
          />
        </div>

        <button disabled={busy}>Create</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateBlogPage;
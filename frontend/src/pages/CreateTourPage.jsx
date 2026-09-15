import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTour } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";

import { apiError, commaList } from "../api/responseUtils";

function CreateTourPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: 1,
    tags: "",
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
      await createTour({
        guideId: getUserId(),
        name: form.name,
        description: form.description,
        difficulty: Number(form.difficulty),
        tags: commaList(form.tags),
      });

      navigate("/tours");
    } catch (err) {
      setError(apiError(err, "Failed to create tour."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card form">
      <h1>Create Tour</h1>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
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
          <label>Difficulty</label>
          <select name="difficulty" value={form.difficulty} onChange={handleChange}>
            <option value="0">Easy</option>
            <option value="1">Medium</option>
            <option value="2">Hard</option>
          </select>
        </div>

        <div className="input-group">
          <label>Tags</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="mountain, nature, city"
          />
        </div>

        <button disabled={busy}>Create</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateTourPage;
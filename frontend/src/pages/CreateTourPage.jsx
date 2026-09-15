import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTour } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";

function CreateTourPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    difficulty: 1,
    tags: "",
  });

  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await createTour({
        guideId: getUserId(),
        name: form.name,
        description: form.description,
        difficulty: Number(form.difficulty),
        tags: form.tags
          ? form.tags.split(",").map((tag) => tag.trim())
          : [],
      });

      navigate("/tours");
    } catch (err) {
      console.error(err);
      setError("Failed to create tour.");
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
          <input
            name="difficulty"
            type="number"
            min="0"
            value={form.difficulty}
            onChange={handleChange}
            required
          />
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

        <button>Create</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateTourPage;
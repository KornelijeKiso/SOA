import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addKeyPoint } from "../api/tourApi";

function AddKeyPointPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    latitude: "",
    longitude: "",
    name: "",
    description: "",
    image: "",
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
      await addKeyPoint(tourId, {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        name: form.name,
        description: form.description,
        image: form.image,
      });

      navigate(`/tours/${tourId}`);
    } catch (err) {
      console.error(err);
      setError("Failed to add key point.");
    }
  }

  return (
    <div className="card form">
      <h1>Add Key Point</h1>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Latitude</label>
          <input
            name="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Longitude</label>
          <input
            name="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={handleChange}
            required
          />
        </div>

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
          <label>Image URL</label>
          <input name="image" value={form.image} onChange={handleChange} />
        </div>

        <button>Add Key Point</button>

        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default AddKeyPointPage;
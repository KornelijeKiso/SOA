import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addKeyPoint } from "../api/tourApi";
import { apiError, validPosition } from "../api/responseUtils";
import LocationMap from "../components/LocationMap";

export default function AddKeyPointPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }); }
  async function submit(event) {
    event.preventDefault();
    if (!validPosition(position)) { setError("Select a location on the map first."); return; }
    if (busy) return;
    setBusy(true); setError("");
    try {
      await addKeyPoint(tourId, { ...position, ...form });
      navigate("/tours/" + encodeURIComponent(tourId));
    } catch (err) {
      setError(apiError(err, "Could not add the key point."));
    } finally { setBusy(false); }
  }
  return <div className="card">
    <h1>Add Key Point</h1>
    <LocationMap position={position} onSelect={setPosition} disabled={busy} />
    <form onSubmit={submit}>
      <div className="input-group"><label htmlFor="point-name">Name</label>
        <input id="point-name" name="name" value={form.name} onChange={change} required disabled={busy} /></div>
      <div className="input-group"><label htmlFor="point-description">Description</label>
        <textarea id="point-description" name="description" value={form.description} onChange={change} required disabled={busy} /></div>
      <div className="input-group"><label htmlFor="point-image">Image URL</label>
        <input id="point-image" name="image" value={form.image} onChange={change} disabled={busy} /></div>
      {error && <p className="error" role="alert">{error}</p>}
      <div className="actions">
        <button disabled={busy}>{busy ? "Saving..." : "Add Key Point"}</button>
        <Link to={"/tours/" + encodeURIComponent(tourId)}>Back to Tour</Link>
      </div>
    </form>
  </div>;
}
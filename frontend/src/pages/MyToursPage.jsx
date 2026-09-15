import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { archiveTour, getGuideTours, publishTour } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";
import { apiError, asList, commaList, difficultyName, tourStatus } from "../api/responseUtils";

export default function MyToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [publishing, setPublishing] = useState(null);
  const [form, setForm] = useState({ price: "", length: "", duration: "", images: "" });

  async function loadTours() {
    setLoading(true);
    try {
      setTours(asList((await getGuideTours(getUserId())).data));
    } catch (err) {
      setError(apiError(err, "Could not load your tours."));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { loadTours(); }, []);

  function openPublish(tour) {
    setPublishing(tour.id);
    setForm({
      price: tour.price ?? 0, length: tour.length ?? 0,
      duration: tour.duration ?? 0, images: asList(tour.images).join(", "),
    });
    setError(""); setMessage("");
  }
  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  async function publish(event) {
    event.preventDefault();
    if (busy) return;
    const price = Number(form.price), length = Number(form.length), duration = Number(form.duration);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(length) || length < 0 ||
        !Number.isInteger(duration) || duration < 0) {
      setError("Enter non-negative price and length, and a whole-number duration.");
      return;
    }
    setBusy(true); setError(""); setMessage("");
    try {
      await publishTour(publishing, { guideId: getUserId(), price, length, duration, images: commaList(form.images) });
      setPublishing(null);
      setMessage("Tour published.");
      await loadTours();
    } catch (err) {
      setError(apiError(err, "Could not publish the tour."));
    } finally { setBusy(false); }
  }
  async function archive(tourId) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await archiveTour(tourId, { guideId: getUserId() });
      setPublishing(null);
      setMessage("Tour archived.");
      await loadTours();
    } catch (err) {
      setError(apiError(err, "Could not archive the tour."));
    } finally { setBusy(false); }
  }
  return <div className="card">
    <div className="page-header"><h1>My Tours</h1><Link to="/tours/create">Create Tour</Link></div>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    {loading && <p>Loading tours...</p>}
    {!loading && !error && tours.length === 0 && <p>No tours yet.</p>}
    <div className="grid">
      {tours.map((tour) => <article className="item-card" key={tour.id}>
        <h2>{tour.name}</h2>
        <p>{tour.description}</p>
        <p>Difficulty: {difficultyName(tour.difficulty)}</p>
        <p>Tags: {asList(tour.tags).join(", ") || "None"}</p>
        <p>Status: {tourStatus(tour.status)}</p>
        <p>Price: {tour.price ?? 0} | Length: {tour.length ?? 0} | Duration: {tour.duration ?? 0}</p>
        <div className="actions">
          <Link to={"/tours/" + encodeURIComponent(tour.id)}>Open details</Link>
          {tourStatus(tour.status) === "Draft" && <button disabled={busy || loading} onClick={() => openPublish(tour)}>Publish</button>}
          {tourStatus(tour.status) !== "Archived" && <button disabled={busy || loading} onClick={() => archive(tour.id)}>Archive</button>}
        </div>
        {publishing === tour.id && <form onSubmit={publish}>
          <h3>Publish tour</h3>
          {["price", "length", "duration"].map((field) => <div className="input-group" key={field}>
            <label htmlFor={"publish-" + field}>{field[0].toUpperCase() + field.slice(1)}</label>
            <input id={"publish-" + field} name={field} type="number" min="0"
              step={field === "duration" ? "1" : "any"} required value={form[field]} onChange={change} disabled={busy} />
          </div>)}
          <div className="input-group">
            <label htmlFor="publish-images">Image URLs (optional, comma-separated)</label>
            <input id="publish-images" name="images" value={form.images} onChange={change} disabled={busy} />
          </div>
          <div className="actions">
            <button disabled={busy}>Confirm Publish</button>
            <button type="button" disabled={busy} onClick={() => setPublishing(null)}>Cancel</button>
          </div>
        </form>}
      </article>)}
    </div>
  </div>;
}
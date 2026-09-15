import { useEffect, useState } from "react";
import { getPosition, savePosition } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";
import { apiError, validPosition } from "../api/responseUtils";
import LocationMap from "../components/LocationMap";

export default function PositionSimulatorPage() {
  const [position, setPosition] = useState(null);
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    getPosition(getUserId(), { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (data == null) return;
        if (!validPosition(data)) throw new Error("Invalid position response");
        setPosition(data); setSaved(data);
      })
      .catch((err) => {
        if (!controller.signal.aborted && err.response?.status !== 404)
          setError(apiError(err, "Could not load your current position."));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  async function save() {
    if (!validPosition(position)) { setError("Select a location on the map first."); return; }
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { data } = await savePosition({
        touristId: getUserId(), latitude: position.latitude, longitude: position.longitude,
      });
      if (!validPosition(data)) throw new Error("Invalid position response");
      setSaved(data); setPosition(data);
      setMessage("Current position saved.");
    } catch (err) {
      setError(apiError(err, "Could not save your position."));
    } finally { setBusy(false); }
  }
  return <div className="card">
    <h1>Position Simulator</h1>
    {loading && <p>Loading current position...</p>}
    {!loading && !saved && <p>No saved position. Select a location and save it before starting a tour.</p>}
    <LocationMap position={position} onSelect={(point) => { setPosition(point); setMessage(""); }} disabled={loading || busy} />
    <button disabled={loading || busy || !validPosition(position)} onClick={save}>
      {busy ? "Saving..." : "Save Current Position"}
    </button>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    {saved && <div className="item-card">
      <h2>Saved coordinates</h2><p>Latitude: {saved.latitude}; longitude: {saved.longitude}</p>
    </div>}
  </div>;
}
import { useState } from "react";
import { getPosition, savePosition } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";

function PositionSimulatorPage() {
  const [form, setForm] = useState({
    latitude: "",
    longitude: "",
  });

  const [position, setPosition] = useState(null);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");

    try {
      await savePosition({
        touristId: getUserId(),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });

      setMessage("Position saved.");
      loadPosition();
    } catch (err) {
      console.error(err);
      setMessage("Failed to save position.");
    }
  }

  async function loadPosition() {
    try {
      const response = await getPosition(getUserId());
      setPosition(response.data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load position.");
    }
  }

  return (
    <div className="card form">
      <h1>Position Simulator</h1>

      <form onSubmit={handleSave}>
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

        <div className="actions">
          <button type="submit">Save Position</button>
          <button type="button" onClick={loadPosition}>
            Load My Position
          </button>
        </div>

        {message && <p className="success">{message}</p>}
      </form>

      {position && (
        <div className="item-card">
          <h3>Current Position</h3>
          <p>Latitude: {position.latitude}</p>
          <p>Longitude: {position.longitude}</p>
        </div>
      )}
    </div>
  );
}

export default PositionSimulatorPage;
import { useState } from "react";
import {
  abandonExecution,
  completeExecution,
  startExecution,
  updateExecutionLocation,
} from "../api/tourApi";
import { getUserId } from "../auth/authStorage";

function ActiveExecutionPage() {
  const [form, setForm] = useState({
    tourId: "",
    latitude: "",
    longitude: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleStart(e) {
    e.preventDefault();
    setMessage("");

    try {
      await startExecution({
        touristId: getUserId(),
        tourId: form.tourId,
      });

      setMessage("Tour execution started.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to start execution.");
    }
  }

  async function handleLocationUpdate() {
    try {
      await updateExecutionLocation({
        touristId: getUserId(),
        tourId: form.tourId,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });

      setMessage("Execution location updated.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update location.");
    }
  }

  async function handleAbandon() {
    try {
      await abandonExecution(getUserId(), form.tourId);
      setMessage("Tour abandoned.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to abandon tour.");
    }
  }

  async function handleComplete() {
    try {
      await completeExecution(getUserId(), form.tourId);
      setMessage("Tour completed.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to complete tour.");
    }
  }

  return (
    <div className="card form">
      <h1>Active Tour Execution</h1>

      <form onSubmit={handleStart}>
        <div className="input-group">
          <label>Tour ID</label>
          <input
            name="tourId"
            value={form.tourId}
            onChange={handleChange}
            required
          />
        </div>

        <button>Start Execution</button>
      </form>

      <hr />

      <div className="input-group">
        <label>Latitude</label>
        <input
          name="latitude"
          type="number"
          step="any"
          value={form.latitude}
          onChange={handleChange}
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
        />
      </div>

      <div className="actions">
        <button onClick={handleLocationUpdate}>Update Location</button>
        <button onClick={handleComplete}>Complete</button>
        <button onClick={handleAbandon}>Abandon</button>
      </div>

      {message && <p className="success">{message}</p>}
    </div>
  );
}

export default ActiveExecutionPage;
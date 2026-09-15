import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { abandonExecution, completeExecution, getPosition, startExecution, updateExecutionLocation } from "../api/tourApi";
import { startPositionPolling } from "../api/executionPolling";
import { getUserId } from "../auth/authStorage";
import { apiError, asList } from "../api/responseUtils";

function executionResponse(data, tourId) {
  if (!data || data.tourId !== tourId || !["Started", "Completed", "Abandoned"].includes(data.status))
    throw new Error("Invalid execution response.");
  return data;
}
function displayTime(value) {
  return value ? new Date(value).toLocaleString() : "Not available";
}

export default function ActiveExecutionPage() {
  const [params] = useSearchParams();
  const [tourId, setTourId] = useState(params.get("tourId") || "");
  const [execution, setExecution] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pollRevision, setPollRevision] = useState(0);
  const mounted = useRef(false);
  const actionLock = useRef(false);
  const actionController = useRef(null);
  const polling = useRef(null);
  const touristId = getUserId();
  const activeTourId = execution?.status === "Started" ? execution.tourId : null;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      actionController.current?.abort();
      polling.current?.stop(true);
    };
  }, []);

  useEffect(() => {
    if (!activeTourId) return;
    const poll = startPositionPolling({
      readPosition: async (signal) => (await getPosition(touristId, { signal })).data,
      updateLocation: async (position, signal) => {
        const { data } = await updateExecutionLocation({
          touristId, tourId: activeTourId,
          latitude: position.latitude, longitude: position.longitude,
        }, { signal });
        return executionResponse(data, activeTourId);
      },
      onUpdate: (data) => { setExecution(data); setError(""); },
      onError: (err) => setError(apiError(err, "Could not update execution location. Check your saved simulator position; tracking will retry.")),
    });
    polling.current = poll;
    return () => {
      poll.stop(true);
      if (polling.current === poll) polling.current = null;
    };
  }, [activeTourId, touristId, pollRevision]);

  async function start(event) {
    event.preventDefault();
    if (actionLock.current || activeTourId) return;
    const selectedId = tourId.trim();
    if (!selectedId) { setError("Enter a purchased tour ID."); return; }
    actionLock.current = true;
    setBusy(true); setError(""); setMessage("");
    const controller = new AbortController();
    actionController.current = controller;
    try {
      const { data } = await startExecution({ touristId, tourId: selectedId }, { signal: controller.signal });
      const next = executionResponse(data, selectedId);
      if (!mounted.current || controller.signal.aborted) return;
      setExecution(next);
      setTourId(selectedId);
      setMessage("Execution loaded. While active, your saved position is sent every 10 seconds.");
    } catch (err) {
      if (mounted.current && !controller.signal.aborted)
        setError(apiError(err, "Could not start the tour. It must be purchased and Published or Archived, with a saved simulator position."));
    } finally {
      actionLock.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function finish(kind) {
    if (actionLock.current || !activeTourId) return;
    actionLock.current = true;
    setBusy(true); setError(""); setMessage("");
    const controller = new AbortController();
    actionController.current = controller;
    try {
      // Prevent an earlier location update racing with Complete/Abandon.
      await polling.current?.stop();
      if (!mounted.current || controller.signal.aborted) return;
      const request = kind === "complete" ? completeExecution : abandonExecution;
      const { data } = await request(touristId, activeTourId, { signal: controller.signal });
      const next = executionResponse(data, activeTourId);
      if (next.status !== (kind === "complete" ? "Completed" : "Abandoned"))
        throw new Error("The execution did not reach its final state.");
      if (!mounted.current || controller.signal.aborted) return;
      setExecution(next);
      setMessage(kind === "complete" ? "Tour completed. Tracking stopped." : "Tour abandoned. Tracking stopped.");
    } catch (err) {
      if (mounted.current && !controller.signal.aborted) {
        setError(apiError(err, "Could not " + kind + " the tour. Tracking will resume."));
        setPollRevision((value) => value + 1);
      }
    } finally {
      actionLock.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  return <div className="card">
    <h1>Active Execution</h1>
    <p>Enter a purchased Published or Archived tour ID. Save a position in the Position Simulator first.</p>
    <p>Returning to this page? Enter the same tour ID and start again to resume its active execution.</p>
    <form onSubmit={start} className="form-inline">
      <label htmlFor="execution-tour">Tour ID</label>
      <input id="execution-tour" value={tourId} onChange={(event) => setTourId(event.target.value)}
        required disabled={busy || Boolean(activeTourId)} />
      <button disabled={busy || Boolean(activeTourId)}>Start / Resume</button>
    </form>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    {execution && <section className="item-card">
      <h2>Execution: {execution.tourId}</h2>
      <p>Status: {execution.status}</p>
      <p>Starting coordinates: {execution.startLatitude}, {execution.startLongitude}</p>
      <p>Start time: {displayTime(execution.startTime)}</p>
      <p>Last activity: {displayTime(execution.lastActivity)}</p>
      {execution.completionTime && <p>Completed: {displayTime(execution.completionTime)}</p>}
      {execution.abandonmentTime && <p>Abandoned: {displayTime(execution.abandonmentTime)}</p>}
      <h3>Completed key points</h3>
      {asList(execution.completedKeyPoints).length === 0 && <p>No key points completed yet.</p>}
      {asList(execution.completedKeyPoints).map((point) => <p key={point.keyPointId}>
        {point.keyPointId} — {displayTime(point.completedAt)}
      </p>)}
      {activeTourId && <div className="actions">
        <button disabled={busy} onClick={() => finish("complete")}>Complete</button>
        <button disabled={busy} onClick={() => finish("abandon")}>Abandon</button>
      </div>}
    </section>}
    <div className="actions">
      <Link to="/position">Position Simulator</Link>
      <Link to="/tours/published">Published Tours</Link>
    </div>
    <p className="muted">Tracking stops when you leave this page. You can update the simulator in another tab while tracking continues here.</p>
  </div>;
}
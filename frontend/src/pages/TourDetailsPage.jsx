import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGuideTours, getTourForTourist } from "../api/tourApi";
import { getRole, getUserId } from "../auth/authStorage";
import { apiError, asList, tourStatus } from "../api/responseUtils";
import TourContent, { KeyPoints } from "../components/TourContent";
import AddToCartButton from "../components/AddToCartButton";

export default function TourDetailsPage() {
  const { tourId } = useParams();
  const role = getRole();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(""); setTour(null);
    async function load() {
      try {
        let selected;
        if (role === "GUIDE") {
          const { data } = await getGuideTours(getUserId(), { signal: controller.signal });
          selected = asList(data).find((item) => item.id === tourId);
        } else {
          selected = (await getTourForTourist(tourId, getUserId(), { signal: controller.signal })).data;
        }
        if (!controller.signal.aborted) {
          if (!selected) setError("Tour not found or not accessible.");
          else setTour(selected);
        }
      } catch (err) {
        if (!controller.signal.aborted) setError(apiError(err, "Could not load the tour."));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [tourId, role]);
  const points = asList(tour?.keyPoints);
  const status = tourStatus(tour?.status);
  return <div className="card">
    <h1>Tour Details</h1>
    {loading && <p>Loading tour...</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {!loading && tour && <>
      <p className="muted">Tour ID: {tour.id}</p>
      <TourContent tour={tour} />
      <KeyPoints points={points} title={role === "GUIDE" ? "Key points" :
        tour.isPurchased === true ? "All tour key points" : "Starting point"} />
      {role === "TOURIST" && tour.isPurchased === false && <p className="muted">
        Purchase this tour to see all its key points. The starting point is shown when available.
      </p>}
      <div className="actions">
        {role === "GUIDE" ? <>
          <Link to={"/tours/" + encodeURIComponent(tourId) + "/key-points/add"}>Add Key Point</Link>
          <Link to="/tours">My Tours</Link>
        </> : <>
          {status === "Published" && tour.isPurchased === false && <AddToCartButton tourId={tourId} />}
          {["Published", "Archived"].includes(status) &&
            <Link to={"/execution?tourId=" + encodeURIComponent(tourId)}>Start / Resume Purchased Tour</Link>}
          <Link to="/tours/published">Published Tours</Link>
        </>}
      </div>
    </>}
  </div>;
}
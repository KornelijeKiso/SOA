import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedTours } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";
import { apiError, asList, tourStatus } from "../api/responseUtils";
import TourContent from "../components/TourContent";
import AddToCartButton from "../components/AddToCartButton";

export default function PublishedToursPage() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    getPublishedTours(getUserId(), { signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setTours(asList(data)); })
      .catch((err) => { if (!controller.signal.aborted) setError(apiError(err, "Could not load published tours.")); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  return <div className="card">
    <h1>Published Tours</h1>
    {loading && <p>Loading tours...</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {!loading && !error && tours.length === 0 && <p>No published tours yet.</p>}
    <div className="grid">
      {tours.map((tour) => <article className="item-card" key={tour.id}>
        <TourContent tour={tour} preview />
        <div className="actions">
          <Link to={"/tours/" + encodeURIComponent(tour.id)}>Details</Link>
          {tourStatus(tour.status) === "Published" && tour.isPurchased === false && <AddToCartButton tourId={tour.id} />}
        </div>
      </article>)}
    </div>
  </div>;
}
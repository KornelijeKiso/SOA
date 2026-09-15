import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getGuideTours } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";

function MyToursPage() {
  const [tours, setTours] = useState([]);

  useEffect(() => {
    loadTours();
  }, []);

  async function loadTours() {
    try {
      const response = await getGuideTours(getUserId());
      setTours(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="card">
      <div className="page-header">
        <h1>My Tours</h1>
        <Link to="/tours/create">
          <button>Create Tour</button>
        </Link>
      </div>

      {tours.length === 0 && <p>No tours yet.</p>}

      <div className="grid">
        {tours.map((tour) => (
          <div className="item-card" key={tour.id}>
            <h3>{tour.name}</h3>
            <p>{tour.description}</p>
            <p className="muted">Difficulty: {tour.difficulty}</p>

            {tour.tags && <p className="muted">Tags: {tour.tags.join(", ")}</p>}

            <Link to={`/tours/${tour.id}`}>
              <button>Open</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyToursPage;
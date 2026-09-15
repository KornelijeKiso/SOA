import { Link, useParams } from "react-router-dom";
import { getUserId } from "../auth/authStorage";

function TourDetailsPage() {
  const { tourId } = useParams();

  return (
    <div className="card">
      <h1>Tour Details</h1>

      <p className="muted">Tour ID: {tourId}</p>
      <p className="muted">Current user: {getUserId()}</p>

      <div className="actions">
        <Link to={`/tours/${tourId}/key-points/add`}>
          <button>Add Key Point</button>
        </Link>

        <Link to="/position">
          <button>Position Simulator</button>
        </Link>

        <Link to="/cart">
          <button>Cart</button>
        </Link>

        <Link to="/execution">
          <button>Active Execution</button>
        </Link>
      </div>
    </div>
  );
}

export default TourDetailsPage;
import { useState } from "react";
import { Link } from "react-router-dom";
import { addToCart } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";
import { apiError } from "../api/responseUtils";

export default function AddToCartButton({ tourId }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function add() {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await addToCart({ touristId: getUserId(), tourId });
      setMessage("Tour added to cart.");
    } catch (err) {
      setError(apiError(err, "Could not add this tour to the cart."));
    } finally {
      setBusy(false);
    }
  }
  return <div>
    <button onClick={add} disabled={busy}>{busy ? "Adding..." : "Add to Cart"}</button>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message} <Link to="/cart">Open Cart</Link></p>}
  </div>;
}
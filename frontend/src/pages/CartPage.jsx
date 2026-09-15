import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { checkoutCart, getCart, removeFromCart } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";
import { apiError, asList } from "../api/responseUtils";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [purchases, setPurchases] = useState([]);
  async function loadCart(signal) {
    setLoading(true);
    try {
      const { data } = await getCart(getUserId(), { signal });
      if (!signal?.aborted) setCart(data || { items: [], totalPrice: 0 });
    } catch (err) {
      if (signal?.aborted) return;
      if (err.response?.status === 404) setCart({ items: [], totalPrice: 0 });
      else {
        setCart(null);
        setError(apiError(err, "Could not load the cart."));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    loadCart(controller.signal);
    return () => controller.abort();
  }, []);
  async function remove(tourId) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await removeFromCart({ touristId: getUserId(), tourId });
      setMessage("Tour removed from cart.");
      await loadCart();
    } catch (err) {
      setError(apiError(err, "Could not remove the tour."));
    } finally { setBusy(false); }
  }
  async function checkout() {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const { data } = await checkoutCart({ touristId: getUserId() });
      setPurchases(asList(data));
      setMessage("Checkout completed. Your purchased tours now include every key point.");
      await loadCart();
    } catch (err) {
      setError(apiError(err, "Checkout failed."));
    } finally { setBusy(false); }
  }
  const items = asList(cart?.items);
  return <div className="card">
    <h1>Cart</h1>
    {loading && <p>Loading cart...</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    {!loading && cart && <>
      {items.length === 0 && <p>Your cart is empty.</p>}
      {items.map((item) => <div className="list-row" key={item.tourId}>
        <div><Link to={"/tours/" + encodeURIComponent(item.tourId)}>{item.tourName}</Link>
          <p>Price: {item.price}</p></div>
        <button disabled={busy} onClick={() => remove(item.tourId)}>Remove</button>
      </div>)}
      <h2>Total: {cart.totalPrice ?? 0}</h2>
      <button disabled={busy || items.length === 0} onClick={checkout}>{busy ? "Working..." : "Checkout"}</button>
    </>}
    <div className="actions">
      <button disabled={busy || loading} onClick={() => { setError(""); loadCart(); }}>Refresh Cart</button>
      <Link to="/tours/published">Published Tours</Link>
    </div>
    {purchases.length > 0 && <section>
      <h2>Purchased tours</h2>
      {purchases.map((purchase) => <div className="list-row" key={purchase.tourId}>
        <Link to={"/tours/" + encodeURIComponent(purchase.tourId)}>{purchase.tourName || purchase.tourId}: view key points</Link>
        <Link to={"/execution?tourId=" + encodeURIComponent(purchase.tourId)}>Start Tour</Link>
      </div>)}
    </section>}
  </div>;
}
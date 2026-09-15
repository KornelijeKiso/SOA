import { useState } from "react";
import { addToCart, checkoutCart, getCart } from "../api/tourApi";
import { getUserId } from "../auth/authStorage";

function CartPage() {
  const [tourId, setTourId] = useState("");
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState("");

  async function loadCart() {
    const response = await getCart(getUserId());
    setCart(response.data);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setMessage("");

    try {
      await addToCart({
        touristId: getUserId(),
        tourId,
      });

      setTourId("");
      setMessage("Tour added to cart.");
      loadCart();
    } catch (err) {
      console.error(err);
      setMessage("Failed to add tour.");
    }
  }

  async function handleCheckout() {
    try {
      await checkoutCart({
        touristId: getUserId(),
      });

      setMessage("Checkout completed.");
      loadCart();
    } catch (err) {
      console.error(err);
      setMessage("Checkout failed.");
    }
  }

  return (
    <div className="card form">
      <h1>Cart</h1>

      <form onSubmit={handleAdd}>
        <div className="input-group">
          <label>Tour ID</label>
          <input
            value={tourId}
            onChange={(e) => setTourId(e.target.value)}
            required
          />
        </div>

        <button>Add To Cart</button>
      </form>

      <div className="actions">
        <button onClick={loadCart}>Load Cart</button>
        <button onClick={handleCheckout}>Checkout</button>
      </div>

      {message && <p className="success">{message}</p>}

      {cart && (
        <div className="item-card">
          <h3>Cart Data</h3>
          <pre>{JSON.stringify(cart, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default CartPage;
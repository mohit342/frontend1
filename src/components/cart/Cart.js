import React, { useEffect } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import "./Cart.css";
import Header from "../header/Header";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import axios from "axios";

const Cart = () => {
  const { cartItems, loading, updateQuantity, removeItem, getCartTotals, setCartItems } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const sessionCartKey = "guest_cart";

  useEffect(() => {
    const fetchUserCart = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
          if (response.data.data?.items) {
            setCartItems(response.data.data.items);
          }
        } catch (error) {
          console.error("Error fetching user cart:", error);
        }
      } else {
        const guestCart = JSON.parse(sessionStorage.getItem(sessionCartKey)) || [];
        setCartItems(guestCart);
      }
    };
    fetchUserCart();
  }, [user, setCartItems]);

  useEffect(() => {
    const mergeGuestCart = async () => {
      if (user) {
        const guestCart = JSON.parse(sessionStorage.getItem(sessionCartKey)) || [];
        if (guestCart.length > 0) {
          try {
            for (const item of guestCart) {
              await axios.post("http://localhost:5000/api/cart/add", {
                userId: user.id,
                productId: item.id,
                quantity: item.quantity,
              });
            }
            sessionStorage.removeItem(sessionCartKey);
            const response = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
            setCartItems(response.data.data.items);
          } catch (error) {
            console.error("Error merging guest cart:", error);
          }
        }
      }
    };
    mergeGuestCart();
  }, [user, setCartItems]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
  const taxRate = 0.10;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const { itemCount } = getCartTotals();

  const proceedToCheckout = () => {
    if (!user) {
      alert("You must be logged in to proceed to checkout.");
      navigate("/user/login");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <>
      <Header />
      <div className="cart-container">
        <div className="cart-header">
          <h1>
            <ShoppingCart className="cart-icon" /> Shopping Cart
          </h1>
          <span>{itemCount} items</span>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {loading ? (
              <div className="loading">Loading cart items...</div>
            ) : cartItems.length === 0 ? (
              <div className="empty-cart">
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart to see them here.</p>
                <Link to="/" className="continue-shopping">
                  Continue Shopping
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={
                      Array.isArray(item.images)
                        ? `http://localhost:5000/${item.images[0].replace(/\\/g, "/")}`
                        : `http://localhost:5000/${item.images?.replace(/\\/g, "/")}` || "/placeholder.jpg"
                    }
                    alt={item.name}
                    className="item-image"
                    onError={(e) => (e.target.src = "/placeholder.jpg")}
                  />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">₹{(Number(item.price) || 0).toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button onClick={() => updateQuantity(item.id, -1)}>
                        <Minus size={16} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="item-total">
                    <p>₹{((Number(item.price) || 0) * (item.quantity || 0)).toFixed(2)}</p>
                    <button className="remove-button" onClick={() => removeItem(item.id)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button className="checkout-button" onClick={proceedToCheckout}>
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
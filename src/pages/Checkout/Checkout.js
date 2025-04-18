import React, { useState, useEffect } from "react";
import "./Checkout.css";
import Header from "../../components/header/Header";
import { useCart } from "../../components/context/CartContext";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { cartItems, setCartItems } = useCart();
  const { user } = useAuth();
  const [coupon, setCoupon] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponApplied, setCouponApplied] = useState(false);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        name: user.firstName ? `${user.firstName} ${user.lastName || ""}` : prevData.name,
        email: user.email || prevData.email,
        phone: user.mobile || prevData.phone,
      }));

      if (user.role !== 'se') {
        const fetchCoupons = async () => {
          try {
            // Fetch user-specific coupons
            const userCouponsResponse = await axios.get(`http://localhost:5000/api/coupons/user/${user.id}`);
            const userCoupons = userCouponsResponse.data.map(coupon => {
              console.log('User coupon data:', coupon);
              return {
                ...coupon,
                school_name: coupon.school_name || 'Unknown School',
                type: 'user',
              };
            });

            // Fetch special coupons
            let specialCoupons = [];
            try {
              const specialCouponsResponse = await axios.get(`http://localhost:5000/api/couponall/user/${user.id}`);
              specialCoupons = specialCouponsResponse.data.map(coupon => {
                console.log('Special coupon data:', coupon);
                return {
                  ...coupon,
                  school_name: 'Universal',
                  type: 'special',
                };
              });
            } catch (error) {
              console.warn("Failed to fetch special coupons:", error.message);
            }

            // Combine and set available coupons
            setAvailableCoupons([...userCoupons, ...specialCoupons]);
          } catch (error) {
            console.error("Error fetching coupons:", error);
            setAvailableCoupons([]);
          }
        };
        fetchCoupons();
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
          setCartItems(response.data.data.items || []);
        } catch (error) {
          console.error('Error fetching cart on checkout:', error);
          setCartItems([]);
        }
      }
    };
    fetchCart();
  }, [user, setCartItems]);

  const handlePincodeChange = async (e) => {
    const pincode = e.target.value;
    setFormData({ ...formData, pincode });
    setErrors({ ...errors, pincode: "" });
    setPincodeError("");

    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setPincodeLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/validate-pincode/${pincode}`);
        setFormData((prevData) => ({
          ...prevData,
          city: response.data.city,
          state: response.data.state,
          pincode,
        }));
      } catch (error) {
        setPincodeError(error.response?.data?.error || "Failed to fetch city and state.");
        setFormData((prevData) => ({
          ...prevData,
          city: "",
          state: "",
          pincode,
        }));
      } finally {
        setPincodeLoading(false);
      }
    } else if (pincode.length > 0) {
      setPincodeError("PIN code must be 6 digits.");
      setFormData((prevData) => ({
        ...prevData,
        city: "",
        state: "",
      }));
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  const shipping = cartItems.length > 0 ? 40 : 0;
  const tax = subtotal * 0.1;
  const couponDiscount = (subtotal * additionalDiscount) / 100;
  const total = subtotal + shipping + tax - couponDiscount;

  const applyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");

    if (!coupon.trim()) {
      setCouponError("Please select or enter a coupon code");
      return;
    }

    if (!user) {
      setCouponError("You must be logged in to apply a coupon");
      return;
    }

    setLoading(true);

    try {
      console.log("Applying coupon:", { code: coupon, userId: user.id, userType: user.role });
      const response = await axios.post("http://localhost:5000/api/coupons/validate", {
        code: coupon,
        userId: user.id,
        userType: user.role,
      });
      console.log("Validation response:", response.data);

      setAdditionalDiscount(response.data.discount_percentage);
      setCouponApplied(true);
      setCouponSuccess(`Coupon applied! Successfully`);
    } catch (error) {
      console.error("Coupon validation error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setCouponError(error.response?.data?.error || "Failed to validate coupon");
      setCouponApplied(false);
      setAdditionalDiscount(0);
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(false);
    setAdditionalDiscount(0);
    setCouponSuccess("");
    setCouponError("");
    setCoupon("");
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id !== "pincode") {
      setFormData({ ...formData, [id]: value });
      setErrors({ ...errors, [id]: "" });
    }
  };

  const handleCouponChange = (e) => {
    setCoupon(e.target.value);
    if (couponApplied) {
      removeCoupon();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    if (!user) {
      alert("Please log in to complete your purchase");
      return;
    }

    const orderData = {
      userId: user.id,
      fullName: formData.name,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      phone: formData.phone,
      total,
      couponCode: couponApplied && user.role !== 'se' ? coupon : null,
      cartItems,
    };

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/orders", orderData);
      let message = "Order placed successfully!";
      if (user.role === 'student' && response.data.pointsAwarded > 0) {
        message += ` ${response.data.pointsAwarded} points awarded to your school.`;
      } else if (user.role === 'school' && response.data.sePointsAwarded > 0) {
        message += ` ${response.data.sePointsAwarded} points awarded to your SE.`;
      }
      alert(message);
      navigate("/OrderSuccess");
      setFormData({ name: "", email: "", address: "", pincode: "", city: "", state: "", phone: "" });
      setCoupon("");
      setCouponApplied(false);
      setAdditionalDiscount(0);
      setCartItems([]);
      localStorage.removeItem("cartItems");
      sessionStorage.removeItem("guest_cart");
    } catch (error) {
      alert(error.response?.data?.error || "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="checkout-container">
        <div className="checkout-grid">
          <div className="checkout-form">
            <h2 className="section-title">Shipping Information</h2>
            {['name', 'email', 'address', 'pincode', 'city', 'state', 'phone'].map((key) => (
              <div className="form-group" key={key}>
                <label htmlFor={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
                {key === "pincode" ? (
                  <>
                    <input
                      type="text"
                      id={key}
                      value={formData[key]}
                      onChange={handlePincodeChange}
                      placeholder="Enter pincode..."
                      maxLength="6"
                      required
                      disabled={pincodeLoading}
                    />
                    {pincodeLoading && <span className="loading-message">Fetching city and state...</span>}
                    {pincodeError && <span className="error-message">{pincodeError}</span>}
                  </>
                ) : (
                  <input
                    type={key === "email" ? "email" : key === "phone" ? "number" : "text"}
                    id={key}
                    value={formData[key]}
                    onChange={handleInputChange}
                    placeholder={`Enter ${key}...`}
                    required
                    disabled={key === "city" || key === "state"}
                  />
                )}
                {errors[key] && <span className="error-message">{errors[key]}</span>}
              </div>
            ))}
          </div>

          <div className="order-summary">
            <h2 className="section-title">Order Summary</h2>
            {cartItems.length > 0 ? (
              <>
                {cartItems.map((item) => (
                  <div key={item.id || item.productId} className="summary-item">
                    <div className="product-details">
                      <div>
                        <h3>{item.name}</h3>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="price">₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</div>
                  </div>
                ))}

                {user && user.role !== 'se' && (
                  <div className="form-group">
                    <label htmlFor="coupon">Coupon Code</label>
                    <div className="coupon-input-container">
                      <select
                        id="coupon"
                        value={coupon}
                        onChange={handleCouponChange}
                        disabled={couponApplied || loading}
                        className={couponApplied ? "input-success" : ""}
                      >
                        <option value="">Select a coupon</option>
                        {availableCoupons.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name || c.code} ({c.discount_percentage}% off - {c.type === 'special' ? 'Special Offer' : c.school_name})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={couponApplied ? removeCoupon : applyCoupon}
                        disabled={loading}
                        className={`coupon-button ${couponApplied ? "remove-coupon" : ""}`}
                      >
                        {loading ? "Processing..." : couponApplied ? "Remove" : "Apply"}
                      </button>
                    </div>
                    {couponError && <span className="error-message">{couponError}</span>}
                    {couponSuccess && <span className="success-message">{couponSuccess}</span>}
                    {!user && <p className="info-message">Login required to use coupons</p>}
                  </div>
                )}

                <div className="total-section">
                  <div className="summary-item">
                    <span>Subtotal</span>
                    <span className="price">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Shipping</span>
                    <span className="price">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>GST (10%)</span>
                    <span className="price">₹{tax.toFixed(2)}</span>
                  </div>
                  {couponApplied && user.role !== 'se' && (
                    <div className="summary-item discount-row">
                      <span>Coupon Discount</span>
                      <span className="price discount">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="summary-item total-row">
                    <strong>Total</strong>
                    <strong className="total-price">₹{total.toFixed(2)}</strong>
                  </div>
                </div>

                <button
                  className="checkout-button"
                  onClick={handleCheckout}
                  disabled={loading || cartItems.length === 0}
                >
                  {loading ? "Processing..." : "Complete Purchase"}
                </button>
              </>
            ) : (
              <p className="empty-cart-message">Your cart is empty.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
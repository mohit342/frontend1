import React, { useState, useEffect } from 'react';
import "./StudentProfile.css";
import { Heart, MapPin, Ticket, Settings, Bell, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { BiSolidOffer } from "react-icons/bi";

import { CgShoppingCart } from "react-icons/cg";
import axios from 'axios';

const StudentProfile = () => {
  const [activeTab, setActiveTab] = useState('wishlist');
  const [user, setUser] = useState({
    full_name: '',
    email: '',
    role: '',
    id: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [specialCoupons, setSpecialCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState(null);
  const [specialCouponsLoading, setSpecialCouponsLoading] = useState(false);
  const [specialCouponsError, setSpecialCouponsError] = useState(null);
  const [returnStatuses, setReturnStatuses] = useState({});
  const [rewardPoints, setRewardPoints] = useState(0);
  const navigate = useNavigate();

  const getImageSrc = (item) => {
    if (item.images && item.images.length > 0) {
      return `http://localhost:5000/${item.images[0].replace(/\\/g, "/")}`;
    } else if (item.image) {
      return `http://localhost:5000/${item.image.replace(/\\/g, "/")}`;
    }
    return `http://localhost:5000/placeholder.jpg`;
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  };

  const handleRemoveFromWishlist = async (productId) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) return;

    try {
      await axios.post('http://localhost:5000/api/wishlist/remove', {
        userId: storedUser.id,
        productId: productId
      });
      setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== productId));
      setWishlistError(null);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setWishlistError('Failed to remove item from wishlist. Please try again.');
    }
  };

  const handleApplyCoupon = async (couponCode) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      alert('Please log in to apply a coupon.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/coupons/validate', {
        code: couponCode,
        userId: storedUser.id,
        userType: 'student',
      });

      if (response.data.valid) {
        alert(`Coupon ${couponCode} applied successfully! Discount: ${response.data.discount_percentage}%`);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      alert(error.response?.data?.error || 'Failed to apply coupon.');
    }
  };

  const isWithinReturnPeriod = (createdAt) => {
    if (!createdAt) return false;
    const orderDate = new Date(createdAt);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  useEffect(() => {
    const fetchStudentDetailsAndData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.id) return;

      setUser({
        full_name: storedUser.full_name || `${storedUser.firstName} ${storedUser.lastName || ''}`,
        email: storedUser.email || '',
        role: storedUser.role || '',
        id: storedUser.id || '',
      });
      setFormData({
        firstName: storedUser.firstName || '',
        lastName: storedUser.lastName || '',
        email: storedUser.email || '',
        password: '',
        confirmPassword: '',
      });

      setCouponsLoading(true);
      try {
        const pointsResponse = await axios.get(`http://localhost:5000/api/student-school-points/${storedUser.id}`);
        setRewardPoints(pointsResponse.data.reward_points || 0);
      } catch (error) {
        console.error("Error fetching school reward points:", error);
        setRewardPoints(0);
      }
      setWishlistLoading(true);
      try {
        const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/${storedUser.id}`);
        const formattedWishlist = wishlistResponse.data.map((item) => ({
          ...item,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
        }));
        setWishlist(formattedWishlist);
        setWishlistError(null);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistError('Failed to load wishlist. Please try again later.');
      } finally {
        setWishlistLoading(false);
      }

      setOrdersLoading(true);
      try {
        const ordersResponse = await fetch(`http://localhost:5000/api/orders/email/${storedUser.email}`);
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }
        let ordersData = await ordersResponse.json();
        console.log('Raw orders data:', ordersData); // Log to verify created_at

        // Sort orders by created_at (most recent first)
        ordersData = ordersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Fetch return request status for each order
        const returnStatusPromises = ordersData.map(async (order) => {
          try {
            const response = await axios.get(`http://localhost:5000/api/orders/returns?order_id=${order.id}`);
            return { orderId: order.id, status: response.data.status || null };
          } catch (error) {
            console.error(`Error fetching return status for order ${order.id}:`, error.message);
            return { orderId: order.id, status: null }; // Fallback to null if the request fails
          }
        });
        const returnStatusesArray = await Promise.all(returnStatusPromises);
        const returnStatusesMap = returnStatusesArray.reduce((acc, { orderId, status }) => {
          acc[orderId] = status;
          return acc;
        }, {});
        setReturnStatuses(returnStatusesMap);

        setOrders(ordersData);
        setOrdersError(null);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError('Failed to load orders. Please try again later.');
      } finally {
        setOrdersLoading(false);
      }

      setCouponsLoading(true);
      try {
        const couponsResponse = await axios.get(`http://localhost:5000/api/coupons/user/${storedUser.id}`);
        setCoupons(couponsResponse.data);
        setCouponsError(null);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setCouponsError('Failed to load coupons. Please try again later.');
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchStudentDetailsAndData();
  }, []);

  useEffect(() => {
    const fetchSpecialCoupons = async () => {
      setSpecialCouponsLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.id) {
          setSpecialCouponsError("User not found. Please log in.");
          return;
        }

        let specialCoupons = [];
        try {
          const specialCouponsResponse = await axios.get(`http://localhost:5000/api/couponall/user/${storedUser.id}`);
          specialCoupons = specialCouponsResponse.data.map(coupon => ({
            code: coupon.code,
            name: coupon.name,
            discount_percentage: coupon.discount_percentage,
            valid_from: coupon.valid_from,
            valid_until: coupon.valid_until,
            current_uses: coupon.current_uses || 0,
            max_uses: coupon.max_uses,
          }));
        } catch (error) {
          console.warn("Failed to fetch special coupons:", error.message);
        }

        setSpecialCoupons(specialCoupons);
        setSpecialCouponsError(specialCoupons.length === 0 ? "No special coupons available." : null);
      } catch (error) {
        console.error("Error fetching special coupons:", error);
        setSpecialCouponsError("Failed to load special coupons. Please try again later.");
      } finally {
        setSpecialCouponsLoading(false);
      }
    };

    if (activeTab === 'specialCoupons') {
      fetchSpecialCoupons();
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user'));
    try {
      const response = await fetch(`http://localhost:5000/api/users/${storedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password || undefined,
        }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        const updatedUser = await response.json();
        setUser({
          ...user,
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        });
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          firstName: formData.firstName,
          lastName: formData.lastName,
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        }));
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'wishlist':
        return (
          <div className="content-area">
            <h2><Heart className="icon" /> My Wishlist</h2>
            {wishlistLoading ? (
              <p>Loading wishlist...</p>
            ) : wishlistError ? (
              <p>{wishlistError}</p>
            ) : (
              <div className="wishlist-grid">
                {wishlist.length === 0 ? (
                  <p>No items in wishlist</p>
                ) : (
                  wishlist.map((item) => {
                    const firstImage = Array.isArray(item.images) && item.images.length > 0
                      ? item.images[0].replace(/\\/g, "/")
                      : null;
                    const productSlug = item.slug || generateSlug(item.name || 'unnamed-item');

                    return (
                      <div className="wishlist-item" key={item.id}>
                        <Link to={`/product/${encodeURIComponent(productSlug)}`}>
                          <div className="wishlist-image">
                            <img
                              src={firstImage ? `http://localhost:5000/${firstImage}` : '/placeholder.jpg'}
                              alt={item.name || 'Wishlist Item'}
                              onError={(e) => e.target.src = '/placeholder.jpg'}
                            />
                          </div>
                          <h3>{item.name || 'Unnamed Item'}</h3>
                        </Link>
                        <p className="price">₹{item.price?.toFixed(2) || '0.00'}</p>
                        <button
                          className="btn-secondary remove-btn"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRemoveFromWishlist(item.id);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      case 'addressBook':
        return (
          <div className="content-area">
            <h2><MapPin className="icon" /> Address Book</h2>
            <div className="address-list">
              <div className="address-item">
                <h3>Home <span className="address-badge">Default</span></h3>
                <p>B-121 janta colony ,raja park pincode-83321</p>
                <div className="address-actions">
                  <button className="btn-secondary">Edit</button>
                  <button className="btn-secondary">Delete</button>
                </div>
              </div>
              <div className="address-item">
                <h3>Work</h3>
                <p>B-233 Bapu Nagar ,jaipur pincode-302004</p>
                <div className="address-actions">
                  <button className="btn-secondary">Edit</button>
                  <button className="btn-secondary">Delete</button>
                </div>
              </div>
            </div>
            <button className="btn-primary">Add New Address</button>
          </div>
        );
      case 'coupons':
        return (
          <div className="content-area">
            <h2><Ticket className="icon" /> My Student Coupons</h2>
            {couponsLoading ? (
              <p>Loading coupons...</p>
            ) : couponsError ? (
              <p>{couponsError}</p>
            ) : (
              <div className="coupon-list">
                {coupons.length === 0 ? (
                  <p>No student coupons available</p>
                ) : (
                  <>
                    {coupons.map((coupon, index) => (
                      <div key={index} className="coupon-item" data-index={index}>
                        <h3>{coupon.code}</h3>
                        <p className="discount">{coupon.discount_percentage}% off</p>
                        <p className="expiry">
                          Valid: {new Date(coupon.valid_from).toLocaleDateString()} -{' '}
                          {new Date(coupon.valid_until).toLocaleDateString()}
                        </p>
                        {/* <p className="uses">Uses: {coupon.current_uses}/{coupon.max_uses}</p> */}
                       
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        );
      case 'specialCoupons':
        return (
          <div className="content-area">
            <h2><BiSolidOffer  className="icon" /> Special Coupons</h2>
            {specialCouponsLoading ? (
              <p>Loading special coupons...</p>
            ) : specialCouponsError ? (
              <p>{specialCouponsError}</p>
            ) : (
              <div className="coupon-list">
                {specialCoupons.length === 0 ? (
                  <p>No special coupons available</p>
                ) : (
                  <>
                    {specialCoupons.map((coupon, index) => (
                      <div key={index} className="coupon-item" data-index={index}>
                        <h3>{coupon.name || coupon.code}</h3>
                        <p className="code">Code: {coupon.code}</p>
                        <p className="discount">{coupon.discount_percentage}% off</p>
                        <p className="expiry">
                          Valid before: {new Date(coupon.valid_until).toLocaleDateString()}
                        </p>
                        {/* <p className="uses">Uses: {coupon.current_uses}/{coupon.max_uses}</p> */}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        );
      case 'My order':
        return (
          <div className="content-area">
            <h2><ShoppingBag className="icon" /> My Orders</h2>
            {ordersLoading ? (
              <p>Loading orders...</p>
            ) : ordersError ? (
              <p>{ordersError}</p>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order, index) => (
                  <div key={index} className="order-card">
                    <div className="order-header">
                      <div className="order-meta">
                        <span className="order-id">Order #: {order.id}</span>
                        <span className="order-date">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Date not available'}
                        </span>
                      </div>
                    </div>
                    <div className="order-items">
                      {Array.isArray(order.items) ? (
                        order.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="order-item">
                            <img
                              src={getImageSrc(item)}
                              alt={item.name || 'Order Item'}
                              className="item-image"
                              onError={(e) => {
                                console.error(`Failed to load image for ${item.name || 'item'}: ${e.target.src}`);
                                e.target.src = 'http://localhost:5000/placeholder.jpg';
                              }}
                            />
                            <div className="item-details">
                              <h4>{item.name || 'Unnamed Item'}</h4>
                              <div className="item-meta">
                                <span>Quantity: {item.quantity || 1}</span>
                                <span>Price: ₹{item.price || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        JSON.parse(order.items || '[]').map((item, itemIndex) => (
                          <div key={itemIndex} className="order-item">
                            <img
                              src={getImageSrc(item)}
                              alt={item.name || 'Order Item'}
                              className="item-image"
                              onError={(e) => {
                                console.error(`Failed to load image for ${item.name || 'item'}: ${e.target.src}`);
                                e.target.src = 'http://localhost:5000/placeholder.jpg';
                              }}
                            />
                            <div className="item-details">
                              <h4>{item.name || 'Unnamed Item'}</h4>
                              <div className="item-meta">
                                <span>Quantity: {item.quantity || 1}</span>
                                <span>Price: ₹{item.price || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="order-footer">
                      <div className="order-total">
                        <span>Total:</span>
                        <span className="total-amount">₹{order.total || 0}</span>
                      </div>
                      {isWithinReturnPeriod(order.created_at) && !returnStatuses[order.id] && (
                        <button
                          className="btn-secondary"
                          onClick={() => {
                            if (!order.id) {
                              alert('Invalid order ID');
                              return;
                            }
                            navigate(`/return-request/${order.id}`);
                          }}
                        >
                          Return
                        </button>
                      )}
                     {returnStatuses[order.id] === 'approved' && (
                  <p className="return-status approved">We will replace this product soon</p>
                )}
                {returnStatuses[order.id] === 'pending' && (
                  <p className="return-status pending">Return request pending</p>
                )}
                {returnStatuses[order.id] === 'rejected' && (
                  <p className="return-status rejected">Return request rejected</p>
                )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="content-area">
            <h2><Settings className="icon" /> Account Settings</h2>
            <form className="settings-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          </div>
        );
      case 'manageNotifications':
        return (
          <div className="content-area">
            <h2><Bell className="icon" /> Manage Notifications</h2>
            <div className="notification-settings">
              <div className="notification-option">
                <label htmlFor="emailNotifications" className="switch">
                  <input type="checkbox" id="emailNotifications" defaultChecked />
                  <span className="slider"></span>
                </label>
                <span>Email Notifications</span>
              </div>
              <div className="notification-option">
                <label htmlFor="smsNotifications" className="switch">
                  <input type="checkbox" id="smsNotifications" />
                  <span className="slider"></span>
                </label>
                <span>SMS Notifications</span>
              </div>
              <div className="notification-option">
                <label htmlFor="pushNotifications" className="switch">
                  <input type="checkbox" id="pushNotifications" defaultChecked />
                  <span className="slider"></span>
                </label>
                <span>Push Notifications</span>
              </div>
              <div className="notification-option">
                <label htmlFor="orderUpdates" className="switch">
                  <input type="checkbox" id="orderUpdates" defaultChecked />
                  <span className="slider"></span>
                </label>
                <span>Order Updates</span>
              </div>
              <div className="notification-option">
                <label htmlFor="promotionalEmails" className="switch">
                  <input type="checkbox" id="promotionalEmails" />
                  <span className="slider"></span>
                </label>
                <span>Promotional Emails</span>
              </div>
            </div>
            <button className="btn-primary">Save Preferences</button>
          </div>
        );
      default:
        return <div className="content-area">Select a tab to view content.</div>;
    }
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        {user.role === 'student' && (
          <div className="user-info">
            <h1>Student Dashboard</h1>
            <div className="user-details">
              <span className="user-name">{user.full_name}</span>
            </div>
          </div>
        )}
      </header>
      <div className="profile-content">
        <nav className="sidebar">
          <button
            className={`nav-button ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={24} />
            <span>Wishlist</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'My order' ? 'active' : ''}`}
            onClick={() => setActiveTab('My order')}
          >
            <CgShoppingCart size={24} />
            <span>My order</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <Ticket size={24} />
            <span>Coupons</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'specialCoupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('specialCoupons')}
          >
            <BiSolidOffer size={24} />
            <span>Special Coupon</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={24} />
            <span>Settings</span>
          </button>
        </nav>
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default StudentProfile;
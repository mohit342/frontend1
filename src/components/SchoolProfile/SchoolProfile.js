import React, { useState, useEffect } from 'react';
import "./SchoolProfile.css";
import { Heart, MapPin, Ticket, Gift, Settings, Bell, ShoppingBag, Star, Zap } from 'lucide-react';
import { Link } from "react-router-dom";
import { FaChildReaching } from "react-icons/fa6";
import { CgShoppingCart } from "react-icons/cg";
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const SchoolProfile = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'redeemPoints');
  const [user, setUser] = useState({ full_name: '', role: '' });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(0);
  const getImageSrc = (item) => {
      if (item.images && item.images.length > 0) {
        return `http://localhost:5000/${item.images[0].replace(/\\/g, "/")}`;
      } else if (item.image) {
        return `http://localhost:5000/${item.image.replace(/\\/g, "/")}`;
      }
      return `http://localhost:5000/placeholder.jpg`; // Explicit fallback path
    };
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

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
        productId: productId,
      });
      setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== productId));
      setWishlistError(null);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      setWishlistError('Failed to remove item from wishlist. Please try again.');
    }
  };
  useEffect(() => {
    const fetchUserDetailsAndData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.id) return;
      console.log('Stored User:', storedUser);
      setUser({ full_name: storedUser.schoolName || storedUser.full_name, role: storedUser.role });
      setFormData({
        schoolName: storedUser.schoolName || '',
        email: storedUser.email || '',
        password: '',
        confirmPassword: '',
      });

      try {
        let schoolId;
        console.log("Stored User:", storedUser);
        console.log("Role:", storedUser.role);
        console.log("Fetching schoolId for userId:", storedUser.id);
        if (storedUser.role === 'school') {
          const schoolResponse = await axios.get(`http://localhost:5000/api/school-details/${storedUser.id}`);
          schoolId = schoolResponse.data.id || storedUser.id; // Assuming school-details returns school_id
        } else if (storedUser.role === 'student') {
          const studentResponse = await axios.get(`http://localhost:5000/api/users/${storedUser.id}`);
          schoolId = studentResponse.data.school_id;
        }

        if (schoolId) {
          const pointsResponse = await axios.get(`http://localhost:5000/api/schools/${schoolId}/points`);
          console.log("Reward Points:", pointsResponse.data.reward_points);
          setRewardPoints(pointsResponse.data.reward_points);
        } else {
          console.log("No schoolId found, setting points to 0");
          setRewardPoints(0);
        }
      } catch (error) {
        console.error("Error fetching reward points:", error);
        setRewardPoints(0);
      }

      // Fetch orders
      setOrdersLoading(true);
      try {
        const ordersResponse = await fetch(`http://localhost:5000/api/orders/email/${storedUser.email}`);
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
        setOrdersError(null);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError('Failed to load orders. Please try again later.');
      } finally {
        setOrdersLoading(false);
      }

      // Fetch wishlist
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

      // Fetch coupons based on user_id
      setCouponsLoading(true);
      try {
        const couponsResponse = await axios.get(`http://localhost:5000/api/coupons/user/${storedUser.id}`);
        console.log('Coupons Response:', couponsResponse.data); // Debug log
        setCoupons(couponsResponse.data); // Expecting an array of coupons
        setCouponsError(null);
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setCouponsError('Failed to load coupons. Please try again later.');
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchUserDetailsAndData();
  }, []);

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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
          schoolName: formData.schoolName,
          email: formData.email,
          password: formData.password || undefined,
        }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        const updatedUser = await response.json();
        setUser({
          ...user,
          full_name: formData.schoolName,
          email: formData.email,
        });
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          schoolName: formData.schoolName,
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
                              onError={(e) => (e.target.src = '/placeholder.jpg')}
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
            <button className="btn-primary"><Zap size={18} /> Add New Address</button>
          </div>
        );
      case 'coupons':
        return (
          <div className="content-area">
            <h2><Ticket className="icon" /> My Coupons</h2>
            {couponsLoading ? (
              <p>Loading coupons...</p>
            ) : couponsError ? (
              <p>{couponsError}</p>
            ) : (
              <div className="coupon-list">
                {coupons.length === 0 ? (
                  <p>No coupons available</p>
                ) : (
                  coupons.map((coupon, index) => {
                    const isStudentCoupon = coupon.type === 'student';
                    const couponColor = isStudentCoupon ? 'coupon-green' : 'coupon-blue';
                    return (
                      <div key={index} className={`coupon-item ${couponColor}`}>
                        <h3>{coupon.code}</h3>
                        <p className="discount">{coupon.discount_percentage}% off</p>
                        <p className="expiry">
                          Valid: {new Date(coupon.valid_from).toLocaleDateString()} -{' '}
                          {new Date(coupon.valid_until).toLocaleDateString()}
                        </p>
                        <p className="type">{isStudentCoupon ? 'Student Coupon' : 'School Coupon'}</p>
                        <button className="btn-secondary">Use Coupon</button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      case 'redeemPoints':
        return (
          <div className="content-area">
            <h2><Gift className="icon" /> Redeem Points</h2>
            <div className="points-info">
              <div className="points-balance">
                <h3>Current Balance</h3>
                <p className="points">{rewardPoints} pts</p>
              </div>
              <div className="points-value">
                <h3>Value</h3>
                <p className="value">₹{(rewardPoints / 100).toFixed(2)}</p>
              </div>
            </div>
            <div className="redeem-options">
              <h3>Redeem for:</h3>
              <div className="redeem-grid">
                <button className="btn-primary"><ShoppingBag size={18} /> ₹5 Off Coupon (500 pts)</button>
                <button className="btn-primary"><ShoppingBag size={18} /> ₹10 Off Coupon (1000 pts)</button>
                <button className="btn-primary"><ShoppingBag size={18} /> Free Shipping (750 pts)</button>
                <button className="btn-primary"><ShoppingBag size={18} /> ₹20 Off Coupon (2000 pts)</button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="content-area">
            <h2><Settings className="icon" /> Account Settings</h2>
            <form className="settings-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="schoolName">School Name</label>
                <input
                  type="text"
                  id="schoolName"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
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
       case 'My order':
          return (
            <div className="content-area">
              <h2><ShoppingBag className="icon" /> My Orders</h2>
              <div className="orders-list">
                {orders.length === 0 ? (
                  <p>No orders found.</p>
                ) : (
                  orders.map((order, index) => (
                    <div key={index} className="order-card">
                      <div className="order-header">
                        <div className="order-meta">
                          <span className="order-id">Order #: {order.id}</span>
                          <span className="order-date">{order.createdAt}</span>
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
                          JSON.parse(order.items).map((item, itemIndex) => (
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
                          <span className="total-amount">₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );


      case 'total Student':
        return (
          <div className="content-area">
            <h2><FaChildReaching className="icon" /> Total Student</h2>
            <div className="Student-table">
              <div className="table-header">
                <span className="table-column">Student Name</span>
                <span className="table-column">Purchase Amount</span>
                <span className="table-column">Reward</span>
              </div>
              {[
                { Student: "mohit", purchaseAmount: "₹50,000", reward: "₹2,500" },
                { Student: "prerna", purchaseAmount: "₹70,000", reward: "₹3,500" },
                { Student: "lakshita", purchaseAmount: "₹60,000", reward: "₹3,000" },
                { Student: "sourabh", purchaseAmount: "₹80,000", reward: "₹4,000" },
              ].map((data, index) => (
                <div key={index} className="table-row">
                  <span className="table-column">{data.Student}</span>
                  <span className="table-column">{data.purchaseAmount}</span>
                  <span className="table-column">{data.reward}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="content-area">Select a tab to view content.</div>;
    }
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        {user.role === 'school' && (
          <div className="user-info">
            <h1>School Dashboard</h1>
            <div className="user-details">
              <span className="user-name">{user.full_name}</span>
            </div>
          </div>
        )}
      </header>
      <div className="profile-content">
        <nav className="sidebar">
          <button
            className={`nav-button ${activeTab === 'redeemPoints' ? 'active' : ''}`}
            onClick={() => setActiveTab('redeemPoints')}
          >
            <Gift size={24} />
            <span>Redeem Points</span>
          </button>
          {/* <button
            className={`nav-button ${activeTab === 'total Student' ? 'active' : ''}`}
            onClick={() => setActiveTab('total Student')}
          >
            <FaChildReaching size={24} />
            <span>Total Student</span>
          </button> */}
          <button
            className={`nav-button ${activeTab === 'My order' ? 'active' : ''}`}
            onClick={() => setActiveTab('My order')}
          >
            <CgShoppingCart size={24} />
            <span>My Order</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <Ticket size={24} />
            <span>Coupons</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Heart size={24} />
            <span>Wishlist</span>
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

export default SchoolProfile;
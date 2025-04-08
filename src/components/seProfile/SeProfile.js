import React, { useState, useEffect } from 'react';
import "./SeProfile.css";
import { Heart, MapPin, Ticket, Gift, Settings, Bell, ShoppingBag } from 'lucide-react';
import men from "../../assets/men.jpg";
import supple from "../../assets/supplies.jpg";
import { Link, useLocation } from "react-router-dom";
import { BiSolidSchool } from "react-icons/bi";
import { CgShoppingCart } from "react-icons/cg";
import axios from 'axios';

const SeProfile = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'Total School');
  const [user, setUser] = useState({
    full_name: '',
    email: '',
    role: '',
    userId: '',
  });
  const [selectedSchool, setSelectedSchool] = useState('');
  const [schools, setSchools] = useState([]);
  const [generatedCoupon, setGeneratedCoupon] = useState(null);
  const [totalSchools, setTotalSchools] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Sync activeTab with URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Fetch user data and wishlist
  useEffect(() => {
    const fetchUserDataAndData = async () => {
      try {
        const seId = localStorage.getItem('seEmployeeId');
        if (!seId) {
          console.error("SE ID not found in localStorage.");
          return;
        }

        const response = await fetch(`http://localhost:5000/api/se-details/${seId}`);
        const data = await response.json();

        if (data.seDetails) {
          setUser({
            full_name: `${data.seDetails.first_name} ${data.seDetails.last_name}`,
            email: data.seDetails.email,
            role: 'se',
            userId: data.seDetails.employee_id,
          });
        } else {
          console.error("SE details not found.");
        }

        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.id) {
          setWishlistLoading(true);
          try {
            const wishlistResponse = await axios.get(`http://localhost:5000/api/wishlist/${storedUser.id}`);
            const formattedWishlist = wishlistResponse.data.map(item => ({
              ...item,
              price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
            }));
            setWishlist(formattedWishlist);
            setWishlistError(null);
          } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlistError('Failed to load wishlist. Please try again later.');
          } finally {
            setWishlistLoading(false);
          }
        }
      } catch (error) {
        console.error("Error fetching SE details:", error);
      }
    };

    fetchUserDataAndData();
  }, []);

  // Sync formData with user data when user changes
  useEffect(() => {
    setFormData({
      fullName: user.full_name || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
    });
  }, [user]);

  // Fetch schools with coupons
  const fetchSchools = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/schools-with-coupons");
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  // Fetch total schools
  const fetchTotalSchools = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/total-schools");
      const data = await response.json();
      setTotalSchools(data);
    } catch (error) {
      console.error("Error fetching total schools:", error);
    }
  };

  useEffect(() => {
    fetchTotalSchools();
  }, []);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.email) return;

      setOrdersLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/orders/email/${storedUser.email}`);
        const data = await response.json();
        setOrders(data);
        setOrdersError(null);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError('Failed to load orders. Please try again later.');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Generate slug for product URLs
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  };

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
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password || undefined,
        }),
      });

      if (response.ok) {
        alert('Profile updated successfully!');
        const updatedUser = await response.json();
        setUser({
          ...user,
          full_name: formData.fullName,
          email: formData.email,
        });
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          fullName: formData.fullName,
          email: formData.email
        }));
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Remove item from wishlist
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

  // Generate coupon
  const generateCoupon = async () => {
    if (!selectedSchool) {
      alert("Please select a school.");
      return;
    }

    const requestBody = {
      schoolId: selectedSchool,
      seEmployeeId: user.userId,
      discountPercentage: 20,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split("T")[0],
      maxUses: 2
    };

    try {
      const response = await fetch("http://localhost:5000/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
      } else {
        alert(`Coupons Generated!\nSchool Coupon: ${data.schoolCouponCode}\nStudent Coupon: ${data.studentCouponCode}`);
        fetchSchools();
      }
    } catch (error) {
      console.error("Error generating coupon:", error);
    }
  };

  // Render content based on activeTab
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
            {/* Add address book content here if needed */}
          </div>
        );
      case 'Genrate coupons':
        return (
          <div className="content-area">
            <h2><Ticket className="icon" /> Generate Coupons</h2>
            <div className="generate-coupon">
              <div className="user-id-box">
                <label htmlFor="user-id">SE ID:</label>
                <input type="text" id="user-id" value={user.userId} disabled />
              </div>
              <div className="school-select-box">
                <label htmlFor="school">Select School:</label>
                <select id="school" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                  <option value="">Select a School</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id} disabled={school.has_coupon}>
                      {school.school_name} {school.has_coupon ? "(Coupon Generated)" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn-primary" onClick={generateCoupon} disabled={!selectedSchool}>
                Generate Coupon
              </button>
              {generatedCoupon && (
                <div className="coupon-details">
                  <h3>Coupon Code: {generatedCoupon.code}</h3>
                  <p>Discount: {generatedCoupon.discount}</p>
                  <p>Expires on: {generatedCoupon.expiry}</p>
                  <p>School: {generatedCoupon.school}</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Total School':
        return (
          <div className="content-area">
            <h2><BiSolidSchool className="icon" /> Total School</h2>
            <div className="school-table">
              <div className="table-header">
                <span className="table-column">SE ID</span>
                <span className="table-column">School Name</span>
                <span className="table-column">School Coupon</span>
                <span className="table-column">Student Coupon</span>
                <span className="table-column">Generation Date</span>
              </div>
              {totalSchools.length > 0 ? (
                totalSchools.map((school, index) => (
                  <div key={index} className="table-row">
                    <span className="table-column">{school.se_id || "N/A"}</span>
                    <span className="table-column">{school.school_name}</span>
                    <span className="table-column">{school.school_coupon_code || "Not Generated"}</span>
                    <span className="table-column">{school.student_coupon_code || "Not Generated"}</span>
                    <span className="table-column">{new Date(school.generation_date).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <p>No schools found.</p>
              )}
            </div>
          </div>
        );
      case 'My order':
        return (
          <div className="content-area">
            <h2><ShoppingBag className="icon" /> My Orders</h2>
            <div className="orders-list">
              {ordersLoading ? (
                <p>Loading orders...</p>
              ) : ordersError ? (
                <p>{ordersError}</p>
              ) : orders.length === 0 ? (
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
                            <img src={item.image} alt={item.name} className="item-image" onError={(e) => (e.target.src = '/placeholder.jpg')} />
                            <div className="item-details">
                              <h4>{item.name}</h4>
                              <div className="item-meta">
                                <span>Quantity: {item.quantity}</span>
                                <span>Price: ₹{item.price}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        JSON.parse(order.items).map((item, itemIndex) => (
                          <div key={itemIndex} className="order-item">
                            <img src={item.image} alt={item.name} className="item-image" onError={(e) => (e.target.src = '/placeholder.jpg')} />
                            <div className="item-details">
                              <h4>{item.name}</h4>
                              <div className="item-meta">
                                <span>Quantity: {item.quantity}</span>
                                <span>Price: ₹{item.price}</span>
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
      case 'redeemPoints':
        return (
          <div className="content-area">
            <h2><Gift className="icon" /> Redeem Points</h2>
            <div className="points-info">
              <div className="points-balance">
                <h3>Current Balance</h3>
                <p className="points">1,500 pts</p>
              </div>
              <div className="points-value">
                <h3>Value</h3>
                <p className="value">₹15.00</p>
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
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
        {user.role === 'se' && (
          <div className="user-info">
            <h1>SE Dashboard</h1>
            <div className="user-details">
              <span className="user-name">{user.full_name}</span>
            </div>
          </div>
        )}
      </header>
      <div className="profile-content">
        <nav className="sidebar">
          <button
            className={`nav-button ${activeTab === 'Total School' ? 'active' : ''}`}
            onClick={() => setActiveTab('Total School')}
          >
            <BiSolidSchool size={24} />
            <span>Total School</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'Genrate coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('Genrate coupons')}
          >
            <BiSolidSchool size={24} />
            <span>Generate Coupons</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'My order' ? 'active' : ''}`}
            onClick={() => setActiveTab('My order')}
          >
            <CgShoppingCart size={24} />
            <span>My Order</span>
          </button>
          <button
            className={`nav-button ${activeTab === 'redeemPoints' ? 'active' : ''}`}
            onClick={() => setActiveTab('redeemPoints')}
          >
            <Gift size={24} />
            <span>Redeem Points</span>
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
          {/* <button
            className={`nav-button ${activeTab === 'manageNotifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('manageNotifications')}
          >
            <Bell size={24} />
            <span>Manage Notifications</span>
          </button> */}
        </nav>
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SeProfile;
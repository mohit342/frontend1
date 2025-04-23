import React, { useState, useEffect } from 'react';
import "./SchoolProfile.css";
import { Heart, MapPin, Ticket, Gift, Settings, Bell, ShoppingBag, Star, Zap } from 'lucide-react';
import { Link } from "react-router-dom";
import { BiSolidOffer } from "react-icons/bi";
import { CgShoppingCart } from "react-icons/cg";
import { useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate
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
  const [studentRewards, setStudentRewards] = useState([]);
  const [studentRewardsLoading, setStudentRewardsLoading] = useState(false);
  const [studentRewardsError, setStudentRewardsError] = useState(null);
  const [specialCouponsLoading, setSpecialCouponsLoading] = useState(false);
  const [specialCouponsError, setSpecialCouponsError] = useState(null);
  const [specialCoupons, setSpecialCoupons] = useState([]);
  const [redeemPointsAmount, setRedeemPointsAmount] = useState('');
  const [returnStatuses, setReturnStatuses] = useState({}); // Add state for return statuses
  const navigate = useNavigate(); // Add navigate hook

  const getImageSrc = (item) => {
    if (item.images && item.images.length > 0) {
      return `http://localhost:5000/${item.images[0].replace(/\\/g, "/")}`;
    } else if (item.image) {
      return `http://localhost:5000/${item.image.replace(/\\/g, "/")}`;
    }
    return `http://localhost:5000/placeholder.jpg`;
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

  const handleRedeemRequest = async (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      alert('Please log in to request point redemption.');
      return;
    }

    const pointsToRedeem = parseInt(redeemPointsAmount);
    if (isNaN(pointsToRedeem) || pointsToRedeem <= 0) {
      alert('Please enter a valid number of points to redeem.');
      return;
    }

    if (pointsToRedeem > rewardPoints) {
      alert('Requested points exceed your current balance.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/redeem-request-school', {
        schoolId: storedUser.id,
        points: pointsToRedeem,
      });
      alert(response.data.message);
      setRedeemPointsAmount('');
    } catch (error) {
      console.error('Error submitting redeem request:', error);
      alert(error.response?.data?.error || 'Failed to submit redeem request.');
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
          schoolId = schoolResponse.data.id || storedUser.id;
        } else if (storedUser.role === 'student') {
          const studentResponse = await axios.get(`http://localhost:5000/api/users/${storedUser.id}`);
          schoolId = studentResponse.data.school_id;
        }

        if (schoolId) {
          const pointsResponse = await axios.get(`http://localhost:5000/api/schools/user/${storedUser.id}/points`);
          setRewardPoints(pointsResponse.data.reward_points);

          setStudentRewardsLoading(true);
          try {
            const rewardsResponse = await axios.get(`http://localhost:5000/api/schools/${schoolId}/student-rewards`);
            setStudentRewards(rewardsResponse.data);
            setStudentRewardsError(null);
          } catch (error) {
            console.error("Error fetching student rewards:", error);
            setStudentRewardsError('Failed to load student rewards. Please try again later.');
          } finally {
            setStudentRewardsLoading(false);
          }
        } else {
          setRewardPoints(0);
          setStudentRewards([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setRewardPoints(0);
        setStudentRewards([]);
      }

      setOrdersLoading(true);
      try {
        const ordersResponse = await fetch(`http://localhost:5000/api/orders/email/${storedUser.email}`);
        let ordersData = await ordersResponse.json();
        ordersData = ordersData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Fetch return request status for each order
        const returnStatusPromises = ordersData.map(async (order) => {
          try {
            const response = await axios.get(`http://localhost:5000/api/orders/returns?order_id=${order.id}`);
            return { orderId: order.id, status: response.data.status || null };
          } catch (error) {
            console.error(`Error fetching return status for order ${order.id}:`, error.message);
            return { orderId: order.id, status: null };
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

      setCouponsLoading(true);
      try {
        const couponsResponse = await axios.get(`http://localhost:5000/api/coupons/user/${storedUser.id}`);
        console.log('Coupons Response:', couponsResponse.data);
        setCoupons(couponsResponse.data);
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
    const fetchSpecialCoupons = async () => {
      setSpecialCouponsLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        console.log("Stored User Data:", storedUser);

        if (!storedUser || !storedUser.id) {
          setSpecialCouponsError("User not found. Please log in.");
          return;
        }

        console.log("Fetching special coupons for userId:", storedUser.id);

        let specialCoupons = [];
        try {
          console.log("Requesting universal coupons for URL:", `http://localhost:5000/api/couponall/user/${storedUser.id}`);
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

        console.log("Special Coupons:", specialCoupons);

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
                    {console.log("Rendering special coupons:", specialCoupons)}
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
                          Valid: -{' '}
                          {new Date(coupon.valid_until).toLocaleDateString()}
                        </p>
                        <p className="type">{isStudentCoupon ? 'Student Coupon' : 'School Coupon'}</p>
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
                <form onSubmit={handleRedeemRequest} className="redeem-form">
                  <input
                    type="number"
                    value={redeemPointsAmount}
                    onChange={(e) => setRedeemPointsAmount(e.target.value)}
                    placeholder="Enter points to redeem"
                    min="1"
                    className="redeem-input"
                  />
                  <button type="submit" className="btn-primary">
                    <ShoppingBag size={18} /> Redeem Point Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
      case 'rewardPoints':
        return (
          <div className="content-area">
            <h2><Gift className="icon" /> Total Purchase</h2>
            {studentRewardsLoading ? (
              <p>Loading student rewards...</p>
            ) : studentRewardsError ? (
              <p>{studentRewardsError}</p>
            ) : (
              <div className="Student-table">
                <div className="table-header">
                  <span className="table-column">Student Name</span>
                  <span className="table-column">Order Amount</span>
                  <span className="table-column">Purchase Date</span>
                </div>
                {studentRewards.length === 0 ? (
                  <p>No rewards data available</p>
                ) : (
                  studentRewards.map((data, index) => (
                    <div key={index} className="table-row">
                      <span className="table-column">{data.student_name}</span>
                      <span className="table-column">₹{data.order_amount}</span>
                      <span className="table-column">{data.purchase_date}</span>
                    </div>
                  ))
                )}
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
                        <p className="return-status">We will replace this product soon</p>
                      )}
                      {returnStatuses[order.id] === 'pending' && (
                        <p className="return-status">Return request pending</p>
                      )}
                      {returnStatuses[order.id] === 'rejected' && (
                        <p className="return-status">Return request rejected</p>
                      )}
                    </div>
                  </div>
                ))
              )}
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
          <button
            className={`nav-button ${activeTab === 'rewardPoints' ? 'active' : ''}`}
            onClick={() => setActiveTab('rewardPoints')}
          >
            <Star size={24} />
            <span>Total Purched </span>
          </button>
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
            className={`nav-button ${activeTab === 'specialCoupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('specialCoupons')}
          >
            <BiSolidOffer size={24} />
            <span>Special Coupons</span>
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
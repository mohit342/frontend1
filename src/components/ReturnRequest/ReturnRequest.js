import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ReturnRequest.css';

const ReturnRequest = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || orderId === 'undefined') {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
        setOrder(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load order details');
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please provide a reason for the return');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || !storedUser.id) {
      alert('Please log in to submit a return request');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/orders/return', {
        orderId,
        userId: storedUser.id,
        reason
      });
      alert('Return request submitted successfully');
      navigate('/profilepage');
    } catch (err) {
      alert('Failed to submit return request');
      console.error(err);
    }
  };

  const getImageSrc = (item) => {
    if (item.images && item.images.length > 0) {
      return `http://localhost:5000/${item.images[0].replace(/\\/g, "/")}`;
    } else if (item.image) {
      return `http://localhost:5000/${item.image.replace(/\\/g, "/")}`;
    }
    return `http://localhost:5000/placeholder.jpg`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="return-request-container">
      <h2>Request Return for Order #{order.id}</h2>
      <div className="order-details">
        {/* <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p> */}
        <p><strong>Total:</strong> ₹{order.total}</p>
        <div className="order-items">
          {JSON.parse(order.items).map((item, index) => (
            <div key={index} className="order-item">
              <img
                src={getImageSrc(item)}
                alt={item.name}
                className="item-image"
                onError={(e) => e.target.src = 'http://localhost:5000/placeholder.jpg'}
              />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="return-form">
        <div className="form-group">
          <label htmlFor="reason">Reason for Return</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please explain why you want to return this product"
            required
          />
        </div>
        <button type="submit" className="btn-primary">Submit Return Request</button>
      </form>
    </div>
  );
};

export default ReturnRequest;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./HotDeal.css";

const HotDeal = () => {
  const [deals, setDeals] = useState([]);
  const navigate = useNavigate();

  const fetchDeals = () => {
    fetch('http://localhost:5000/api/hotdeals')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched deals:', data);
        setDeals(data.filter(deal => deal.is_visible));
      })
      .catch(error => console.error('Error fetching deals:', error));
  };

  useEffect(() => {
    fetchDeals();

    const handleRefresh = () => {
      fetchDeals();
    };

    window.addEventListener('hotDealsRefresh', handleRefresh);

    return () => {
      window.removeEventListener('hotDealsRefresh', handleRefresh);
    };
  }, []);

  const handleDealClick = (subcategoryId) => {
    navigate(`/product?subcategoryId=${subcategoryId}`); // Use subcategoryId instead of subSubcategoryId
  };

  return (
    <div className='HotContainer'>
      <div className="title">
        <h1>Hot Deals</h1>
      </div>
      <div className="hotcard">
        {deals.map(deal => (
          <div
            className="card1"
            key={deal.id}
            onClick={() => handleDealClick(deal.subcategory_id)}
            style={{ cursor: 'pointer' }}
          >
            <img src={`http://localhost:5000${deal.image_path}`} alt={deal.title} />
            <h2>{deal.title}</h2>
            <h2>Starting at <strong>₹{deal.price}</strong></h2>
            {deal.offer_text && <p>{deal.offer_text}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotDeal;
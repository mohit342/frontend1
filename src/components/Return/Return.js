import React from 'react';
import './Retuen.css';
import Header from '../header/Header';
import Footer from '../Footer/Footer';

const Return = () => {
  return (
    <>
    <Header />
    <div className='return-container'>
    <div className="refund-policy-container">
        
      <h1>Return and Refund Policy</h1>

      <h2>MittSure Kids Activity Worksheet Refund Policy</h2>
      <p>
        At MittSure, we are committed to providing high-quality educational materials and excellent
        customer service. We understand that occasionally issues may arise, and we are here to assist
        you every step of the way.
      </p>

      <h3>Refund Policy:</h3>
      <p>
        We regret to inform you that refunds are not applicable for MittSure Kids Activity Worksheet
        purchases. However, we prioritize customer satisfaction and are dedicated to resolving any
        issues you may encounter promptly.
      </p>

      <h3>Customer Support:</h3>
      <p>
        Should you encounter any problems or have concerns regarding your MittSure Kids Activity
        Worksheet, please do not hesitate to contact our dedicated customer support team. Our
        knowledgeable representatives are available to assist you with any questions or issues you may have.
      </p>

      <h3>Contact Us:</h3>
      <p>
        If you need assistance, please reach out to us via:
      </p>
      <div className="contact-section">
        <p><strong>Phone:</strong> 1800 891 7070 / 7374003601</p>
      </div>
    </div>
    </div>
    <Footer/>
    </>
  );
};

export default Return;
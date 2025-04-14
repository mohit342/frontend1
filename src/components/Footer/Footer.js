import React from "react";
import "./Footer.css";
import { ImFacebook2 } from "react-icons/im";
import { FaTwitter } from "react-icons/fa6";
import { FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          {/* <p className="copyright">Copyright ©2025 Mittlearn. All Rights Reserved.</p> */}
          <img src={logo} alt="Mittlearn Logo" className="footer-logo" />
                  </div>
        <div className="footer-section">
        <div className="footerSection3">
          <h3>Ours Brand</h3>
          <ul>
          
          <li><Link to="https://mittsure.com/" target="_blank">MittSure</Link></li>

          <li><Link to="https://mittlearn.qdegrees.com/" target="_blank"> Mittlearn</Link></li>
          <li><Link to="https://www.schoolathome.mittsure.com/" target="_blank"> School@Home</Link></li>

          <Link to="/enquiryform"><button>Stay connected</button></Link>

          </ul>
          </div>
        </div>
        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li><a href="/Return">Refund & return policy</a></li>
            <li><a href="/terms">Terms & Conditions</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <ul>
            <li><span>📍 B-121, Mangal Marg, Bapu Nagar,Jaipur (Raj)</span></li>
            <li><span>📞 1800 891 7070</span></li>
            <li><span>📧 info.mittlearn@gmail.com</span></li>
          </ul>
        </div>
      </div>
      <div className="social-icons">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          <ImFacebook2 />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagramSquare />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaTwitter />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
          <FaLinkedin />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
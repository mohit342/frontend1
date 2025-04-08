import React from "react";
import "./Footer.css";
import { ImFacebook2 } from "react-icons/im";
import { FaTwitter } from "react-icons/fa6";
import { FaInstagramSquare } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <>
      <div className="footerContainer">
        <div className="footerSection1">
          <h2>Shop By Product Category</h2>
          <p>Furniture</p>
          <p>School - Office Supplies</p>
          <p>Art Supplies - Craft Supplies</p>
          <p>Paper</p>
          <p>Early Childhood</p>
          <p>Physical Education - Sport</p>
          <p>Early Childhood</p>
          <p>Educational Technology</p>
          <p>Literacy - Language</p>
        </div>
        <div className="footerSection2">
          <div className="footersub">
            <p>Science</p>
            <p>Math</p>
            <p>Special Needs</p>
            <p>Outdoor - Playground</p>
            <p>Safety - Security</p>
            <p>Cleaning - Facility Supplies</p>
            <p>Career - Technical</p>
           
          </div>
        </div>
        <div className="footerSection3">
         <h3>Share Your Email and Communication Preferences</h3>
         <Link to="/enquiryform"><button>Stay connected</button></Link>

         <h3>Follow us</h3>
          <div className="icon">
          <ImFacebook2  fontSize={30}/>
          <FaTwitter fontSize={30} />
          <FaInstagramSquare fontSize={30}/>
          <FaLinkedin fontSize={30} />

          </div>
        </div>
        <div className="footerSection4">
        <h2>Information</h2>
          <p>Our Brands</p>
          <p>Helps</p>
          <p>Request Catalog</p>
          <p>Digital Catalog</p>
          <p>Shipping Policy</p>
          <p>Return Policy</p>
          
        </div>
        <p >&copy; {new Date().getFullYear()} Mittstore. All Rights Reserved.</p>

      </div>
    </>
  );
};

export default Footer;

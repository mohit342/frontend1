import React from "react";
import "./About.css";
import Header from "../../components/header/Header";
import mosqueImage from "../../assets/about.jpg"; // Ensure the image is placed in public/assets/
import Footer from "../Footer/Footer";

const About = () => {
  
  return (
    <div>
        <Header/>
<section className="about-us1">
      <div className="about-content1">
        <h2> ABOUT US </h2>
        <h3>A New Way For Working For Many Of Professionals.</h3>
        <p>
        Mittsure is India's fastest-growing revolutionary Ed-tech start-up, providing digital solutions to schools and institutions, along with various other facilities. The primary objective of Mittsure is to empower schools for an enriching experience. To extend learning, we collaborate with different schools through our interactive Mittsure Books. 
        </p>
        <p>
        With the recommendation of using Mittsure Books in schools, we provide schools access to free ERP software that manages every need of your school on a single platform. Our ERP software helps schools manage their day-to-day activities anytime, anywhere, with just a few clicks. With the help of ERP, we intend to facilitate schools by offering a one-stop solution.
        </p>
      </div>
      <div className="image-gallery1">
        <div className="image-container1">
          <div className="image-section left"></div>
          <div className="image-section middle"></div>
          <div className="image-section right"></div>
        </div>
      </div>
    </section>
    <Footer/>
    </div>
    
  );
};

export default About;
import React from "react";
import Header from "../../components/header/Header";
import "./Home.css";
import { Swiper, SwiperSlide } from "swiper/react";
import tabs from "../../assets/Tabs.JPG";
import elct from "../../assets/elct.jpg";
import outdoor from "../../assets/outdoor.JPG";
import current from "../../assets/current.jpg";
import fur from "../../assets/fur.jpg";
import poster from "../../assets/Poster.jpg";
import headphone from "../../assets/headphone.png";
import Furniture from "../../assets/chairimage.png";
import Desks from "../../assets/desk.png";
import SolarPanel from "../../assets/solar.png";
import Sports from "../../assets/sports.png";
import Tablets from "../../assets/tablets.png";
import Supplies from "../../assets/scissors.png";
import Paper from "../../assets/papers.png";
import Pencils from "../../assets/pencil.png";
import Art from "../../assets/art.png";
import Paint from "../../assets/paints.png";
import Computer from "../../assets/computer.png";
import kids from "../../assets/kids.jpg";
import trust from "../../assets/trusted.png"
import secure from "../../assets/secure.png"
import customer from "../../assets/customer.png";
import support from "../../assets/support.png";
import { Link } from "react-router-dom";
import { SearchContext } from "../../context/SearchContext"; // Import SearchContext

import { useState, useEffect } from 'react';
import axios from 'axios';

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import slide1 from "../../assets/1.gif";
import slide2 from "../../assets/2.gif";

import slide3 from "../../assets/3.gif";

import { Autoplay } from "swiper/modules";

// import required modules
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css/navigation";
import Footer from "../../components/Footer/Footer";
import TopTranding from "../../components/TopTranding/TopTranding";
import HotDeal from "../../components/HotDeal/HotDeal";
import Clients from "../../components/Clients/Clients";
function Home() {
  // const { searchTerm } = useContext(SearchContext);



  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await axios.get('http://localhost:5000/api/categories1');
      setCategories(response.data);
    };
    fetchCategories();
  }, []);

  return (
    <div>
      <Header />
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{ delay: 3000 }}
        slidesPerView={1}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          576: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          992: {
            slidesPerView: 1,
            spaceBetween: 20,
          },
          1200: {
            slidesPerView: 1,
            spaceBetween: 50,
          },
        }}
        className="mySwiper"
      >
        <SwiperSlide>
          {/* <img src={slide1} alt="" /> */}
          <img src="https://mittstore.com/cdn/shop/files/Website_1536x500px_1.jpg?v=1740646953&width=2136" alt="" />

        </SwiperSlide>
        <SwiperSlide>
          {/* <img src={slide2} alt="" /> */}
          <img src="https://mittstore.com/cdn/shop/files/Website_1536x500px_3.jpg?v=1740646952" alt="" />
        </SwiperSlide>
        <SwiperSlide>
          {/* <img src={slide3} alt="" /> */}
          <img src="https://mittstore.com/cdn/shop/files/Website_1536x500px_2.jpg?v=1740646953" alt="" />
        </SwiperSlide>
      </Swiper>
      <TopTranding />
      <HotDeal />
      <div className="mittsure-container">
        <div className="container1">
          <img src={poster} alt="" />
          <div className="title2">
            <h1>Mittsure Empowering Schools For an Enriching Experience</h1>
            <Link to="/enquiryform"><button style={{ cursor: "pointer" }}>Let's Discuss</button></Link>
          </div>
        </div>
      </div>
      <div className="featuredCategories">
        <div className="featured-container">
          <div className="title">
            <h1>Featured Categories</h1>
          </div>
          <div className="card-conatiner">
            {categories.map(category => (
              <div key={category.id} className="featured-card">
                <img src={`http://localhost:5000/${category.image_path}`} alt={category.name} />
                <p>{category.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="video-container">
        <video
          src="https://mittstore.com/cdn/shop/videos/c/vp/30a58a53e5ec4dc98492115906cdbd00/30a58a53e5ec4dc98492115906cdbd00.SD-480p-1.5Mbps-43376959.mp4?v=0"
          // controls
          autoPlay
          loop
          muted
          className="full-width-video"
        />
      </div>
      <div className="about">
        <img src={kids} alt="kids" />
        <div className="about-container">
          <h1>About Mittsure!</h1>
          <p>
            Mittsure Technologies is a revolutionary startup that provides
            end-to-end solutions to schools for all their requirements, from
            academics to infrastructure. The primary objective of Mittsure is to
            empower schools under NEP 2020. Mittsure is also facilitating
            schools by partnering with startups and organizations, developing
            products and services for pre-primary, primary, secondary, higher
            secondary education, and school infrastructure.
          </p>
          <div className="title4">
            <Link to={"https://www.mittsure.com"} target="_blank"><button style={{ cursor: "pointer" }}>About us</button></Link>
          </div>
        </div>
      </div>
      <div className="detail">
        <div className="detailCard">
          <img src={trust} alt="trusted" />
          <h5>Trusted platform</h5>
          <p>Provide security capabilites</p>
        </div>
        <div className="detailCard">
          <img src={secure} alt="trusted" />
          <h5>Secure Payment</h5>
          <p>We ensure secure payment</p>
        </div>
        <div className="detailCard">
          <img src={customer} alt="trusted" />
          <h5>Become a Mittsure customer</h5>
          <p>It's intuitive,and it helps you leverage<br />
            every money you spend</p>
        </div>
        <div className="detailCard">
          <img src={support} alt="trusted" />
          <h5>Customer Support </h5>
          <p>Call or email us 24/7</p>
        </div>
      </div>
      <Clients />
      <Footer />
    </div>
  );
}

export default Home;

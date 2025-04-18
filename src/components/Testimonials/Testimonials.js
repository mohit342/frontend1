import React, { useState, useEffect } from "react";
import "./Testinomials.css"; // Import CSS file

import Teacher from "../../assets/teacher2.jpg";
import Teacher1 from "../../assets/teacher3.jpg";
import Teacher2 from "../../assets/teacher4.jpg";
import Teacher3 from "../../assets/teacher5.jpg";
import TestimonialCard from "./TestimonialCard";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const testimonialsData = [
  {
    name: "Mrs. Shashi Sachdeva",
    image: Teacher,
    designation: "Director/Principal | Shri Ram Satluj School, Sirsa, Haryana",
    text: `
      I just wanted to share a quick note and let you know that you guys do a really good job,
      being a one stop solution is not a cherry on cake,
      and you guys on the other hand facilitating the things in a very smoother way.
    `,
  },
  {
    name: "Mrs Rajni Dhiman",
    image: Teacher1,
    designation: "Principal | Laxmi Public School, Delhi",
    text: `
      The content in the mittsure book is engaging and age appropriate.
      Illustration are colorful and activities are attractive to keep kids attentive.
      Vocabulary and language structure are suitable for primary learners.
      There are opportunities for oral and visual comprehension.
    `,
  },
  {
    name: "Mr Hariram Ranwa",
    image: Teacher2,
    designation: "Principal",
    text: `
      Mittsure is a best single provider
      Mittsure is a best single provider" on a single platform get all the services.
      All the best Mittsure Team
    `,
  },
  {
    name: "Mr Shiv Kumar",
    image: Teacher3,
    designation: "Principal | RPS School, Sirsa, Haryana",
    text: `
      I like the efficiency, clarity, and transparency of Mittsure.
      Also, quick responses were provided
    `,
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalTime = 5000; // 5 seconds

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonialsData.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, intervalTime);
    return () => clearInterval(timer); // Cleanup on unmount or index change
  }, [currentIndex]);

  return (
    <>
    
      <section className="testimonials">
        <h1>"Your Trust, Our Pride" — Hear from MittStore Shoppers</h1>
        <div className="testimonials-container">
          <div className="dots">
            {testimonialsData.map((_, index) => (
              <div
                key={index}
                className={`dot ${index === currentIndex ? "active" : ""}`}
                onClick={() => setCurrentIndex(index)}
              ></div>
            ))}
          </div>
          <TestimonialCard {...testimonialsData[currentIndex]} />
          {/* <div className="testimonial-nav-buttons">
            <button className="arrow-button left" onClick={handlePrev}>
              <FaArrowLeft />
            </button>
            <button className="arrow-button right" onClick={handleNext}>
              <FaArrowRight />
            </button>
          </div> */}
        </div>
      </section>
     
    </>
  );
};

export default Testimonials;
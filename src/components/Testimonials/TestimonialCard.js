import React from "react";

const TestimonialCard = ({ name, image, text, designation }) => {
  return (
    <div className="testimonial">
      <img src={image} alt={name} />
      <h2>{name}</h2>
      <h4>{designation}</h4>
      <p>{text}</p>
    </div>
  );
};

export default TestimonialCard;
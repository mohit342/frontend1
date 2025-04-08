import React, { useState, useEffect } from "react";
import "./EnquiryForm.css";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import ContactImage from "../../assets/lets.jpg";
import Header from "../../components/header/Header";
import Footer from "../../components/Footer/Footer";

const EnquiryForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on mount
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/enquiries/send-enquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setSubmitted(true);
                setFormData({ name: "", email: "", message: "" });
                setTimeout(() => setSubmitted(false), 3000);
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.message);
        }
    };

    return (
        <>
            <Header />
            <div className="box5">
                <div className="contact-container">
                    <div className="contact-box">
                        <div className="left-section">
                            <h2>Let's Discuss</h2>
                            <p>
                                To request a quote or want to meet up for coffee, contact us directly or fill out the form and we will get back to you promptly.
                            </p>
                            {submitted && (
                                <div className="success-message">Thank you! Your enquiry has been sent.</div>
                            )}
                            {error && (
                                <div className="error-message">Error: {error}</div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <textarea
                                    name="message"
                                    placeholder="Your Message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                ></textarea>
                                <button type="submit">Send Message</button>
                            </form>
                        </div>
                        <div className="right-section">
                            <img src={ContactImage} alt="Contact Illustration" className="contact-image" />
                            <div className="info">
                                <p>
                                    <FaMapMarkerAlt /> S-14, 3rd floor, Mangal Marg, Bapu Nagar, Jaipur (Raj.)
                                </p>
                                <p>
                                    <FaPhoneAlt /> 7374003601
                                </p>
                                <p>
                                    <FaEnvelope /> info@mittsure.com
                                </p>
                            </div>
                            <div className="social-icons">
                                <FaFacebook />
                                <FaTwitter />
                                <FaInstagram />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EnquiryForm;
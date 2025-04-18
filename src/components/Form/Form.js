import React from "react";
import "./Form.css";
import Header from "../../components/header/Header";
import Footer from "../../components/Footer/Footer";
import { useState } from "react";

const Form = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        product: "",
        quantity: "",
        message: "",
    });

    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            product: "",
            quantity: "",
            message: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/bulk-orders/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  ...formData,
                  quantity: Number(formData.quantity), // Explicit conversion
                }),
            });

            if (response.ok) {
                console.log('Form Submitted', formData);
                setSubmitted(true);
                resetForm();
                setError(null);
                setTimeout(() => setSubmitted(false), 3000);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.message);
            setSubmitted(false);
        }
    };

    return (
        <>
            <Header />
            <div className="box6">
                <div className="bulk-order-container">
                    <h2>Bulk Order Enquiry</h2>
                    {submitted && (
                        <p className="success-message">Thank you! We will contact you soon.</p>
                    )}
                    {error && (
                        <p className="error-message">{error}</p>
                    )}
                    {!submitted && (
                        <form onSubmit={handleSubmit} className="bulk-order-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>organization name</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Product</label>
                                <input
                                    type="text"
                                    name="product"
                                    value={formData.product}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Additional Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <button type="submit" className="submit-btn">
                                Submit Enquiry
                            </button>
                        </form>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Form;
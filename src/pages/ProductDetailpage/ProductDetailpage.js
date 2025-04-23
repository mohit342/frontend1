import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Productdetail.css";
import Header from "../../components/header/Header";
import Footer from "../../components/Footer/Footer";
import { useCart } from "../../components/context/CartContext";

function ProductDetailpage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });

  const { addToCart } = useCart();

  const imageRef = useRef(null);
  const zoomRef = useRef(null);

  const addToWishlist = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("Please log in to add items to your wishlist.");
      navigate("/user/login");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/wishlist", {
        userId: user.id,
        productId: product.id,
      });
      alert("Product added to wishlist successfully!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert(
        error.response?.data?.error || "Failed to add product to wishlist."
      );
    }
  };

  const handleAddToCart = async () => {
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        images: product.images,
      };

      const success = await addToCart(cartProduct);
      if (success) {
        alert("Product added to cart successfully!");
        setQuantity(1);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart.");
    }
  };

  const fetchProduct = async () => {
    try {
      const decodedSlug = decodeURIComponent(slug);
      const response = await axios.get(
        `http://localhost:5000/api/products/slug/${encodeURIComponent(decodedSlug)}`,
        {
          timeout: 8000,
        }
      );

      if (!response.data?.data) {
        throw new Error("Product not found");
      }

      const productData = response.data.data;
      setProduct(productData);
      setSelectedImageIndex(0);

      try {
        const reviewResponse = await axios.get(
          `http://localhost:5000/api/reviews/product/${productData.id}`
        );
        setReviews(reviewResponse.data.data || []);
      } catch (reviewError) {
        console.error("Error fetching reviews:", reviewError);
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.response?.data?.error || "Product not found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug || slug.length < 3) {
      setError("Invalid product URL.");
      setLoading(false);
      return;
    }

    fetchProduct();
  }, [slug]);

  const handleMouseMove = (e) => {
    if (!imageRef.current || !product?.images) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setZoomPosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
    setIsZoomActive(true);
  };

  const handleMouseLeave = () => setIsZoomActive(false);

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("Please log in to submit a review.");
      navigate("/user/login");
      return;
    }

    let username;
    if (user.role === "school") {
      username = user.schoolName || user.full_name;
    } else if (user.role === "student") {
      username = user.full_name || `${user.firstName} ${user.lastName || ""}`;
    } else if (user.role === "se") {
      username = user.full_name || `${user.firstName} ${user.lastName || ""}`;
    }

    if (!username) {
      alert("Your account is missing a username. Please update your profile.");
      navigate("/profile");
      return;
    }

    if (newReview.rating < 1 || newReview.rating > 5 || !newReview.comment.trim()) {
      alert("Please provide a valid rating (1-5) and a non-empty comment.");
      return;
    }

    try {
      const reviewData = {
        userId: user.id,
        username: username,
        productId: product.id,
        rating: newReview.rating,
        comment: newReview.comment,
      };
      const response = await axios.post("http://localhost:5000/api/reviews", reviewData);
      setReviews([...reviews, response.data.data]);
      setNewReview({ rating: 0, comment: "" });
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(
        error.response?.data?.error || "Failed to submit review."
      );
    }
  };

  if (loading) {
    return (
      <div className="loading100">
        <Header />
        Loading...
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error100">
        <Header />
        {error || "Product not found."}
        <Footer />
      </div>
    );
  }

  const imageUrl =
    Array.isArray(product.images) && product.images[selectedImageIndex]
      ? `http://localhost:5000/${product.images[selectedImageIndex].replace(/\\/g, "/")}`
      : "/placeholder.jpg";

  return (
    <>
      <Header />
      <div className="product-detail-container100">
        <div className="image-section100">
          <div
            className="main-image-container100"
            ref={imageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={imageUrl}
              alt={product.name}
              className="main-image100"
              onError={(e) => (e.target.src = "/placeholder.jpg")}
            />
            <div
              className={`lens100 ${isZoomActive ? "visible" : "hidden"}`}
              style={{
                left: `${zoomPosition.x}%`,
                top: `${zoomPosition.y}%`,
              }}
            />
          </div>

          <div
            ref={zoomRef}
            className={`zoom-window100 ${isZoomActive ? "visible" : "hidden"}`}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: "300%",
            }}
          />

          <div className="thumbnail-container100">
            {Array.isArray(product.images) &&
              product.images.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/${img.replace(/\\/g, "/")}`}
                  alt={`Thumbnail ${index + 1}`}
                  className={`thumbnail100 ${selectedImageIndex === index ? "active" : ""}`}
                  onClick={() => setSelectedImageIndex(index)}
                  onError={(e) => (e.target.src = "/placeholder.jpg")}
                />
              ))}
          </div>
        </div>

        <div className="product-info100">
          <h1 className="product-name100">{product.name}</h1>
          <div className="price-container1">
            <span className="current-price11">₹{product.price.toFixed(2)}</span>
            {product.discount_percentage > 0 && (
              <>
                <span className="original-price1">
                  <del>
                    ₹{(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}
                  </del>
                </span>
                <div className="discount-badge1">({product.discount_percentage}% OFF)</div>
              </>
            )}
          </div>

          <p className="product-short-description100">
            {product.short_description || "No description available."}
          </p>

          <div className="quantity-container100">
            <label>
              <b>Quantity:</b>
            </label>
            <div className="quantity-selector100">
              <button onClick={decreaseQuantity} className="qty-btn100">
                −
              </button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity} className="qty-btn100">
                +
              </button>
            </div>
          </div>

          <div className="action-buttons100">
            <button className="bbuy-now100" onClick={addToWishlist}>
              Add to Wishlist
            </button>
            <button className="add-to-cart100" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
        <div className="product-info-sections">

          <div className="product-description100">
            <h2>Description</h2>
            <p>{product.description || "No description available."}</p>
          </div>

          <div className="reviews-section100">
            <h2>Customer Reviews</h2>
            <div className="review-form100">
              <h3>Write a Review</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="rating-selector100">
                  <label>Rating:</label>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star100 ${newReview.rating >= star ? "filled" : ""}`}
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="comment-input100">
                  <label>Comment:</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    required
                    placeholder="Share your thoughts about this product..."
                  />
                </div>
                <button type="submit" className="submit-review100">
                  Submit Review
                </button>
              </form>
            </div>
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review this product!</p>
            ) : (
              <div className="reviews-list100">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item100">
                    <div className="review-username100">{review.username}</div>
                    <div className="review-rating100">
                      {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                    </div>
                    <p className="review-comment100">{review.comment}</p>
                    <p className="review-date100">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : "Date not available"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetailpage;
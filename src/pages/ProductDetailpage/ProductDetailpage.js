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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZoomActive, setIsZoomActive] = useState(false);

  const { addToCart } = useCart();

  const imageRef = useRef(null);
  const zoomRef = useRef(null);

  const addToWishlist = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Please login to add items to wishlist");
      navigate("/user/login");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/wishlist", {
        userId: user.id,
        productId: product.id,
      });
      alert("Product added to wishlist successfully!");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      alert("Failed to add to wishlist");
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
        setQuantity(1); // Reset quantity after successful addition
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  useEffect(() => {
    if (!slug || slug.length < 3) {
      navigate("/not-found", { replace: true });
      return;
    }

    const fetchProduct = async () => {
      try {
        const decodedSlug = decodeURIComponent(slug);
        const response = await axios.get(
          `http://localhost:5000/api/products/slug/${encodeURIComponent(decodedSlug)}`,
          {
            timeout: 8000,
            validateStatus: (status) => status === 200 || status === 404,
          }
        );

        if (response.status === 404 || !response.data?.data) {
          navigate("/not-found", { replace: true });
          return;
        }

        const productData = response.data.data;
        setProduct(productData);
        setSelectedImageIndex(0);
      } catch (error) {
        navigate("/not-found", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

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
  const decreaseQuantity = () => quantity > 1 && setQuantity((prev) => prev - 1);

  if (loading) return <div className="loading100">Loading...</div>;
  if (!product) return <div className="error100">Product not found</div>;

  const imageUrl = Array.isArray(product.images) && product.images[selectedImageIndex]
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
              product.images.slice(0, 5).map((img, index) => (
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
          {/* <p className="product-price100">
            <b>Price:</b> Rs.{product.price.toFixed(2)}
            {product.discount_percentage > 0 && (
              <span className="discount-tag100"></span>

            )}
          </p> */}
          <div className="price-container1">
  <span className="current-price1">₹{product.price.toFixed(2)}</span>
  {product.discount_percentage > 0 && (
    <>
      <span className="original-price1">
        <del>₹{(product.price / (1 - product.discount_percentage / 100)).toFixed(2)}</del>
      </span>
      <div className="discount-badge1">
        ({product.discount_percentage}% OFF)
      </div>
    </>
  )}
</div>

          <p className="product-short-description100">{product.short_description || "N/A"}</p>

          <div className="quantity-container100">
            <label><b>Quantity:</b></label>
            <div className="quantity-selector100">
              <button onClick={decreaseQuantity} className="qty-btn100">−</button>
              <span>{quantity}</span>
              <button onClick={increaseQuantity} className="qty-btn100">+</button>
            </div>
          </div>
          <button className="bbuy-now100" onClick={addToWishlist}>
            Add to Wishlist
          </button>
          <button className="add-to-cart100" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>

        <div className="product-description100">
          <h2>Description</h2>
          <p>{product.description || "No description available."}</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductDetailpage;
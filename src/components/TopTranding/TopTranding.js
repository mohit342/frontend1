// src/components/TopTranding.js
import React, { useEffect, useState } from "react";
import "./TopTranding.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { useCart } from "../context/CartContext";

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 200);
};

const TopTranding = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products/top-trending");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const productsData = data.data || data.products || data;

        if (!Array.isArray(productsData)) throw new Error("Invalid products data format");

        const formattedProducts = productsData.map(product => ({
          ...product,
          id: product.id,
          slug: product.slug || generateSlug(product.name),
          price: Number(product.price),
          discount_percentage: Number(product.discount_percentage) || 0,
          images: product.images || ["/placeholder.jpg"] // Placeholder for images
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product, event) => {
    event.preventDefault();
    event.stopPropagation();
  
    try {
      const mrp = product.discount_percentage > 0 
        ? product.price / (1 - product.discount_percentage / 100)
        : product.price;
  
      const success = await addToCart({
        ...product,
        price: Number(product.price),
        images: product.images?.[0] || "/placeholder.jpg",
        mrp: mrp.toFixed(2),
        stock_quantity: product.stock_quantity || 0 // Include stock for cart
      });
  
      alert(success ? "Item added to cart!" : "Failed to add item!");
    } catch (error) {
      console.error("Cart error:", error);
      alert("Error adding to cart");
    }
  };

  return (
    <div className="top-categorish">
      <h1 className="title">Top Trending</h1>

      {loading ? (
        <div className="loading">Loading trending products...</div>
      ) : products.length === 0 ? (
        <div className="no-products">No trending products available</div>
      ) : (
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 30 },
            1024: { slidesPerView: 4, spaceBetween: 40 },
          }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="mySwiper"
        >
          {products.map((product) => {
            const hasDiscount = product.discount_percentage > 0;
            const originalPrice = hasDiscount
              ? (product.price / (1 - product.discount_percentage / 100)).toFixed(2)
              : null;

            return (
              <SwiperSlide key={product.id}>
                <div className="product-card">
                  <Link 
                    to={`/product/${encodeURIComponent(product.slug)}`} 
                    className="product-image-link"
                  >
                    <img
                      src={product.images?.[0] || "/placeholder.jpg"}
                      alt={product.name}
                      onError={(e) => e.target.src = "/placeholder.jpg"}
                    />
                  </Link>
                  
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <div className="price-container">
                      <span className="current-price">
                        ₹{product.price.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <>
                          <span className="original-price">
                            <del>₹{originalPrice}</del>
                          </span>
                          <div className="discount-badge">
                            ({product.discount_percentage}% OFF)
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="button-container">
                    <button 
                      className="add-to-cart-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={product.stock_quantity <= 0}
                    >
                      {product.stock_quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <Link to={`/product/${encodeURIComponent(product.slug)}`}>
                      {/* <button className="view-details-btn">
                        View Details
                      </button> */}
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      )}
    </div>
  );
};

export default TopTranding;
import React, { useState, useEffect, useContext } from "react";
import { ShoppingCart, Heart } from "lucide-react";
import "./Productpage.css";
import Header from "../../components/header/Header";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../components/context/CartContext";
import { SearchContext } from "../../context/SearchContext";

const Productpage = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const subSubcategoryId = queryParams.get("subSubcategoryId");
  const subcategoryId = queryParams.get("subcategoryId");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      console.log("API Response:", data);
      if (data.success) {
        console.log("Fetched Products:", data.data);
        setProducts(data.data);
      } else {
        console.error("API returned unsuccessful:", data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (slug) => {
    navigate(`/product/${slug}`);
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  };

  const handleAddToCart = async (product) => {
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        images: product.images ? product.images.split(",")[0] : "/placeholder.jpg",
      };
      const success = await addToCart(cartProduct);
      if (success) {
        alert("Product added to cart successfully!");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart");
    }
  };

  // Helper function to extract meaningful keywords from search term
  const getSearchKeywords = (term) => {
    const stopWords = ["i", "am", "looking", "for", "a", "an", "the", "in", "on", "at"];
    return term
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));
  };

  const filteredProducts = products.filter((product) => {
    // Get keywords from search term
    const keywords = getSearchKeywords(searchTerm);

    // If no keywords, show all products (or apply other filters)
    const matchesSearch =
      keywords.length === 0 ||
      keywords.some((keyword) =>
        (product.name && product.name.toLowerCase().includes(keyword)) ||
        (product.description && product.description.toLowerCase().includes(keyword))
      );

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    let matchesSubSubcategory = true;
    if (subSubcategoryId) {
      const subSubIdFromUrl = parseInt(subSubcategoryId, 10);
      const productSubSubId =
        product.sub_subcategory_id !== undefined &&
        product.sub_subcategory_id !== null
          ? Number(product.sub_subcategory_id)
          : null;
      matchesSubSubcategory = productSubSubId === subSubIdFromUrl;
      console.log("SubSubcategory Filter:", {
        productId: product.id,
        productSubSubId,
        subSubIdFromUrl,
        matchesSubSubcategory,
      });
    }

    let matchesSubcategory = true;
    if (subcategoryId) {
      const subIdFromUrl = parseInt(subcategoryId, 10);
      const productSubId =
        product.subcategory_id !== undefined && product.subcategory_id !== null
          ? Number(product.subcategory_id)
          : null;
      matchesSubcategory = productSubId === subIdFromUrl;
      console.log("Subcategory Filter:", {
        productId: product.id,
        productSubId,
        subIdFromUrl,
        matchesSubcategory,
      });
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubSubcategory &&
      matchesSubcategory
    );
  });

  const categories = [...new Set(products.map((p) => p.category))];

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="app-container1">
      <Header setSearchTerm={setSearchTerm} />
      <main className="main-content1">
        <div className="categories-container1">
          {/* Category buttons commented out as in original code */}
        </div>

        <div className="products-grid1">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card1"
                onClick={() => handleNavigate(product.slug)}
              >
                <div className="product-image-container1">
                  <img
                    src={
                      product.images && product.images.split(",")[0]
                        ? `http://localhost:5000/${product.images
                            .split(",")[0]
                            .trim()}`
                        : "/placeholder.jpg"
                    }
                    alt={product.name}
                    className="product-image1"
                  />
                  <div className="category-tag1">
                    <span>{product.category}</span>
                  </div>
                </div>

                <div className="product-details1">
                  <h3 className="product-title1">{product.name}</h3>
                  <div className="product-footer1">
                    <div className="price-container1">
                      <span className="current-price1">₹{product.price}</span>
                      {product.discount_percentage > 0 && (
                        <span className="original-price1">
                          <del>
                            ₹{(
                              product.price /
                              (1 - product.discount_percentage / 100)
                            ).toFixed(2)}
                          </del>
                        </span>
                      )}
                      {product.discount_percentage > 0 && (
                        <div className="discount-badge1">
                          ({product.discount_percentage}% OFF)
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="add-to-cart-button1"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-products1">
              No products found for this category, subcategory, or search term.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Productpage;
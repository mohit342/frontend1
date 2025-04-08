import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      const storedCartItems = JSON.parse(sessionStorage.getItem("guest_cart")) || [];
      setCartItems(storedCartItems);
    }
  }, []);

  const addToCart = async (product) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const newItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: product.quantity || 1,
        images: Array.isArray(product.images) ? product.images[0] : product.images,
      };

      if (user) {
        await axios.post("http://localhost:5000/api/cart/add", {
          userId: user.id,
          productId: product.id,
          quantity: product.quantity || 1,
        });
        const response = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
        setCartItems(response.data.data.items);
      } else {
        const updatedCart = [...cartItems];
        const existingItem = updatedCart.find((item) => item.id === product.id);

        if (existingItem) {
          existingItem.quantity += product.quantity || 1;
        } else {
          updatedCart.push(newItem);
        }

        sessionStorage.setItem("guest_cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, change) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const updatedCart = cartItems.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      if (user) {
        const item = updatedCart.find((item) => item.id === productId);
        await axios.put("http://localhost:5000/api/cart/update", {
          userId: user.id,
          productId,
          quantity: item.quantity,
        });
        const response = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
        setCartItems(response.data.data.items);
      } else {
        sessionStorage.setItem("guest_cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      if (user) {
        await axios.post("http://localhost:5000/api/cart/remove", {
          userId: user.id,
          productId,
        });
        const response = await axios.get(`http://localhost:5000/api/cart/${user.id}`);
        setCartItems(response.data.data.items);
      } else {
        const updatedCart = cartItems.filter((item) => item.id !== productId);
        sessionStorage.setItem("guest_cart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotals = () => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    return { itemCount, subtotal };
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        getCartTotals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
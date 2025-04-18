import React, { useState, useEffect, useContext } from "react";
import "./header.css";
import logo from "../../assets/logo.png";
import { IoPerson } from "react-icons/io5";
import cart from "../../assets/cart.png";
import home from "../../assets/homep.png";
import product from "../../assets/product.png";
import learn from "../../assets/learn.png";
import resouce from "../../assets/resource.png";
import purcase from "../../assets/purchase.png";
import company from "../../assets/company.png";
import { Drawer, IconButton, Link } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { ShoppingCart } from 'lucide-react';
// import { Link } from "react-router-dom";
import List from "@mui/material/List";
import { SearchContext } from "../../context/SearchContext";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import DropMenu from "../DropMenu/DropMenu";
import DropMenu1 from "../DropMenu1/DropMenu1";
import DropMenu3 from "../DropMenu3/DropMenu3";
import DropMenu4 from "../DropMenu4/DropMenu4";
import DropMenu5 from "../DropMenu5/DropMenu5";
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';


import DropMenu6 from "../DropMenu6/DropMenu6";
const Header = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const navigate = useNavigate();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [openMenus, setOpenMenus] = useState({});
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  // Inside your Header component:
  const { getCartTotals } = useCart();
  const { itemCount } = getCartTotals();
  const { cartItems, setCartItems } = useCart();
  const sessionCartKey = "guest_cart";
  const handleSearch = () => {
    setSearchTerm(localSearchTerm); // Update the global search term
    navigate("/product"); // Navigate to the Productpage
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };



  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set user data from local storage
    }
  }, []);

  // Update cart count when component mounts and when localStorage changes
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      // Count total quantity of all items
      const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
      setCartCount(totalItems);
    };

    // Initial count
    updateCartCount();

    // Listen for storage events to update cart count when changes happen in other components
    window.addEventListener('storage', updateCartCount);

    // Custom event for cart updates within the same window
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  // Sample multi-level menu data
  const menuItems = [
    {
      label: "Home",
      icon: <img src={home} alt="" style={{ width: "20px", height: "20px" }} />,
    },
    {
      label: "Shop Our Products",
      icon: <img src={product} alt="" style={{ width: "20px", height: "20px" }} />
      ,
      children: [
        {
          label: "Academic Materials",
          children: [
            {
              label: "Textbooks & Workbooks",
              children: [
                { label: "Core Subjects" },
                { label: "Supplementary resources" },
              ]
            },
            {
              label: "Reference Books",
              children: [
                { label: "Dictionaries & Encyclopedias" }

              ]
            },
            {
              label: "Educational Software ",
              children: [
                { label: "Learning Platforms" },
                { label: "Educational Games" },

              ]
            },

          ],
        },

        {
          label: "School Supplies",
          children: [
            {
              label: "Stationery",
              children: [
                { label: "Writing Instruments" },
                { label: "Notebooks & Paper" },
              ]
            },
            {
              label: "Classroom Supplies",
              children: [
                { label: "Art Supplies" },
                { label: "Whiteboards & Markers" },
                { label: "Charts & posters" },
                { label: "Classroom Decor" }

              ]
            },


          ],
        },
        {
          label: "Learning & teaching Aids",
          children: [
            {
              label: "Manipulatives",
              children: [
                { label: "Math manipulatives" },
                { label: "Science kits" },
              ]
            },



          ],
        },
        {
          label: "Toys & Games",
          children: [
            {
              label: "educational Toys",
              children: [
                { label: "Puzzles & Games" },
                { label: "building Toys" },
              ]
            },
            {
              label: "toy & game",
              children: [
                { label: "Soft Toys" },
                { label: "Outdoor play Equipment" }

              ]
            },


          ],
        },
        {
          label: "play School Supplies",
          children: [
            {
              label: "Furniture",
              children: [
                { label: "Tables & Chairs" },
                { label: "Storage Solution" },
              ]
            },
            {
              label: "Learning Materials",
              children: [
                { label: "Flashcards & cards" },
                { label: "Activity Books 7 Workbooks" }

              ]
            },


          ],
        },
        {
          label: "Class Projects",
          children: [
            {
              label: "Subject Projects"

            },



          ],
        },

      ],
    },
    {
      label: "Shop by Learning",
      icon: <img src={learn} alt="" style={{ width: "20px", height: "20px" }} />,
    },
    {
      label: "Ideas and Resources",
      icon: <img src={resouce} alt="" style={{ width: "20px", height: "20px" }} />,
      children: [
        { label: "Daily Planner" },
        { label: "Digital Content" },
        { label: "Activities" },
        { label: "Worksheets" },
        { label: "Talent Box" },
        { label: "Teacher Manual" },
        { label: "Question Bank" },
      ],
    },
    {
      label: "Bulk Purchase",
      icon: <img src={purcase} alt="" style={{ width: "20px", height: "20px" }} />,
      children: [
        { label: "Fill the Form" }

      ],
    },
    {
      label: "Company",
      icon: <img src={company} alt="" style={{ width: "20px", height: "20px" }} />,
      children: [
        { label: "About Us" },
        { label: "Our Leaders" },
        { label: "Career" },
        { label: "Testimonials" }

      ],
    },
    {
      label: " Login/SignUp",
      icon: <IoPerson style={{ fontSize: "20px" }} />
      ,
    },

    {
      label: "Cart",
      icon: <ShoppingCart style={{ width: "20px", height: "20px" }} />,
    },
  ];

  // Toggle submenu expansion
  const handleMenuClick = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };



  // Recursive function to render menu items
  const renderMenuItems = (items) => {
    return items.map((item, index) => (
      <div key={index}>
        <ListItem button onClick={() => handleMenuClick(item.label)}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
          {item.children &&
            (openMenus[item.label] ? <ExpandLess /> : <ExpandMore />)}
        </ListItem>
        {item.children && (
          <Collapse in={openMenus[item.label]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {renderMenuItems(item.children)}
            </List>
          </Collapse>
        )}
      </div>
    ));
  };
  const logout = () => {
    localStorage.removeItem("user"); // Remove user session
    sessionStorage.removeItem(sessionCartKey); // Clear guest cart
    if (typeof setCartItems === "function") {
      setCartItems([]); // Reset cart context only if the function exists
    }

    navigate("/"); // Redirect to home
  };


  return (
    <div className="home-container">
      <div id="strip">
        <p>
          Welcome to <strong>Mittsure!</strong>
        </p>
      </div>
      <div className="search">
        <Link href="/" > <img src={logo} alt="logo" /></Link>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            onKeyUp={handleSearch}
          />
        </div>

        {user ? (
          <div className="user-info1">
            <DropMenu6 user={user} setUser={setUser} />
          </div>
        ) : (
          <Link href="/user/login">Login/SignUp</Link>
        )}
        <div className="cart">
          <div className="wishlist-icon-container">
            <Link href="/profilepage?tab=wishlist">
              <Heart className="wishlist-icon" />
            </Link>

          </div>
          <div className="cart-icon-container">
            <Link href="/cart">
              <ShoppingCart className="cart-icon" />
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}

            </Link>
          </div>
        </div>
        <div className="hamburger">
          <IconButton
            onClick={() => setIsDrawerOpen(true)}
            size="large"
            edge="start"
            color="inherit"
            aria-label="logo"
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="right"
            open={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            classes={{ paper: "custom-drawer" }}
            sx={{ overflow: "auto", width: "280px", "& .MuiDrawer-paper": { width: "280px" } }}
          >
            <div className="title1">
              <p>Menu</p>
              <IconButton onClick={() => setIsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <Divider />
            <List>{renderMenuItems(menuItems)}</List>
          </Drawer>
        </div>
      </div>
      <div className="nav">
        <ul className="nav-links">
          <div className="menu-pic">
            <img src={product} alt="" />
            <li>
              <DropMenu1 />
            </li>
          </div>
          <div className="menu-pic">
            <img src={learn} alt="" />
            <li>
              <DropMenu />
            </li>
          </div>
          <div className="menu-pic">
            <img src={resouce} alt="" />
            <li>
              <DropMenu3 />
            </li>
          </div>
          <div className="menu-pic">
            <img src={purcase} alt="" />
            <li>
              <DropMenu4 />
            </li>
          </div>
          <div className="menu-pic">
            <img src={company} alt="" />
            <li>
              <DropMenu5 />
            </li>
          </div>
        </ul>
      </div>
      <hr />
    </div>
  );
};

export default Header;
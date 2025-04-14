import React, { useState } from 'react';
import './DropMenu6.css'; // You'll need to create this CSS file
import { IoPerson } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom"; 

const DropMenu6 = ({ user, setUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user from storage
    navigate("/");
    setUser(null); // Reset user state
    setIsOpen(false); // Close dropdown
  };

  return (
    <div className="dropdown6">
      <div 
        className="dropdown6-toggle" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <IoPerson style={{ fontSize: "20px", marginRight: "5px" }} />
        <span>{user.firstName}</span>
      </div>
      
      {isOpen && (
        <div className="dropdown6-menu">
          <ul>
            <li>
              <a href="/profilepage">My Account</a>
            </li>
            {/* <Link href="/"> */}
            <li>
               
              <button onClick={handleLogout} style={{fontSize:"16px"}}>Logout</button> </li>
              {/* </Link> */}
           
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropMenu6;
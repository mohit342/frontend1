import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import './DropMenu3.css';
import { Link } from 'react-router-dom';

const DropMenu3 = () => {
  const [activeMenus, setActiveMenus] = useState([]);

  const handleMenuHover = (menuId) => {
    setActiveMenus(prev => {
      if (!prev.includes(menuId)) {
        return [...prev, menuId];
      }
      return prev;
    });
  };

  const handleMenuLeave = (menuId) => {
    setActiveMenus(prev => prev.filter(id => !id.startsWith(menuId)));
  };

  const isActive = (menuId) => activeMenus.includes(menuId);

  return (
    <div className="page-container">
      <nav className="dropdown-nav">
        <button 
          className={`menu-trigger ${isActive('main') ? 'active' : ''}`}
          onMouseEnter={() => handleMenuHover('main')}
          onMouseLeave={() => handleMenuLeave('main')}
        >
          <span>Ideas And Resources</span>
          <ChevronDown className="menu-arrow" />
        </button>

        <div 
          className={`menu-container ${isActive('main') ? 'show' : ''}`}
          onMouseEnter={() => handleMenuHover('main')}
          onMouseLeave={() => handleMenuLeave('main')}
        >
          {/* <div 
            className="menu-item submenu-trigger"
            onMouseEnter={() => handleMenuHover('Daily Planner')}
            onMouseLeave={() => handleMenuLeave('Daily Planner')}
          >
            <div className="menu-item-content">
              <span>Daily Planner</span>
            </div>
          </div> */}

          

          <div 
            className="menu-item submenu-trigger"
            onMouseEnter={() => handleMenuHover('Activities')}
            onMouseLeave={() => handleMenuLeave('Activities')}
          >
            <div className="menu-item-content">
              <span>Activities</span>
            </div>
          </div>
          <div 
            className="menu-item submenu-trigger"
            onMouseEnter={() => handleMenuHover('Question Bank')}
            onMouseLeave={() => handleMenuLeave('Question Bank')}
          >
            <div className="menu-item-content">
              <span>Question Bank</span>
            </div>
          </div>

          <div 
            className="menu-item submenu-trigger"
            onMouseEnter={() => handleMenuHover('Worksheets')}
            onMouseLeave={() => handleMenuLeave('Worksheets')}
          >
            <div className="menu-item-content">
              <span>Worksheets</span>
            </div>
          </div>

          <div 
            className="menu-item submenu-trigger"
            onMouseEnter={() => handleMenuHover('Talent Box')}
            onMouseLeave={() => handleMenuLeave('Talent Box')}
          >
            <div className="menu-item-content">
              <span>
            <Link to="https://nice-wiles.103-172-92-24.plesk.page/" target="_blank">Talent Box</Link></span>
            </div>
          </div>

          {/* <div 
            className="menu-item submenu-trigger"
            onMouseEnter={() => handleMenuHover('Teacher Manual')}
            onMouseLeave={() => handleMenuLeave('Teacher Manual')}
          >
            <div className="menu-item-content">
              <span>Teacher Manual</span>
            </div>
          </div> */}
          <div 
            className="menu-item submenu-trigger"
            onMouseEnter={() => handleMenuHover('Digital Content')}
            onMouseLeave={() => handleMenuLeave('Digital Content')}
          >
            <div className="menu-item-content">
              <span>
            <Link to="https://nice-wiles.103-172-92-24.plesk.page/" target="_blank">Digital Content</Link></span>
            </div>
          </div>

         
        </div>
      </nav>
    </div>
  );
};

export default DropMenu3;
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="app-logo">
      <Link to="/">
        <img src="/logo.png" alt="Morkan Logo" className="logo-image" />
        <span className="logo-text">Morkan</span>
      </Link>
    </div>
  );
};

export default Header; 